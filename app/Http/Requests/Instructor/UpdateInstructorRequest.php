<?php

namespace App\Http\Requests\Instructor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class UpdateInstructorRequest extends FormRequest
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
            'name' => 'required|string',
            'formation' => 'nullable|string|max:255',
            'crea' => 'nullable|string|max:255',
            'signature' => 'nullable|string',
            'stamp' => 'nullable|string',
            'description' => 'nullable|string'
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
            $name = $this->input('name');
        
            $instrutor = \App\Models\Course::myScope()->where('name', $name)->first();

            if ($instrutor) {
                $validator->errors()->add('name', 'Instrutor já cadastrado');
            }
        });
    }
}
