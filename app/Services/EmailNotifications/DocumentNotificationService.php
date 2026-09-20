<?php

namespace App\Services\EmailNotifications;

use App\Enums\RoleEnum;
use App\Models\Document;
use App\Mail\EmployeeDocumentExpiryMail;
use App\Mail\CompanyDocumentExpiryMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class DocumentNotificationService
{
    /**
     * Busca todos os documentos de alunos que expiram em exatamente 30 dias
     * e dispara um e‑mail na fila email_employee_document_expiry.
     */
    public function sendEmployeeDocumentExpiryNotifications(): void
    {
        $targetDate = Carbon::today()->addDays(30)->toDateString();

        $documents = Document::with(['employee'])
            ->query()
            ->whereNotNull('employee_id')
            ->whereDate('expiration_date', $targetDate)
            ->get();

        foreach ($documents as $document) {
            $users = $this->getUsersForSend($document);
            $this->sendEmployeeDocumentExpireEmailUsers($document, $users);
        }
    }

    /**
     * Busca todos os documentos da empresa (sem employee_id) que expiram em 30 dias
     * e dispara um e‑mail na fila email_company_document_expiry.
     */
    public function sendCompanyDocumentExpiryNotifications(): void
    {
        $targetDate = Carbon::today()->addDays(30)->toDateString();

        $documents = Document::with(['company'])
            ->query()
            ->whereNull('employee_id')
            ->whereDate('expiration_date', $targetDate)
            ->get();

       
        foreach ($documents as $document) {
            $users = $this->getUsersForSend($document);
            $this->sendCompanyDocumentExpireEmailUsers($document, $users);
        }
    }

    private function getUsersForSend(&$document)
    {
        return User::where(function($query) use ($document) {
            $query->where('company_id', $document->company->id)
            ->where('role_id', RoleEnum::COMPANY->value);
        })
        ->orWhere(function ($query) use ($document){
            $query->whereNull('company_id')
            ->where('role_id', $document->company->entity_id);
        })
        ->get();
    }

    private function sendCompanyDocumentExpireEmailUsers(&$document, &$users): void
    {
        foreach ($users as $user) {
            Mail::to($user->email)
            ->queue(new CompanyDocumentExpiryMail($document, $user));
        }
    }

    private function sendEmployeeDocumentExpireEmailUsers(&$document, &$users): void
    {
        foreach ($users as $user) {
            Mail::to($user->email)
            ->queue(new EmployeeDocumentExpiryMail($document));
        }
    }
}
