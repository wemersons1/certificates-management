<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailBounce extends Model
{
    protected $fillable = [
        'email',
        'reason'
    ];
}
