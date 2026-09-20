<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class TermAndCondition extends Model
{
    use HasFilters, SoftDeletes;

    protected $table = 'terms_and_conditions';

    protected $fillable = [
        'content',
        'active',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if ($item->active) {
                self::where('active', true)->update(['active' => false]);
            }
        });

        static::updating(function ($item) {
            if ($item->active) {
                self::where('active', true)->update(['active' => false]);
            }
        });
    }
}
