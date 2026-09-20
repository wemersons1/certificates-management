<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'credits',
        'price',
        'validity_days',
        'active'
    ];

    protected $casts = [
        'price' => 'float',
        'credits' => 'integer',
        'validity_days' => 'integer',
        'active' => 'boolean'
    ];
}
