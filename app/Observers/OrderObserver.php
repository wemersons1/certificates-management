<?php

namespace App\Observers;

use App\Models\EntityContract;
use App\Models\Order;
use App\Services\MercadoPago\MercadoPagoService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    public function creating(Order $order): void
    {
        if ($order->status === 'pending' && $order->user->entity_id) {
            Order::where('status', 'pending')
            ->where('user_id', $order->user_id)
            ->where('id', '<>', $order->id)
            ->update(['status' => 'cancelled']);
        }
    }

    public function updated(Order $order): void
    {
        if ($order->status === 'completed' && $order->user->entity_id) {
            $entityContractsActive = EntityContract::with(['order'])
                ->where('entity_id', $order->user->entity_id)
                ->whereHas('order', function($query) {
                    $query->whereNotNull('mercadopago_preapproval_id');
                })
                ->where('status', 'active')
                ->where('order_id', '<>', $order->id)
                ->get();

            $this->cancelSubscriptionMercadoPago($entityContractsActive);

            EntityContract::create([
                'entity_id' => $order->user->entity_id,
                'plan_version_id' => $order->plan_version_id,
                'activation_date' => date('Y-m-d H:i:s'),
                'expiration_date' => Carbon::now()->addDays($order->planVersion->quantity_days)->format('Y-m-d'),
                'value' =>  $order->value,
                'periodicity' => $order->periodicity,
                'registered_by' => $order->user->id,
                'payment_form' => $order->payment_form,
                'status' => 'active',
                'order_id' => $order->id,
                'mercadopago_preapproval_id' => $order->mercadopago_preapproval_id,
                'external_reference' => $order->external_reference
            ]);

            Order::where('status', 'pending')
            ->where('user_id', $order->user_id)
            ->where('id', '<>', $order->id)
            ->update(['status' => 'cancelled']);
        }
    }

    public function cancelSubscriptionMercadoPago($entityContractsActive)
    {
        foreach ($entityContractsActive as $contract) {
            try {
                $mercadopagoService = new MercadoPagoService();
                $mercadopagoService->cancelSubscription($contract->order->mercadopago_preapproval_id);
                $contract->description_cancellation = 'Upgrade de plano';
                $contract->cancelation_date = date('Y-m-d H:i:s');
                $contract->saveQuietly();
            }catch(\Exception $e) {
                Log::error('ERRO AO CANCELAR RECORRÊNCIA: '. $e->getMessage());
            }
        }
    }
}
