<?php

namespace App\Jobs;

use App\Constants\Queues;
use App\Models\Notification;
use App\Models\User;
use App\Services\Document\GenerateDocumentsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateDocumentsJob implements ShouldQueue
{
    use Queueable;

    protected array $data;
    protected User $userLogged;
    protected $presenceList;

    /**
     * Create a new job instance.
     */
    public function __construct(array $data, User $userLogged, $presenceList)
    {
        $this->data = $data;
        $this->userLogged = $userLogged;
        $this->onQueue(Queues::GENERATE_DOCUMENTS);
        $this->presenceList = $presenceList;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $generateDocumentsService = new GenerateDocumentsService($this->userLogged, $this->presenceList);
        $generateDocumentsService->execute($this->data, $this->userLogged); 

        Notification::create([
            'entity_id' => $this->userLogged->entity_id,
            'title' => 'Certificados gerados com sucesso',
            'errors' => null,
            'metadata' => json_encode(['presence_list_uuid' => $this->presenceList->uuid]),
            'is_read' => false
        ]);
    }
}
