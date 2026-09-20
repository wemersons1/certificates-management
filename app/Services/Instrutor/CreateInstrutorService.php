<?php

namespace App\Services\Instrutor;

use App\Models\Entity;
use App\Models\Instructor;
use App\Services\Files\RegisterFilesS3Service;
use App\Services\Image\ConvertToPngService;

class CreateInstrutorService
{
    public function execute($validated)
    {
        $validated['signature'] && $validated['signature'] = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($validated['signature']));
        $validated['stamp'] && $validated['stamp'] = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($validated['stamp']));

        return Instructor::create($validated);
    }
}

