<?php

namespace App\Http\Requests\Region;

use Illuminate\Foundation\Http\FormRequest;

class IndexCityRequest extends FormRequest
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
            'estado_id' => 'nullable|exists:states,id',
            'state_id' => 'nullable|array',
            'state_id.*' => 'nullable|exists:states,id' 
        ];
    }
}
