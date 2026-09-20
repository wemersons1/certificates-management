<?php

namespace App\Models;

use App\Observers\OrderPaymentObserver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
#[ObservedBy([OrderPaymentObserver::class])]

class OrderPayment extends Model
{
    protected $fillable = [
        'order_id',
        'value',
        'payment_form',
        'payment_status',
        'reference',
        'due_date',
        'mercadopago_operation_id',
        'mercadopago_operation_type',
        'mercadopago_status_detail',
        'mercadopago_date_created',
        'mercadopago_date_approved',
        'mercadopago_date_of_expiration',
        'mercadopago_money_release_date',
        'mercadopago_payment_method_id',
        'mercadopago_installments',
        'mercadopago_pix_qrcode',
        'mercadopago_ticket_url',
        'mercadopago_copy_and_past',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
