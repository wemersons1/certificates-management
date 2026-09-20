<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'method',
        'route',
        'url',
        'ip_address',
        'user_agent',
        'request_data',
        'response_data',
        'response_status',
        'description',
        'execution_time',
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
        'execution_time' => 'float',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
