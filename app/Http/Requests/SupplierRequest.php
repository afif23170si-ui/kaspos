<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SupplierRequest extends FormRequest
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
            $validation = 'required|string|max:255|unique:suppliers';
        elseif($method === 'PUT')
            $validation = 'required|string|max:255|unique:suppliers,code,' . $this->supplier->id;

        return [
            'code' => $validation,
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Kolom kode supplier tidak boleh kosong.',
            'code.string' => 'Kolom kode supplier harus berupa string.',
            'code.max' => 'Kolom kode supplier tidak boleh lebih dari 255 karakter.',
            'code.unique' => 'Kolom kode supplier sudah ada, silahkan gunakan kode lainnya.',
            'name.required' => 'Kolom nama supplier tidak boleh kosong.',
            'name.string' => 'Kolom nama supplier harus berupa string.',
            'name.max' => 'Kolom nama supplier tidak boleh lebih dari 255 karakter.',
        ];
    }
}
