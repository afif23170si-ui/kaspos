<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
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
            $validate = [
                'username' => 'required|string|max:255|unique:users',
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:4|confirmed',
                'selectedRoles' => 'required|array|min:1',
            ];
        elseif($method === 'PUT')
            $validate = [
                'username' => 'required|string|max:255|unique:users,username,'. $this->user->id,
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,'. $this->user->id,
                'password' => 'nullable|min:4|confirmed',
                'selectedRoles' => 'required|array|min:1',
            ];

        return $validate;
    }
}
