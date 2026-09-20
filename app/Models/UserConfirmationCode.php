<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserConfirmationCode extends Model
{
    protected $table = 'user_confirmation_codes';

    protected $fillable = [
        'user_id',
        'code',
        'verified'
    ];
}
