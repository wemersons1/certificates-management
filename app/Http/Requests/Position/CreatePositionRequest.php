<?php

namespace App\Http\Requests\Position;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class CreatePositionRequest extends FormRequest
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
            'description' => 'nullable|string|max:1024',
            'courses.*' => 'exists:courses,id',
             'name' => [
                'required',
                'string',
            ],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => __('validation.invalid_input'),
                'errors' => $validator->errors(),
            ], Response::HTTP_BAD_REQUEST)
        );
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $courses = $this->input('courses');
        
            foreach ($courses as $courseId) {
                $queryCompany = \App\Models\Course::myScope()->find($courseId);
                   if (!$queryCompany) {
                    $validator->errors()->add('course_id', 'Curso não cadastrado');
                }
            }
        });
    }
}
