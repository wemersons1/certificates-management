<?php

namespace App\Http\Requests\Entity;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class CreateEntityRequest extends FormRequest
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
            'entity' => 'required',
            'config' => 'required',
            'entity.name' => 'required|string|max:255',
            'entity.email' => 'required|email',
            'entity.cnpj' => 'required|string|max:14',
            'entity.zip_code'        => 'nullable|string|size:8',
            'entity.street'          => 'nullable|string|max:255',
            'entity.number'          => 'nullable|string|max:10',
            'entity.complement'      => 'nullable|string|max:100',
            'entity.neighborhood'    => 'nullable|string|max:100',
            'entity.state_id'        => 'nullable|integer|exists:states,id',
            'entity.city_id'         => 'nullable|integer|exists:cities,id',
            'config.logo' => 'required|string',
            'config.primary_color' => 'required|string|max:7',
            'config.secondary_color' => 'required|string|max:7',
            'user.name' => 'required|string|max:255',
            'user.email' => 'required|email|max:255',
            'user.password' => 'nullable|confirmed|min:8|max:255',
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
            // Validação email
            $email = $this->input('entity.email');
            $entityId = $this->input('entity.id');
            
            $queryEmail = \App\Models\Entity::where('email', $email);

            if ($entityId) {
                $queryEmail->where('id', '!=', $entityId);
            }

            if ($queryEmail->exists()) {
                $validator->errors()->add('entity.email', 'O e-mail já está em uso.');
            }
        });
    }
}
