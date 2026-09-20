<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class PresenceList extends Model
{
    use HasFilters;

    protected $fillable = [
        'number_of_hours_studied',
        'course_period',
        'course_id',
        'presence_list_template_version_id',
        'entity_id',
        'city_id',
        'uuid'
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

    public function instructors(): BelongsToMany
    {
        return $this->belongsToMany(Instructor::class, 'presence_list_has_instructors');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'presence_list_id', 'id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function presence_list_template()
    {
        return $this->belongsTo(DocumentTemplateVersion::class, 'presence_list_template_version_id');
    }
}
