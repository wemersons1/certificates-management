<?php

namespace App\Services\Files;

use Illuminate\Support\Facades\Storage;

class RegisterFilesS3Service
{
    public function execute($base64Image, $path = 'logos')
    {
        preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type);
        $extension = $type[1] ?? 'png'; // jpg, png, etc.
        $base64Data = substr($base64Image, strpos($base64Image, ',') + 1);
        $base64Data = base64_decode($base64Data);
        // Gera um nome único
        $fileName = "$path/" . uniqid('logo_', true) . '.' . $extension;
  
        // Salva no S3
        Storage::disk('s3')->put($fileName, $base64Data, 'private');
        return Storage::disk('s3')->url($fileName); // ou apenas $fileName se quiser salvar só o path
    }
}

