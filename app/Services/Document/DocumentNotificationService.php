<?php

namespace App\Services\Document;

use App\Helpers\ApplyMaskEmail;
use App\Mail\DocumentLateNotification;
use App\Models\EmailBounce;
use App\Models\NotificationSend;
use App\Models\NotificationTemplateConfig;
use App\Models\PresenceList;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class DocumentNotificationService
{
    private $emailsBounce = [];

    public function __construct()
    {
        foreach (EmailBounce::all() as $item) {
            $this->emailsBounce[] = $item->email;
        }
    }

    public function execute()
    {
         $notificationTemplatesConfig = NotificationTemplateConfig::with(['entity_config_email'])
        ->where('active', true)
        ->whereNotNull('content')
        ->get();

        foreach ($notificationTemplatesConfig as $config) {
            if ($config->entity_config_email && $config->content && strlen(trim($config->content))) {
                $this->sendMailNotification($config);
            }
        }
    }

    private function sendMailNotification(&$config)
    {
        $dayForVerification = Carbon::today()
            ->subDays($config->quantity_days_for_notification)->format('Y-m-d');
        $presenceLists = PresenceList::with([
            'documents.employee.company.entity.config',
            'course',
        ])
        ->whereHas('documents', function($query) use ($dayForVerification) {
            $query->where('date_end_validate', '=', $dayForVerification);
        })->get();

        foreach ($presenceLists as $presenceList) {
            $this->sendEmailToAllConfigured($presenceList, $config);
        }
    }

    private function sendEmailToAllConfigured(&$presenceList, &$config)
    {
        $dataPeopleToSend = $this->prepareDataPeopleToSend($presenceList, $config);

        foreach ($dataPeopleToSend as $data) {
            if (in_array($data['email'], $this->emailsBounce)) {
                continue;
            }

            $content = ApplyMaskEmail::apply($data, $config->content);

            Mail::to($data['email'])
            ->queue(new DocumentLateNotification($config, $content));
            
            NotificationSend::create([
                'title' => $config->title,
                'content' => $content,
                'type' => 'email',
                'employee_id' => $data['employee_id'] ?? null,
                'company_id' => $data['company_id'] ?? null,
                'entity_id' => $config?->entity_config_email?->id,
                'contact' => $data['email'],
                'presence_list_id' => $presenceList->id
            ]);
        } 
    }

    private function prepareDataPeopleToSend($presenceList, $config)
    {   
        return [
            ...$this->getEmployeesToSendData($presenceList, $config),
            ...$this->getCompanyToSendData($presenceList, $config),
            ...$this->getEntityToSendData($presenceList, $config)
        ];
    }

    private function getEmployeesToSendData(&$presenceList, $config)
    {
        $dataPeopleToSend = [];


        foreach ($presenceList->documents as $document) {
            $employeeIds = [];
            $company = $document?->employee?->company;

            if ($config->employee_ids) {
                $employeeIds = json_decode($config->employee_ids);
            }
   
            if ($document->employee->email && in_array($document->employee_id, $employeeIds)) {
                $dataPersonToSend['email'] = $document->employee->email;
                $dataPersonToSend['nome'] = explode(' ', $document->employee->name)[0];
                $dataPersonToSend['nome_curso'] = $presenceList?->course?->name;
                $dataPersonToSend['vencimento_curso'] = Carbon::parse($document?->date_end_validate)->format('d/m/Y');
                $dataPersonToSend['employee_id'] = $document->employee_id;
                $dataPersonToSend['company_id'] = $company->id;
                $dataPersonToSend['lista_de_empregados'] = '';

                $dataPeopleToSend[] = $dataPersonToSend;
            }
        }
        
        return $dataPeopleToSend;
    }

    private function getCompanyToSendData(&$presenceList, $config)
    {
        $dataPeopleToSend = [];
        $document = $presenceList?->documents[0];
        $company = $document?->employee?->company;
        $companyIds = [];

        if ($config->company_ids) {
            $companyIds = json_decode($config->company_ids);
        }

        if ($company && $company->email && in_array($company->id, $companyIds)) {
            $dataPersonToSend['email'] = $company->email;
            $dataPersonToSend['nome'] = explode(' ', $company->name)[0];
            $dataPersonToSend['nome_curso'] = $presenceList?->course->name;
            $dataPersonToSend['vencimento_curso'] = Carbon::parse($document?->date_end_validate)->format('d/m/Y');
            $dataPersonToSend['lista_de_empregados'] = $this->getEmployeeList($presenceList);
            $dataPersonToSend['company_id'] = $company->id;
            $dataPeopleToSend[] = $dataPersonToSend;
        }
        
        return $dataPeopleToSend;
    }

    private function getEntityToSendData(&$presenceList, $config)
    {
        $dataPeopleToSend = [];
        $document = $presenceList?->documents[0];
        $entity = $document?->employee?->company->entity;

        if ($entity && $entity->email && $config->send_me) {
            $dataPersonToSend['email'] = $entity->email;
            $dataPersonToSend['nome'] = explode(' ', $entity->name)[0];
            $dataPersonToSend['nome_curso'] = $presenceList?->course?->name;
            $dataPersonToSend['vencimento_curso'] = Carbon::parse($document?->date_end_validate)->format('d/m/Y');
            $dataPersonToSend['lista_de_empregados'] = $this->getEmployeeList($presenceList);
            
            $dataPeopleToSend[] = $dataPersonToSend;
        }

        if ($entity && $entity?->config?->main_user?->email && $config?->send_me) {
            $dataPersonToSend['email'] = $entity?->config?->main_user?->email;
            $dataPersonToSend['nome'] = explode(' ', $entity?->config?->main_user?->name)[0];
            $dataPersonToSend['nome_curso'] = $presenceList?->course?->name;
            $dataPersonToSend['vencimento_curso'] = Carbon::parse($document?->date_end_validate)->format('d/m/Y');
            $dataPersonToSend['lista_de_empregados'] = $this->getEmployeeList($presenceList);
            
            $dataPeopleToSend[] = $dataPersonToSend;
        }
        
        return $dataPeopleToSend;
    }

    private function getEmployeeList($presenceList)
    {
        $employeeTitle = "<p><strong>Empregados vinculados ao curso:</strong><br /></p>";
        $listEmployees = "<ul>";

        foreach ($presenceList->documents as $document) {
            $listEmployees = $listEmployees . "<li>{$document->employee->name}</li>";
        }

        return $employeeTitle . $listEmployees . "</ul>";
    }
}

