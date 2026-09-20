<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditBatch extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'total_credits',
        'used_credits',
        'start_date',
        'expires_at'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'expires_at' => 'datetime',
        'total_credits' => 'integer',
        'used_credits' => 'integer'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
