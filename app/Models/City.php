<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFilters;

    protected $fillable = [
        'id',
        'nome',
        'estado_id',
    ];

    public $timestamps = false;

    public function state()
    {
        return $this->hasOne(State::class, 'id', 'estado_id');        
    }
}
