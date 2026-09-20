<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CreateCourseRequest extends FormRequest
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
        $user = Auth::user();
        $entityId = $user?->entity_id;

        $certificateRule = Rule::exists('document_templates', 'id');
        if ($entityId) {
            $certificateRule = $certificateRule->where(static fn ($query) => $query->where('entity_id', $entityId));
        }

        return [
            'number_of_hours_studied' => 'nullable|numeric',
            'content_program' => 'string|nullable',
            'certificate_id' => ['nullable', $certificateRule],
            'name' => [
                'required',
                'string',
            ],
            'new_version' => 'nullable|boolean',
            'files' => 'nullable|array',
            'files.*' => 'file|max:20480',
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
}
