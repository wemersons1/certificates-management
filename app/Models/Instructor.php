<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class Instructor extends Model
{
    use HasFactory, HasFilters, SoftDeletes;
    protected $fillable = [
        'name', 
        'description', 
        'formation',
        'crea',
        'stamp',
        'signature',
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
        });
    }

    protected function stampBase64(): Attribute
    {   
        return Attribute::make(
            get: function () {
                if (!$this->stamp) {
                    return null;
                }

                $path = parse_url($this->stamp, PHP_URL_PATH); // remove domínio
                $path = ltrim($path, '/');

                if (!Storage::disk('s3')->exists($path)) {
                    return null;
                }

                $file = Storage::disk('s3')->get($path);
                $mime = Storage::disk('s3')->mimeType($path);

                return 'data:' . $mime . ';base64,' . base64_encode($file);
            }
        );
    }

    protected function signatureBase64(): Attribute
    {
        //  return Attribute::make(
        //     get: function () {
        //         return $this->signature;
        //     }
        // );

        return Attribute::make(
            get: function () {
                if (!$this->signature) {
                    return null;
                }

                $path = parse_url($this->signature, PHP_URL_PATH); // remove domínio
                $path = ltrim($path, '/');

                if (!Storage::disk('s3')->exists($path)) {
                    return null;
                }

                $file = Storage::disk('s3')->get($path);
                $mime = Storage::disk('s3')->mimeType($path);

                return 'data:' . $mime . ';base64,' . base64_encode($file);
            }
        );
    }
}
