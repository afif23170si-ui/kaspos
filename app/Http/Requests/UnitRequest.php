<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UnitRequest extends FormRequest
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
                'name' => 'required|string|max:255|unique:units',
            ];
        elseif($method === 'PUT')
            return [
                'name' => 'required|string|max:255|unique:units,name,' . $this->unit->id,
            ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Kolom nama satuan tidak boleh kosong.',
            'name.max' => 'Kolom nama satuan tidak boleh lebih dari 255 karakter.',
            'name.string' => 'Kolom nama satuan harus berupa string.',
            'name.unique' => 'Nama satuan sudah ada, silahkan gunakan nama lainnya.',
        ];
    }
}
