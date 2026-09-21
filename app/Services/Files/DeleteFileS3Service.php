<?php

namespace App\Services\Files;

use Illuminate\Support\Facades\Storage;

class DeleteFileS3Service
{
    public function execute($pathName)
    {
        $oldPath = R2Path::normalize($pathName);

        if (Storage::disk('s3')->exists($oldPath)) {
            Storage::disk('s3')->delete($oldPath);
        }
    }
}
