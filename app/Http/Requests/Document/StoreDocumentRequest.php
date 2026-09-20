<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type_id' => ['required', 'exists:document_types,id'],
            'company_id' => ['required', 'exists:companies,id'],
            'contract_id' => ['required', 'exists:company_contracts,id'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'status' => ['required', Rule::in(['ativo', 'inativo'])],
            'expiration_date' => ['required', 'date'],
            'attachments' => ['required', 'array', 'min:1', 'max:10'],
            'attachments.*' => ['required', 'file', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png', 'max:10240'], // 10MB por arquivo
            'attachment_expiration_dates' => ['nullable', 'array'],
            'attachment_expiration_dates.*' => ['nullable', 'date'],
            'attachment_document_types' => ['nullable', 'array'],
            'attachment_document_types.*' => ['nullable', Rule::in(['PPRA', 'PCMSO', 'ASO', 'PGR', 'LTCAT', 'OUTRO'])],
        ];
    }

    public function messages(): array
    {
        return [
            'attachments.required' => 'É obrigatório enviar pelo menos um anexo.',
            'attachments.*.mimes' => 'Tipo de arquivo não permitido.',
            'attachments.*.max' => 'O tamanho máximo por arquivo é 10MB.',
            'attachment_document_types.*.in' => 'O tipo de documento deve ser um dos tipos válidos.',
        ];
    }
} 