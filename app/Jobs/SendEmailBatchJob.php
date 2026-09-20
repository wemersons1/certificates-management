<?php

namespace App\Jobs;

use App\Constants\Queues;
use App\Models\Notification;
use App\Models\User;
use App\Services\Document\SendNotificationMailBatchService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendEmailBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $presenceList;
    protected User $userLogged;

    /**
     * Create a new job instance.
     */
    public function __construct($presenceList, User $userLogged)
    {
        $this->presenceList = $presenceList;
        $this->userLogged = $userLogged;
        $this->onQueue(Queues::EMAIL_BATCH_DOCUMENT);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $sendNotificationMailBatchService = new SendNotificationMailBatchService();
        $sendNotificationMailBatchService->execute($this->presenceList);

        Notification::create([
            'entity_id' => $this->userLogged->entity_id,
            'title' => 'E-mails enviados com sucesso',
            'errors' => null,
            'metadata' => json_encode([
                'presence_list_uuid' => $this->presenceList->uuid,
                'type' => 'email_batch_success'
            ]),
            'is_read' => false
        ]);
    }
}
