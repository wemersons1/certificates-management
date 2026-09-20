<?php

namespace App\Models;

use App\Observers\EntityObserver;
use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([EntityObserver::class])]
class Entity extends Model
{
    use HasFilters, HasFactory, SoftDeletes;
    
    protected $with = ['businessSegment'];

    protected $fillable = [
        'name',
        'email',
        'cnpj',
        'config_id',
        'notification_config_email_id',
        'notification_config_whatsapp_id',
        'zip_code',
        'street',
        'number',
        'complement',
        'neighborhood',
        'state_id',
        'city_id',
        'business_segment_id',
        'registration_completed',
    ];

    public function config()
    {
        return $this->belongsTo(EntityConfig::class, 'config_id');
    }

    public function notificationConfigEmail()
    {
        return $this->belongsTo(NotificationTemplateConfig::class, 'notification_config_email_id');
    }

    public function notificationConfigWhatsapp()
    {
        return $this->belongsTo(NotificationTemplateConfig::class, 'notification_config_whatsapp_id');
    }

       public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function businessSegment(): BelongsTo
    {
        return $this->belongsTo(\App\Models\BusinessSegment::class, 'business_segment_id');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(EntityContract::class)->orderBy('id', 'DESC');
    }

    public function currentContract(): HasOne
    {
        return $this->hasOne(EntityContract::class, 'entity_id')->latestOfMany();
    }
}
