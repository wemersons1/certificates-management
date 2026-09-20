<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Employee extends Model
{
    use HasFilters, SoftDeletes;

    protected $fillable = [
        'active',
        'external_id',
        'name',
        'email',
        'cpf',
        'rg',
        'emitting_organ',
        'birthday',
        'phone',
        'cellphone',
        'zip_code',
        'street',
        'number',
        'complement',
        'neighborhood',
        'state_id',
        'city_id',
        'entity_id',
        'company_id',
        'gender_id',
        'position',
        'machines_operated'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            $userLogged = Auth::user();
            if ($userLogged && $userLogged->entity_id) {
                $item->entity_id = $userLogged->entity_id;
            }
        });
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class)->withTrashed();
    }

    public function gender(): BelongsTo
    {
        return $this->belongsTo(Gender::class);
    }
}
