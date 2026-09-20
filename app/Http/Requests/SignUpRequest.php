<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SignUpRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'nullable|confirmed|min:8|max:255',
            'plan_id' => 'required|exists:plans,id',
            'term_id' => 'required|exists:terms_and_conditions,id',
            'periodicity' => 'required|string|in:annual,monthly',
            'phone' => 'required|string|size:11',
            'business_segment_id' => 'nullable|exists:business_segments,id',
            'recaptcha_response' => 'required|string'
        ];
    }
}
