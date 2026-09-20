<?php

namespace App\Models;


use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use SoftDeletes, HasFilters;

    protected $fillable = [
        'name',
        'active'
    ];

    protected $appends = [
        'monthly_value',
        'annual_value',
        'image',
        'quantity_days',
        'quantity_certificates',
        'mercadopago_preapproval_plan_id',
        'benefits'
    ];

    public function versions(): HasMany
    {
        return $this->hasMany(PlanVersion::class);
    }

    public function latestVersion()
    {
        return $this->hasOne(PlanVersion::class, 'plan_id', 'id')->latestOfMany();
    }

    public function getTemplateAttribute()
    {
        return $this->latestVersion?->template;
    }

    public function getMonthlyValueAttribute()
    {
        return $this->latestVersion?->monthly_value;
    }

    public function getAnnualValueAttribute()
    {
        return $this->latestVersion?->annual_value;
    }

    public function getImageAttribute()
    {
        return $this->latestVersion?->image;
    }

    public function getQuantityDaysAttribute()
    {
        return $this->latestVersion?->quantity_days;
    }

    public function getQuantityCertificatesAttribute()
    {
        return $this->latestVersion?->quantity_certificates;
    }

    public function getMercadopagoPreapprovalPlanIdAttribute()
    {
        return $this->latestVersion?->mercadopago_preapproval_plan_id;
    }

    public function getBenefitsAttribute()
    {
        return $this->latestVersion?->benefits;
    }
}
