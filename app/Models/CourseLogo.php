<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseLogo extends Model
{
    protected $table = 'course_logos';

    protected $fillable = [
        'course_id',
        'url',
        'x',
        'y',
        'width',
    ];

    protected $casts = [
        'x'     => 'float',
        'y'     => 'float',
        'width' => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
