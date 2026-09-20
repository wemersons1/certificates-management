<?php

namespace App\Http\Requests\Plan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class CreatePlanRequest extends FormRequest
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
            'active' => 'required|boolean',
            'name' => 'required|string|unique:instructors,name',
            'monthly_value' => 'nullable|numeric',
            'annual_value'=> 'nullable|numeric',
            'image' => 'required|string',
            'quantity_days' => 'required|numeric',
            'quantity_certificates' => 'nullable|numeric',
            'benefits' => 'required|array',
            'benefits.*' => 'required|exists:plan_benefits,id'
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
