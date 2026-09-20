<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Observers\PlanVersionObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
#[ObservedBy([PlanVersionObserver::class])]class PlanVersion extends Model
{
    protected $fillable = [
        'name',
        'monthly_value',
        'annual_value',
        'image',
        'quantity_days',
        'quantity_certificates',
        'plan_id',
        'mercadopago_preapproval_plan_id'
    ];

    public function benefits(): BelongsToMany
    {
        return $this->belongsToMany(PlanBenefit::class, 'plan_has_benefits', 'plan_version_id', 'benefit_id');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }
}
