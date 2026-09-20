<?php

namespace App\Http\Requests\User;

use App\Enums\RoleEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class CreateOrUpdateUserRequest extends FormRequest
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
        $roleCompany = RoleEnum::COMPANY->value;

        return [
            'entity_id' => 'nullable|exists:entities,id',
            'company_id' => 'nullable|exists:companies,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'business_segment_id' => 'nullable|exists:business_segments,id',
            'password' => 'nullable|confirmed|max:255',
            'role_id' => 'exists:roles,id',
            'is_main_user' => "required_if:role_id,$roleCompany|boolean",
            'permissions' => 'array',
            'permissions.*' => 'exists:user_permissions,id',
            'menu_items.*' => 'exists:system_menus,id'
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
