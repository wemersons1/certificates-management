<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute;

class EntityConfig extends Model
{
    protected $fillable = [
        'logo',
        'primary_color',
        'secondary_color',
        'main_user_id'
    ];

    protected function logoBase64(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->logo) {
                    return null;
                }

                $path = parse_url($this->logo, PHP_URL_PATH); // remove domínio
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

    public function entity()
    {
        return $this->hasOne(Entity::class, 'config_id');
    }    

    public function main_user()
    {
        return $this->belongsTo(User::class, 'main_user_id');
    }
}
