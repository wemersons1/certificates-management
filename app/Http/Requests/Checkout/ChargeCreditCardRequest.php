<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class ChargeCreditCardRequest extends FormRequest
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
            'periodicity' => 'required|in:monthly,annual',
            'plan_version_id' => 'required|exists:plan_versions,id',
            "installments" => 'required|numeric',
            "payment_method_id" => 'required',
            "issuer_id" => 'required',
            "payer_identification_type" => 'required',
            "payer_identification_number" => 'required',
            'token' => 'required|string'
        ];
    }
}
