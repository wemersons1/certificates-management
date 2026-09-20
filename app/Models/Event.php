<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory, HasFilters, SoftDeletes;

    protected $fillable = [
        'uuid',
        'checkin_code',
        'title',
        'course_id',
        'entity_id',
        'number_of_hours',
        'periods',
        'company_name',
        'company_representative',
        'city_name',
        'date_init_validate',
        'date_end_validate',
        'issue_date',
        'certificates_closed',
    ];

    protected $casts = [
        'certificates_closed' => 'boolean',
        'periods' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($event) {
            $userLogged = Auth::user();

            if ($userLogged && $userLogged->entity_id) {
                $event->entity_id = $userLogged->entity_id;
            }

            if (empty($event->uuid)) {
                $event->uuid = (string) Str::uuid();
            }

            if (empty($event->checkin_code)) {
                $event->checkin_code = static::generateUniqueCheckinCode();
            }
        });
    }

    public static function generateUniqueCheckinCode(): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        do {
            $code = '';
            for ($i = 0; $i < 4; $i++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }
        } while (static::where('checkin_code', $code)->exists());

        return $code;
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function entity()
    {
        return $this->belongsTo(Entity::class);
    }

    public function instructors()
    {
        return $this->belongsToMany(Instructor::class, 'event_instructor');
    }

    public function checkinLinks()
    {
        return $this->hasMany(EventCheckinLink::class);
    }
}
