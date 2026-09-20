<?php

namespace App\Http\Resources\Document;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_name' => $this->employee?->name,
            'employee_cpf' => $this->employee?->cpf,
            'company_name' => $this->company_name,
            'company_representative' => $this->company_representative,
            'course' => $this?->course?->name,
            'position' => $this->position?->name,
            'issue_date' => $this->issue_date,
            'registered_by' => $this?->registered_by?->name,
            'have_authorization' => !! $this?->authorization_template_version_id,
            'date_init_validate' => $this->date_init_validate,
            'date_end_validate' => $this->date_end_validate,
            'have_presence_list' => !! $this?->presence_list?->presence_list_template_version_id,
            'employee_id' => $this->employee_id,
            'employee_email' => $this->employee?->email,
            'email_sent' => (bool) $this->email_sent,
            'email_sent_count' => (int) ($this->email_sent_count ?? 0),
            'course_id' => $this->course_id,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null
        ];
    }
}
