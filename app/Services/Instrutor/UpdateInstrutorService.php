<?php

namespace App\Services\Instrutor;

use App\Models\Instructor;
use App\Services\Files\DeleteFileS3Service;
use App\Services\Files\RegisterFilesS3Service;
use App\Services\Image\ConvertToPngService;

class UpdateInstrutorService
{
    public function execute($validated, $id)
    {
        $validated['signature'] && $validated['signature'] = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($validated['signature']));
        $validated['stamp'] && $validated['stamp'] = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($validated['stamp']));
        
        $instrutor = Instructor::findOrFail($id);

        $instrutor->update($validated);
 
         if ($instrutor->isDirty('stamp')) {
            $oldStamp = parse_url($instrutor->getOriginal('stamp'), PHP_URL_PATH);
            if ($oldStamp && strlen($oldStamp)) {
                (new DeleteFileS3Service())->execute($oldStamp);
                $instrutor->stamp = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($instrutor->stamp));
            }
        }

        if ($instrutor->isDirty('signature')) {
            $oldSignature = parse_url($instrutor->getOriginal('signature'), PHP_URL_PATH);
            if ($oldSignature && strlen($oldSignature)) {
                (new DeleteFileS3Service())->execute($oldSignature);
                $instrutor->signature = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($instrutor->signature));
            }
        }

        return $instrutor;
    }
}

