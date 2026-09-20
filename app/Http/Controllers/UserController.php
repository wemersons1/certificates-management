<?php

namespace App\Http\Controllers;

use App\Enums\RoleEnum;
use App\Http\Requests\Me\UpdateMeRequest;
use App\Http\Requests\SignUpRequest;
use App\Http\Requests\User\CreateOrUpdateUserRequest;
use App\Http\Requests\User\IndexUserRequest;
use App\Mail\ConfirmationCode;
use App\Mail\SendMailNewUserToManagers;
use App\Models\EntityContract;
use App\Models\User;
use App\Models\Entity;
use App\Models\UserConfirmationCode;
use App\Models\UserPermission;
use App\Services\Entity\UpdateEntityService;
use App\Services\EntityConfig\UpdateEntityConfigService;
use App\Services\MercadoPago\MercadoPagoService;
use App\Services\Session\DestroySessionService;
use App\Services\SignUp\SignUpService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexUserRequest $request)
    {  
        $filters = $request->validated();

        $users = User::with(['entity.currentContract'])->myScope($filters);

        if (isset($filters['contract_status']) && in_array($filters['contract_status'], ['active', 'cancelled'], true)) {
            $users->whereHas('entity.currentContract', function ($query) use ($filters) {
                $query->where('status', $filters['contract_status']);
            });
        }

        return $users->paginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateOrUpdateUserRequest $request)
    {
        $validated = $request->validated();
        $segmentId = $validated['business_segment_id'] ?? null;
        unset($validated['business_segment_id']);

        $user = User::with(['permissions', 'menuItems'])->create($validated);
        $user->permissions()->sync($validated['permissions']);

        $user->menuItems()->sync($validated['menu_items'] ?? []);

        // If a business_segment_id was provided along with entity_id, update the entity
        if (!empty($segmentId) && !empty($validated['entity_id'])) {
            $entity = Entity::find($validated['entity_id']);
            if ($entity) {
                $entity->business_segment_id = $segmentId;
                $entity->save();
            }
        }

        return $user;
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return $user->load(['entity', 'permissions', 'menuItems']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreateOrUpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();
        $segmentId = $validated['business_segment_id'] ?? null;
        unset($validated['business_segment_id']);
        $user->permissions()->sync($validated['permissions']);
        $user->menuItems()->sync($validated['menu_items'] ?? []);
        
        $user->update($validated);

        // If a business_segment_id was provided along with entity_id, update the entity
        if (!empty($segmentId) && !empty($validated['entity_id'])) {
            $entity = Entity::find($validated['entity_id']);
            if ($entity) {
                $entity->business_segment_id = $segmentId;
                $entity->save();
            }
        }

        return $user;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }

    /**
     * Mark welcome message as sent.
     */
    public function markWelcomeMessageSent(User $user)
    {
        $user->update(['welcome_message_sent' => true]);

        return response()->json(['message' => 'Welcome message marked as sent.']);
    }

    public function me()
    {
        $userLogged = Auth::user();
        $loads = [
            'entity.notificationConfigWhatsapp',
            'menuItems', 
            'entity.notificationConfigEmail',
            'permissions',
            'entity.state', 
            'entity.city', 
            'currentOrder',
            'entity.config',
            'entity.currentContract',
            'entity.contracts.planVersion',
            'entity.contracts.order',
            'entity.config.main_user'
        ];

        $userLogged->load($loads);

        $userLogged?->entity?->notificationConfigEmail?->setAppends(['is_verified']);

        $userLogged?->entity?->config?->setAppends(['logo_base64']);
        $userLogged->setAppends(['is_available_for_upgrade']);

        return $userLogged;
    }

    public function updateMe(UpdateMeRequest $request)
    {
        $validated = $request->validated();
     
        return DB::transaction(function () use ($validated) {
            $loads = [
                'entity.notificationConfigWhatsapp',
                'menuItems', 
                'entity.notificationConfigEmail',
                'permissions',
                'entity.state', 
                'entity.city', 
                'currentOrder',
                'entity.config',
                'entity.currentContract',
                'entity.contracts.planVersion',
                'entity.contracts.order',
                'entity.config.main_user',
                'role'
            ];
            $user = Auth::user();
       
            $userRequest = $validated['user'];

            if (isset($userRequest['password']) && strlen($userRequest['password'])) {
                $userRequest['password'] = Hash::make($userRequest['password']);
            } else {
                unset($userRequest['password']);
            }

            if (!$user->isLead() && (! $user->isEntity() || ($user->isEntity() && $user?->entity?->config?->main_user?->id != $user->id))) {
                $user->load($loads);
                return $user;
            }
           
            if ($user->isLead()) {
                 $userRequest['role_id'] = RoleEnum::ENTITY->value;
            }
     
            $user->update($userRequest);

            $updateEntityService = new UpdateEntityService();
            
            // 🔹 Atualiza a entidade principal
            $entity = $updateEntityService->execute($validated['entity'], $user->entity_id);
         
            if (is_null($user->entity_id) && $entity && $user->currentOrder->status === 'completed') {
                EntityContract::create([
                    'order_id' => $user->currentOrder->id,
                    'entity_id' => $entity->id,
                    'plan_version_id' => $user->currentOrder->plan_version_id,
                    'activation_date' => date('Y-m-d H:i:s'),
                    'expiration_date' => Carbon::now()->addDays($user->currentOrder->planVersion->quantity_days)->format('Y-m-d'),
                    'value' =>  $user->currentOrder->value,
                    'periodicity' => $user->currentOrder->periodicity,
                    'registered_by' => $user->id,
                    'status' => 'active',
                ]);
            }

            $user->entity_id = $entity->id;
            $user->save();
            $validated['config']['main_user_id'] = $user->id;
  
            $entity->save();

            $user->load($loads);
       
            $user->setAppends(['is_available_for_upgrade']);
            
            return $user;
        });
    }

    public function permissions()
    {
        return UserPermission::all();
    }

    public function signUp(SignUpRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $signUpService = new SignUpService();
                
                 /**
                 * The attributes that are mass assignable.
                 *
                 * @var User
                 */
                $user = $signUpService->execute($request->validated());

                if ($user) {
                    $emailsToNotify = config('app.emails_to_notify', []);
                    
                    Mail::to($emailsToNotify)
                        ->queue(new SendMailNewUserToManagers($user['user']));

                    return $user;
                }

                return response()->json([
                    'message' => 'Erro ao processar os dados',
                    'error' => "Erro ao realizar cadastro",
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            });

        } catch (\Exception $e) {
            Log::error('Erro ao processar cadastro: ' . $e->getMessage());

            return response()->json([
                'message' => 'Erro ao processar os dados',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function validateCode(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:4']
        ]);

        $userLogged = Auth::user();

        $userConfirmationCode = UserConfirmationCode::where('user_id', $userLogged->id)
        ->orderBy('id', 'desc')->first();

        if ($userConfirmationCode && $userConfirmationCode->code === $request->code) {
            $userLogged->email_verified_at = date('Y-m-d H:i:s');
            $userLogged->save();

            $destroySessionService = new DestroySessionService();

            $destroySessionService->execute($userLogged->id);
            $userLogged->load(['currentOrder']);

            return response()->json([
                "user" => $userLogged,
                "token" => $userLogged->createToken($userLogged->email)->plainTextToken
            ]);
        }

        return null;
    }

    public function resendConfirmationCode()
    {
        $userLogged = Auth::user();
        $code = rand(1000, 9999);

        UserConfirmationCode::create([
            'code' => $code,
            'user_id' => $userLogged?->id,
            'verified' => false
        ]);

        Mail::to($userLogged?->email)->send(new ConfirmationCode($userLogged, $code));

        return response()->json([
            'message' => 'Código reenviado com sucesso'
        ]);
    }
    
    public function cancelContract($id)
    {
        $userLogged = Auth::user();
        $validated = request()->validate([
            'description_cancellation' => 'nullable|string|max:2000',
        ]);

         $loads = [
            'entity.notificationConfigWhatsapp',
            'menuItems', 
            'entity.notificationConfigEmail',
            'permissions',
            'entity.state', 
            'entity.city', 
            'currentOrder',
            'entity.config',
            'entity.currentContract',
            'entity.contracts.planVersion',
            'entity.contracts.order'
        ];

        $entityContract = EntityContract::with(['order'])->myScope()->find($id);
        $descriptionCancellation = trim((string) ($validated['description_cancellation'] ?? ''));
        
        $entityContract->status = 'cancelled';
        $entityContract->description_cancellation = $descriptionCancellation !== ''
            ? $descriptionCancellation
            : 'CANCELADO PELO USUÁRIO';
        $entityContract->cancelation_date = date('Y-m-d H:i:s');
        $entityContract->saveQuietly();

        if ($entityContract->order->mercadopago_preapproval_id) {
            $mercadoPago = new MercadoPagoService();
            $mercadoPago->cancelSubscription($entityContract->order->mercadopago_preapproval_id);
        }

        $userLogged->load($loads);

        return $userLogged;
    }

    public function updateLogo(Request $request)
    {
        $userLogged = Auth::user();

        $updateEntityConfigService = new UpdateEntityConfigService();

        return $updateEntityConfigService->execute(['logo' => $request->logo], $userLogged->entity->config_id);
    }

    public function completeRegistration(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'cnpj' => 'nullable|string|max:20',
            'business_segment_id' => 'required|integer|exists:business_segments,id',
        ]);

        $user = Auth::user();

        // Update user phone
        $user->phone = $request->input('phone');
        $user->save();

        // Update entity details
        if ($user->entity) {
            $user->entity->name = $request->input('name');
            $user->entity->cnpj = $request->input('cnpj');
            if ($request->has('business_segment_id')) {
                $user->entity->business_segment_id = $request->input('business_segment_id');
            }
            $user->entity->registration_completed = true;
            $user->entity->save();
        }

        // Reload user with all relations
        $user->load([
            'entity.notificationConfigWhatsapp',
            'menuItems',
            'entity.notificationConfigEmail',
            'permissions',
            'entity.state',
            'entity.city',
            'currentOrder',
            'entity.config',
            'entity.currentContract',
            'entity.contracts.planVersion',
            'entity.contracts.order',
            'role'
        ]);

        return response()->json([
            'message' => 'Cadastro completo com sucesso',
            'user' => $user
        ]);
    }
}
