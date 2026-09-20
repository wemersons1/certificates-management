<?php

namespace App\Services\Files;

use Illuminate\Support\Facades\Storage;

class DeleteFileS3Service
{
    public function execute($pathName)
    {
        $oldPath = parse_url($pathName, PHP_URL_PATH);
        $oldPath = ltrim($oldPath, '/');

        if (Storage::disk('s3')->exists($oldPath)) {
            Storage::disk('s3')->delete($oldPath);
        }
    }
}

