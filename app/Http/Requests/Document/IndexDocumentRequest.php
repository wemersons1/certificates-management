<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class IndexDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         return [
        'id' => ['nullable', 'integer'],
        'event_id' => ['nullable', 'integer'],
        'employee_name' => ['nullable', 'string'],
        'cpf' => ['nullable', 'string'],
        'search' => ['nullable', 'string'],
        'position_id' => ['nullable', 'array'],
        'position_id.*' => ['integer'],
        'course_id' => ['nullable', 'array'],
        'course_id.*' => ['integer'],
        'company_id' => ['nullable', 'array'],
        'company_id.*' => ['integer'],
        'issue_date_start' => ['nullable', 'date'],
        'issue_date_end' => ['nullable', 'date'],
        'validade' => ['nullable', 'in:valid,expired'],
        'presence_list_id' => ['nullable', 'integer'],
        'presence_list_uuid' => ['nullable', 'string', 'uuid'],
        'only_deleted' => ['nullable', 'boolean'],
    ];
    }
}
