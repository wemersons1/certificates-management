<?php

namespace App\Observers;

use App\Models\EntityContract;
use App\Models\OrderPayment;
use App\Services\MercadoPago\MercadoPagoService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class OrderPaymentObserver
{
    public function updated(OrderPayment $orderPayment): void
    {
        if ($orderPayment->payment_status === 'approved') {
            $orderPayment->order->update(['status' => 'completed']);
        }
    }

    public function created(OrderPayment $orderPayment): void
    {
        if ($orderPayment->payment_form == 'pix' && $orderPayment->payment_status == 'pending') {
            $ordersPayments = OrderPayment::where('user_id', $orderPayment->order->user_id)
            ->where('payment_form', 'pix')
            ->where('payment_status', 'pending')
            ->where('id', '<>', $orderPayment->id)
            ->get();
            foreach ($ordersPayments as $payment) {
                $mercadoPagoService = new MercadoPagoService();
                $paymentMercadopago = $mercadoPagoService->cancelCharge($payment->mercadopago_operation_id);
                
                if(isset($mercadoPagoService['status'])) {
                    $payment->payment_status = $paymentMercadopago['status'];
                    $payment->save();
                }
            }
        }
    }
}
