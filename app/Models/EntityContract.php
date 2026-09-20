<?php

namespace App\Models;

use App\Observers\EntityContractObserver;
use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy([EntityContractObserver::class])]
class EntityContract extends Model
{
    use HasFilters;
    
    protected $fillable = [
        'entity_id',
        'plan_version_id',
        'activation_date',
        'expiration_date',
        'cancelation_date',
        'due_date',
        'value',
        'periodicity',
        'registered_by',
        'payment_form',
        'upgrade_contract_id',
        'status',
        'mercadopago_preapproval_id',
        'description_cancellation',
        'description_finalization',
        'order_id',
        'external_reference'
    ];

    protected $casts = [
        'activation_date' => 'date',
        'expiration_date' => 'date',
        'cancelation_date' => 'date',
        'value' => 'integer',
        'due_date' => 'string',
    ];

    public function planVersion(): BelongsTo
    {
        return $this->belongsTo(PlanVersion::class, 'plan_version_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
