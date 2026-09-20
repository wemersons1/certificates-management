<?php

namespace App\Services\EntityConfig;

use App\Models\EntityConfig;
use App\Services\Files\RegisterFilesS3Service;
use App\Services\Image\ConvertToPngService;

class CreateEntityConfigService
{
    public function execute($validated)
    {
        $validated['logo'] = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($validated['logo']));
        return EntityConfig::create($validated);
    }
}

