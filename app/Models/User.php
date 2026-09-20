<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\RoleEnum;
use App\Enums\RegistrationOriginEnum;
use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasFilters, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'email',
        'password',
        'role_id',
        'entity_id',
        'is_main_user',
        'phone',
        'welcome_message_sent',
        'email_verified_at',
        'registration_origin'
    ];
    
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $with = [
        'role',
        'company',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            $userLogged = Auth::user();
    
            if ($userLogged && $userLogged->entity_id) {
                $item->entity_id = $userLogged->entity_id;
            }

            if ($userLogged && $userLogged->company_id) {
                $item->company_id = $userLogged->company_id;
            }
        });

        static::updating(function ($item) {
            if ($item->role_id != RoleEnum::COMPANY->value) {
                $item->company_id = null;
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'registration_origin' => RegistrationOriginEnum::class,
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function entity(): BelongsTo
    {
        return $this->belongsTo(Entity::class, 'entity_id');
    }

    public function isEntity()
    {
        return $this->role_id == RoleEnum::ENTITY->value;
    }

    public function isCompany()
    {
        return $this->role_id == RoleEnum::COMPANY->value;
    }

    public function isMaster()
    {
        return $this->role_id == RoleEnum::MASTER->value;
    }

    public function isEmployee()
    {
        return $this->role_id == RoleEnum::EMPLOYEE->value;
    }


    public function isLead()
    {
        return $this->role_id == RoleEnum::LEAD->value;
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(UserPermission::class, 'user_has_permissions', 'user_id', 'permission_id');
    }

    public function menuItems(): BelongsToMany
    {
        return $this->belongsToMany(SystemMenu::class, 'user_has_system_menu', 'user_id', 'menu_id');
    }

    public function currentOrder()
    {
        return $this->hasOne(Order::class, 'user_id', 'id')->latestOfMany();
    }

    public function alreadContractedPlan(): bool
    {
        $userLogged = Auth::user();
        
        return Order::where('user_id', $userLogged?->id)
        ->where('status', 'completed')
        ->exists();
    }

    public function getIsAvailableForUpgradeAttribute()
    {
        $userLogged = Auth::user();
     
        if (
            $userLogged &&
            $userLogged->isEntity() &&
            $userLogged->id === $userLogged?->entity?->config?->main_user_id) {
            $plans = collect(Plan::all()->toArray());
       
            $baseValue = $userLogged?->entity?->currentContract?->planVersion->plan->monthly_value ?? 0;
                
            return $plans->where('monthly_value', '>', $baseValue)->isNotEmpty();
        }

        return false;
    }
}
