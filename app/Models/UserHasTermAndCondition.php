<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserHasTermAndCondition extends Model
{
    protected $fillable = [
        'user_id',
        'term_id'
    ];
}
