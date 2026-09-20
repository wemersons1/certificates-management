<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventCheckinLink extends Model
{
    protected $fillable = [
        'event_id',
        'token',
        'used_at',
        'used_by_name',
        'used_by_email',
        'generated_document_id',
        'issued_ip',
        'issued_user_agent',
    ];

    protected $casts = [
        'used_at' => 'datetime',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function generatedDocument()
    {
        return $this->belongsTo(Document::class, 'generated_document_id');
    }
}
