<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class GenerateDocumentsRequest extends FormRequest
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
            'city_name' => 'string|nullable',
            'company_name' => 'string|nullable',
            'company_representative' => 'string|nullable',
            'city_id' => ['nullable', 'exists:cities,id'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'position' => ['nullable', 'string'],

            'courses' => ['required', 'array', 'min:1'],

            'courses.*.course_id' => ['required', 'exists:courses,id'],
            'courses.*.number_of_hours_studied' => ['nullable', 'numeric'],

            'courses.*.periods' => ['required', 'array', 'min:1'],
            'courses.*.periods.*.start_date' => ['required', 'date'],
            'courses.*.periods.*.end_date' => ['required', 'date', 'after_or_equal:courses.*.periods.*.startDate'],

            'courses.*.date_init_validate' => ['nullable', 'date'],
            'courses.*.date_end_validate' => ['nullable', 'date', 'after_or_equal:courses.*.date_init_validate'],
    
            'courses.*.instructors.*' => ['required', 'exists:instructors,id'],

            'courses.*.employees' => ['required', 'array', 'min:1'],
            'courses.*.employees.*.id' => ['required', 'exists:employees,id'],
            'courses.*.instructors.*.id' => ['required', 'exists:instructors,id'],
            'courses.*.issue_date' => ['required', 'date'],
        ];
    }
}
