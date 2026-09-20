<?php

namespace App\Services\Document;

use App\Constants\Queues;
use App\Models\NotificationSend;

class SendNotificationMailBatchService
{
    public function execute($presenceList)
    {
        $documents = $presenceList->documents;
 
        foreach ($documents as $document) {
            if (!$document->employee || empty(trim($document->employee->email))) {
                continue; // Ignore and skip if email is empty
            }

            // Envia somente para os que ainda não receberam
            if ($document->email_sent) {
                continue; // Ignore and skip if already sent
            }

            $data['email'] = trim($document->employee->email);
            $document->setAppends(['certificate_template_mounted', 'authorization_template_mounted']);
            $sendNotificationMailService = new SendNotificationMailService();
            $sendNotificationMailService->execute($data, $document, Queues::EMAIL_BATCH_DOCUMENT);
        }
    }
}
