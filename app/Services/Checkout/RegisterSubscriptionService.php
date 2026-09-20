<?php

namespace App\Services\Checkout;

use App\Helpers\AppHelper;
use App\Models\Order;
    use App\Models\PlanVersion;
use App\Services\MercadoPago\MercadoPagoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
class RegisterSubscriptionService
{
    public function __construct()
    {
    }

    public function execute($data)
    {
        $userLogged = Auth::user();

        return DB::transaction(function ()use ($data, $userLogged) {
            $data['user_id'] = $userLogged->id;
            $planVersion = PlanVersion::findOrFail($data['plan_version_id']);
            $data['value'] = AppHelper::formatCentsToFloat($planVersion->monthly_value);
            $data['plan_name'] = $planVersion->name;
            $data['preapproval_plan_id'] = $planVersion->mercadopago_preapproval_plan_id;
            
            $order = Order::create([
                'periodicity' => $data['periodicity'],
                'plan_version_id' => $data['plan_version_id'],
                'status' => 'pending',
                'value' => $planVersion->monthly_value,
                'payment_form' => 'credit_recurrence',
                'user_id' => $data['user_id']
            ]);  

            $data['order_id'] = $order->id;
            
            $mercadopagoService = new MercadoPagoService();
            $subscriptionData = $this->getSubscriptionData($data);
            $subscription = $mercadopagoService->createSubscription($subscriptionData);

            $order->mercadopago_preapproval_id = $subscription['id'];
            $order->external_reference = $subscriptionData['external_reference'];
            $order->save();

            return $order;
        });
    }

    private function getSubscriptionData($data): array
    {
        $userLogged = Auth::user();
        $backUrl = 'https://www.emitircertificados.com.br';

          $data = [
            "preapproval_plan_id" => $data['preapproval_plan_id'],
            "reason" => "{$data['plan_name']} - {$userLogged->name} - {$data['order_id']}",
            "payer_email" => $userLogged->email,
            "card_token_id" => $data['token'],
            "external_reference" => Str::uuid(),
            "auto_recurring" => [
                "frequency" => 1,
                "frequency_type" => "months",
                "start_date" => date('Y-m-d H:i:s'),
                "transaction_amount" => $data['value'],
                "currency_id" => "BRL",
                "billing_day" => $data['billing_day'] ?? 10,
                "billing_day_proportional" => true,
            ],
            "back_url" => $backUrl,
            "status" => "active",
        ];
    
        if(request()->secure()) {
            $backUrl = env('APP_URL');
            $notification_url = env('APP_URL').'/api/syncronize-status-payment';
            $data['notification_url'] = $notification_url;
        }

        return $data;
    }
}

