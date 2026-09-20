<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseSignature extends Model
{
    protected $table = 'course_signatures';

    protected $fillable = [
        'course_id',
        'url',
        'x',
        'y',
        'width',
        'page',
    ];

    protected $casts = [
        'x'     => 'float',
        'y'     => 'float',
        'width' => 'integer',
        'page'  => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
