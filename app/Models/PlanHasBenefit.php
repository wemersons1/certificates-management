<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanHasBenefit extends Model
{
    protected $fillable = [
        'plan_id',
        'benefit_id',
    ];
}
