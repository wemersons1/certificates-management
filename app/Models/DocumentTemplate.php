<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class DocumentTemplate extends Model
{
    use SoftDeletes, HasFilters;

    protected $fillable = [
        'name',
        'entity_id'
    ];

    protected $appends = ['template', 'back_document', 'orientation', 'frame_color', 'type_id', 'type', 'frame_type', 'frame_id'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            $userLogged = Auth::user();
    
            if ($userLogged && $userLogged->entity_id) {
                $item->entity_id = $userLogged->entity_id;
            }
        });
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentTemplateVersion::class);
    }

    public function latestVersion()
    {
        return $this->hasOne(DocumentTemplateVersion::class, 'document_template_id', 'id')->latestOfMany();
    }

    public function getTemplateAttribute()
    {
        return $this->latestVersion?->template;
    }

    public function getOrientationAttribute()
    {
        return $this->latestVersion?->orientation;
    }

    public function getFrameColorAttribute()
    {
        return $this->latestVersion?->frame_color;
    }
    public function getTypeIdAttribute()
    {
        return $this->latestVersion?->type_id;
    }

    public function getTypeAttribute()
    {
        return $this->latestVersion?->type;
    }

    public function getFrameTypeAttribute()
    {
        return $this->latestVersion?->frame_type;
    }

    public function getFrameIdAttribute()
    {
        return $this->latestVersion?->frame_id;
    }

    public function getBackDocumentAttribute()
    {
        return $this->latestVersion?->back_document;
    }
}
