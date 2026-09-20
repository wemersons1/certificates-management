<?php

namespace App\Services\EmailTemplate;

use App\Mail\SendEmailEmployeesOfCompaniesMail;
use App\Models\Company;
use App\Models\EmailTemplate;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class SendEmailBatch
{
    public function execute()
    {
        $now = Carbon::now('America/Sao_Paulo');

        $templates = EmailTemplate::with(['companies'])
        //->whereBetween('date_to_send', [$start, $end])
        //->whereNull('sent_at')
        ->where('active', true)
        ->get();

        foreach ($templates as $template) {           
            $this->prepareCopaniesToSendEmailEmployees($template->companies, $template);
            $template->sent_at = $now->format('Y-m-d H:i:s');
            $template->save();
        }

        return $templates;
    }

    private function prepareCopaniesToSendEmailEmployees($companies, &$template): void
    {
        foreach ($companies as $company) {
            $this->sendEmailToEmployees($company->load(['employees'])->employees,  $template);
        }
    }

    private function sendEmailToEmployees($employees, &$template): void
    {
        foreach ($employees as $employee) {
            Mail::to($employee->email)
            ->queue(new SendEmailEmployeesOfCompaniesMail($template->title, $template->content));
        }
    }
}
