<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Course extends Model
{
    use HasFactory, HasFilters, SoftDeletes;
    protected $table = 'courses';

    protected $fillable = [
        'name', 
        'number_of_hours_studied', 
        'entity_id',
        'certificate_id',
        'new_version'
    ];

    protected $casts = [
        'new_version' => 'boolean'
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

    public function entity()
    {
        return $this->belongsTo(Entity::class, 'entity_id');
    }

    public function certificateTemplate()
    {
        return $this->belongsTo(DocumentTemplate::class, 'certificate_id')->withTrashed();
    }

    public function authorizationTemplate()
    {
        return $this->belongsTo(DocumentTemplate::class, 'authorization_id')->withTrashed();
    }

    public function presenceListTemplate()
    {
        return $this->belongsTo(DocumentTemplate::class, 'presence_list_id')->withTrashed();
    }

    public function courseFiles()
    {
        return $this->hasMany(CourseFile::class, 'course_id');
    }

    public function logo()
    {
        return $this->hasOne(CourseLogo::class, 'course_id');
    }

    public function signatures()
    {
        return $this->hasMany(CourseSignature::class, 'course_id');
    }
}
