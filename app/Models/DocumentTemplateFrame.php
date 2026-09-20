<?php

namespace App\Models;

use App\Services\Files\RegisterFilesS3Service;
use App\Services\Image\ConvertToPngService;
use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocumentTemplateFrame extends Model
{

    use SoftDeletes, HasFilters;

    protected $fillable = [
        'frame',
        'back_frame',
        'is_top_only',
        'entity_id'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            $userLogged = Auth::user();
    
            if ($userLogged && $userLogged->entity_id) {
                $item->entity_id = $userLogged->entity_id;
            }
            
            if ($item->frame && !str_starts_with($item->frame, 'http://') && !str_starts_with($item->frame, 'https://')) {
                $item->frame = (new RegisterFilesS3Service)->execute($item->frame, 'frames');
            }

            if ($item->back_frame && !str_starts_with($item->back_frame, 'http://') && !str_starts_with($item->back_frame, 'https://')) {
                $item->back_frame = (new RegisterFilesS3Service)->execute($item->back_frame, 'frames');
            }
        });
    }

    protected function frameBase64(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->getBase64FromS3($this->frame);
            }
        );
    }

    protected function backFrameBase64(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->getBase64FromS3($this->back_frame);
            }
        );
    }

    private function getBase64FromS3($framePath)
    {
        if (!$framePath) {
            return null;
        }

        $path = ltrim(parse_url($framePath, PHP_URL_PATH) ?? $framePath, '/');

        if (!Storage::disk('s3')->exists($path)) {
            return null;
        }

        $file = Storage::disk('s3')->get($path);
        $mime = Storage::disk('s3')->mimeType($path);

        return 'data:' . $mime . ';base64,' . base64_encode($file);
    }
}
