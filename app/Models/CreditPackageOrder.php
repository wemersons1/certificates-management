<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditPackageOrder extends Model
{
    protected $fillable = [
        'user_id',
        'credit_package_id',
        'value',
        'payment_form',
        'status',
        'mercadopago_operation_id',
        'mercadopago_operation_type',
        'payment_status',
        'mercadopago_status_detail',
        'mercadopago_date_created',
        'mercadopago_date_approved',
        'mercadopago_date_of_expiration',
        'mercadopago_pix_qrcode',
        'mercadopago_copy_and_past',
        'mercadopago_ticket_url',
        'mercadopago_payment_method_id',
        'mercadopago_installments',
        'credits_granted',
    ];

    protected $casts = [
        'value'                        => 'float',
        'credits_granted'              => 'boolean',
        'mercadopago_date_created'     => 'datetime',
        'mercadopago_date_approved'    => 'datetime',
        'mercadopago_date_of_expiration' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creditPackage(): BelongsTo
    {
        return $this->belongsTo(CreditPackage::class);
    }
}
