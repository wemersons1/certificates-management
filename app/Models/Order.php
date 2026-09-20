<?php

namespace App\Models;

use App\Observers\OrderObserver;
use App\Services\MercadoPago\MercadoPagoService;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy([OrderObserver::class])]
class Order extends Model
{
    protected $fillable = [
        'user_id',
        'plan_version_id',
        'value',
        'status',
        'periodicity',
        'payment_form',
        'mercadopago_preapproval_id',
        'external_reference'
    ];

    public function planVersion()
    {
        return $this->belongsTo(PlanVersion::class, 'plan_version_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getLastOrderPaymentAttribute()
    {
        $orderPayment = OrderPayment::where('order_id', $this->id)
        ->orderBy('created_at', 'DESC')
        ->first();

        if ($orderPayment?->mercadopago_operation_id) {
            $mercadopagoService = new MercadoPagoService();
            $payment = $mercadopagoService->getPayment($orderPayment->mercadopago_operation_id);
            if(isset($payment['status'])) {
                $orderPayment->payment_status = $payment['status'];
                $orderPayment->save();
            }
        }
        
        return $orderPayment;
    }

    public function contract()
    {
        return $this->hasOne(EntityContract::class, 'order_id');
    }
}
