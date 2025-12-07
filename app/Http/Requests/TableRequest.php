<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TableRequest extends FormRequest
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
                'number' => 'required|unique:tables',
                'capacity' => 'required',
                'status' => 'required'
            ];
        elseif($method === 'PUT')
            return [
                'number' => 'required|unique:tables,number,' . $this->table->id,
                'capacity' => 'required',
                'status' => 'required'
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
            'number.required' => 'Kolom nomor meja tidak boleh kosong.',
            'number.unique' => 'Kolom nomor meja sudah ada, silahkan gunakan nomor lainnya.',
            'capacity.required' => 'Kolom kapasitas tidak boleh kosong.',
            'status.required' => 'Kolom status tidak boleh kosong.',
        ];
    }
}
