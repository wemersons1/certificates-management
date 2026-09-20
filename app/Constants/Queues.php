<?php

namespace App\Constants;

class Queues {
    const EMAIL_DOCUMENT_EXPIRY = 'email_employee_document_expiry';
    const EMAIL_SEPARATE_DOCUMENT = 'email_separate_document';
    const EMAIL_BATCH_DOCUMENT = 'email_batch_document';
    const GENERATE_DOCUMENTS = 'generate_documents';
    const EMAIL_NEW_EVENT_NOTIFICATION_MANAGER = 'email_new_event_notification_manager';
    const UPDATE_COURSE = 'update_course';

    public static function all(): array
    {
        $reflection = new \ReflectionClass(__CLASS__);
        return array_values($reflection->getConstants());
    }
}