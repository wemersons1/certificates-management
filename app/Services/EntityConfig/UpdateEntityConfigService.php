<?php

namespace App\Services\EntityConfig;

use App\Models\EntityConfig;
use App\Services\Files\DeleteFileS3Service;
use App\Services\Files\RegisterFilesS3Service;
use App\Services\Image\ConvertToPngService;

class UpdateEntityConfigService
{
    public function execute($data, $id)
    {
        if (isset($data['logo'])) {
            $data['logo'] = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($data['logo']));
        } else {
            $data['logo'] = '';
        }
        
        $entityConfig = EntityConfig::updateOrCreate(['id' => $id], $data);

        $this->deleteOlderLogo($entityConfig);

        return $entityConfig;
    }

    private function deleteOlderLogo($entityConfig)
    {
         if ($entityConfig->isDirty('logo')) {
            $olderLogo = parse_url($entityConfig->getOriginal('logo'), PHP_URL_PATH);
            $oldPath = parse_url($olderLogo, PHP_URL_PATH);
            if ($oldPath && strlen($oldPath)) {
                (new DeleteFileS3Service())->execute($oldPath);
            }
         }
    }
}

