<?php

namespace App\Services\Document;

use App\Constants\Queues;
use App\Mail\SendDocumentEmail;
use App\Models\Document;
use App\Models\NotificationSend;
use Illuminate\Support\Facades\Mail;

class SendNotificationMailService
{
    public function execute($data, Document $document, $queue = Queues::EMAIL_SEPARATE_DOCUMENT)
    {
        if (empty($data['email']) || empty(trim($data['email']))) {
            return; // Ignore and skip if email is empty
        }
        $data['email'] = trim($data['email']);

        $data['subject_email'] = $this->getSubjectEmail($queue, $data);

        Mail::to($data['email'])
            ->queue(new SendDocumentEmail($document, $data, $queue));

        NotificationSend::create([
            'title' => $data['subject_email'],
            'type' => 'email',
            'employee_id' => $document->employee_id,
            'company_id' => $document->employee->company_id,
            'entity_id' => $document->entity_id,
            'contact' => $data['email'],
            'presence_list_id' => $document->presence_list_id ?? null,
            'content' => view('emails.email-separate-document', [
                'employee' => $document->employee,
                'logo' => $document->entity->config->logo,
                'company_name' => env('APP_NAME'),
            ])->render(),
        ]);

        $document->email_sent = true;
        $document->email_sent_count = ($document->email_sent_count ?? 0) + 1;
        $document->save();
    }

    private function getSubjectEmail($queue, $data)
    {
        if ($queue === Queues::EMAIL_BATCH_DOCUMENT || (isset($data['send_certificate']) && $data['send_certificate'])) {
            return  'Seu Certificado está Disponível';
        }

        return 'Documento Disponível';
    }
}

