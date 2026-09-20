<?php

namespace App\Services\SignUp;

use App\Enums\RoleEnum;
use App\Mail\ConfirmationCode;
use App\Models\Entity;
use App\Models\EntityContract;
use App\Models\Order;
use App\Models\Plan;
use App\Models\UserConfirmationCode;
use App\Models\UserHasTermAndCondition;
use App\Services\Entity\UpdateEntityService;
use App\Services\EntityConfig\UpdateEntityConfigService;
use App\Services\User\CreateUserService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SignUpService
{
    public function execute($userData)
    {
        $code = rand(1000, 9999);
        
        $user = null;

        if (!$this->verifyRecaptcha($userData['recaptcha_response'])) {
            return null;
        }
        
        DB::transaction(function () use (&$user, $userData, $code) {
            
            $plan = Plan::find($userData['plan_id']);
            $isFree = $plan->monthly_value == 0 && $plan->annual_value == 0;
            $userData['role_id'] = $isFree ? RoleEnum::ENTITY->value : RoleEnum::LEAD->value;

            $user = $this->createUser($userData);
            
            Order::create([
                'user_id' => $user->id,
                'plan_version_id' => $plan->latestVersion->id,
                'value' => $userData['periodicity'] == 'monthly' ? $plan->monthly_value : $plan->annual_value,
                'periodicity' => $userData['periodicity'],
                'status' => $isFree ? 'completed' : 'pending'
            ]);

            $this->createEntity($user, $userData['business_segment_id'] ?? null);

            // UserConfirmationCode::create([
            //     'code' => $code,
            //     'user_id' => $user?->id,
            //     'verified' => false
            // ]);

            UserHasTermAndCondition::create([
                'user_id' => $user->id,
                'term_id' => $userData['term_id']
            ]);
        });

        //Mail::to($user?->email)->send(new ConfirmationCode($user, $code));

        return [
            'user' => $user,
            "token" => $user?->createToken($user?->email)->plainTextToken
        ];
    }

    private function createUser($userData)
    {   
        $createUserService = new CreateUserService();

        return $createUserService->execute($userData);
    }

    private function createEntity(&$user, $businessSegmentId = null)
    {
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

        $updateEntityConfigService = new UpdateEntityConfigService();
        
        $entity = Entity::create([
            'name' => $user->name,
            'email' => '',
            'cnpj' => '',
            'business_segment_id' => $businessSegmentId
        ]);
        
        $user->load($loads);

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
    
        $user->entity_id = $entity->id;
        $user->save();
        $validated['config']['main_user_id'] = $user->id;
        // 🔹 Atualiza as configurações da entidade utilizando o service correto
        $configData = [
            'primary_color' => '',
            'secondary_color' => '',
            'main_user_id' => $user->id
        ];
        $config = $updateEntityConfigService->execute($configData, $entity->config_id);
        $entity->config_id = $config->id;
        $entity->save();

        $user->load($loads);

        $user->setAppends(['is_available_for_upgrade']);

        return $user;
    }

    private function verifyRecaptcha($recaptchaResponse)
    {
        $data = [
            'secret' => env('GOOGLE_RECAPTCHA_SECRET_KEY'),
            'response' => $recaptchaResponse
        ];
        $options = [
            'http' => [
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($data)
            ]
        ];
        $context  = stream_context_create($options);
        $result = file_get_contents(env('GOOGLE_RECAPTCHA_BASE_API'). '/siteverify', false, $context);
        $recaptcha_data = json_decode($result);

        return $recaptcha_data->success && $recaptcha_data->score >= 0.5;
    }
}
