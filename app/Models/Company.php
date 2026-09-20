<?php

namespace App\Models;

use App\Observers\CompanyObserver;
use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

#[ObservedBy([CompanyObserver::class])]

class Company extends Model
{
    use HasFilters, HasFactory, SoftDeletes;
    
    protected $with = ['entity', 'city', 'state'];
    
    protected $fillable = [
        'name',
        'email',
        'cnpj',
        'entity_id',
        'external_id',
        'phone',
        'cellphone',
        'zip_code',
        'street',
        'number',
        'complement',
        'neighborhood',
        'state_id',
        'city_id',
        'active'
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
        return $this->belongsTo(City::class, 'city_id');
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class, 'state_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'company_id', 'id');
    }

    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'employee_has_companies');
    }

    public function entity(): BelongsTo
    {
        return $this->belongsTo(Entity::class);
    }
}
