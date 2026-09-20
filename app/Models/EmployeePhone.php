<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeePhone extends Model
{
    protected $fillable = [
        'number',
        'type_id'
    ];
}
