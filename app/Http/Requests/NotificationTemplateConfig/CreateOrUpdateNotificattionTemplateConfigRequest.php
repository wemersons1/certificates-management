<?php

namespace App\Http\Requests\NotificationTemplateConfig;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class CreateOrUpdateNotificattionTemplateConfigRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'active' => 'required|boolean',
            'send_me' => 'required|boolean',
            'company_ids' => 'nullable|string|string',
            'employee_ids' => 'nullable|string|string',
            'type' => 'required|in:email,whatsapp',
            'quantity_days_for_notification' => 'required|min:0',
            'default_sender' => 'required|email'
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
