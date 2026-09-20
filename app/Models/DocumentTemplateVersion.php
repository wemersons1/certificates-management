<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class DocumentTemplateVersion extends Model
{
    protected $fillable = [
        'template',
        'orientation',
        'type_id',
        'frame_color',
        'document_template_id',
        'frame_type',
        'frame_id',
        'back_document'
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(DocumentTemplate::class, 'document_template_id')->withTrashed();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(DocumentTemplateType::class, 'type_id');
    }

    public function frame(): BelongsTo
    {
        return $this->belongsTo(DocumentTemplateFrame::class, 'frame_id');
    }
}
