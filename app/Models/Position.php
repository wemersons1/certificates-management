<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Position extends Model
{
    use SoftDeletes, HasFilters;

    protected $fillable = [
        'name',
        'description',
        'entity_id'
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

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'position_has_courses');
    }
}
