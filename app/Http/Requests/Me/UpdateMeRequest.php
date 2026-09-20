<?php

namespace App\Http\Requests\Me;

use App\Models\Entity;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Validation\Rule;

class UpdateMeRequest extends FormRequest
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
            'entity' => 'nullable',
            'config' => 'nullable',
            'entity.name' => 'nullable|string|max:255',
            'entity.email' => [
                function () {
                    $userLogged = Auth::user();
                    if ($userLogged && $userLogged->id == $userLogged?->entity?->config?->main_user_id) {
                        return 'required';
                    }
                },
                'email',
                Rule::unique('entities', 'email')->ignore($this->user()?->entity_id),
            ],
            'entity.cnpj' => 'nullable|string|max:14',
            'entity.zip_code'        => 'nullable|string|size:8',
            'entity.street'          => 'nullable|string|max:255',
            'entity.number'          => 'nullable|string|max:10',
            'entity.complement'      => 'nullable|string|max:100',
            'entity.neighborhood'    => 'nullable|string|max:100',
            // 'entity.state_id'        => 'nullable|integer|exists:states,id',
            // 'entity.city_id'         => 'nullable|integer|exists:cities,id',
            'config.logo' => 'nullable|string',
            'config.primary_color' => 'nullable|string|max:7',
            'config.secondary_color' => 'nullable|string|max:7',
            'user.name' => 'nullable|string|max:255',
            'user.password' => 'nullable|confirmed|min:8|max:255',
            'user.phone' => 'required|string'
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
