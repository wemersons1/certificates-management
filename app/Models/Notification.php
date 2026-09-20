<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFilters;
    
    protected $fillable = [
        'entity_id',
        'title',
        'errors',
        'metadata',
        'is_read'
    ];
}
