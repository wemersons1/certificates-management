<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrUpdateEmployeeRequest extends FormRequest
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
            'name'            => 'required|string|max:255',
            'email'           => 'nullable|email|max:255', // ajuste a tabela conforme necessário
            'cpf'             => 'nullable|string|size:11', // ou usar regex para CPF válido
            'rg'              => 'nullable|string|max:20',
            'active'          => 'required|boolean',
            'cellphone'       => 'nullable|string|max:20',
            'business_segment_id' => 'nullable|exists:business_segments,id',
            'company_id'      => 'nullable|exists:companies,id',
            'position'  => 'nullable|string|max:255',
            'machines_operated' => 'nullable|string'
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $companyId = $this->input('company_id');
       
            if (!$companyId) return;
            $queryCompany = \App\Models\Company::myScope()->find($companyId);

            if (!$queryCompany) {
                $validator->errors()->add('company_id', 'Empresa não cadastrada');
            }
        });
    }
}
