<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
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
        $method = $this->method();

        if($method === 'POST')
            return [
                'name' => 'required|string|max:255|unique:roles',
                'selectedPermissions' => 'required|array|min:1',
            ];
        elseif($method === 'PUT')
            return [
                'name' => 'required|string|max:255|unique:roles,name,' . $this->role->id,
                'selectedPermissions' => 'required|array|min:1',
            ];
    }
}
