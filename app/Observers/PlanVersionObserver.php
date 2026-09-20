<?php

namespace App\Observers;

use App\Helpers\AppHelper;
use App\Models\PlanVersion;
use App\Services\MercadoPago\MercadoPagoService;

class PlanVersionObserver
{
    public function created(PlanVersion $planVersion): void
    {
        if ($planVersion->monthly_value) {
            $mercadopagoService = new MercadoPagoService();
            $preApprovalPlan = $mercadopagoService->createPreApprovalPlan($this->preApprovalPlanData($planVersion));
            $planVersion->mercadopago_preapproval_plan_id = $preApprovalPlan['id'];
            $planVersion->save();
        }
    }

    private function preApprovalPlanData($planVersion): array
    {
        $backUrl = 'https://www.emitircertificados.com.br';

        $data = [
            "back_url" => $backUrl,
            "reason" => "Plano: {$planVersion->plan_name} | Versão ID: {$planVersion->id}",
            "auto_recurring" => [
                "frequency" => 1,
                "frequency_type" => "months",
                "start_date" => date('Y-m-d H:i:s'),
                "transaction_amount" => AppHelper::formatCentsToFloat($planVersion->monthly_value),
                "currency_id" => "BRL",
                "billing_day" => 10,
                "billing_day_proportional" => true,
            ],
            "status" => "active",
        ];

        if(request()->secure()) {
            $backUrl = env('APP_URL');
            $notification_url = env('APP_URL').'/api/v1/sinchronize-status-subscription';
            $data['notification_url'] = $notification_url;
        }

        return $data;
    }
}
