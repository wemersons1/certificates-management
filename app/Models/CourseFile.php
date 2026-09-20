<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CourseFile extends Model
{
    use HasFactory;

    protected $table = 'course_files';

    protected $fillable = [
        'course_id',
        'name',
        'path',
    ];

    protected $appends = ['url'];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function getUrlAttribute()
    {
        if (empty($this->path)) {
            return '';
        }
        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }
        return Storage::disk('s3')->url($this->path);
    }
}
