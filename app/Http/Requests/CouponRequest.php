<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CouponRequest extends FormRequest
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
        $validate = [
            'code' => 'required',
            'value' => 'required',
            'is_active' => 'required',
            'type' => 'required'
        ];

        return $validate;
    }

    public function messages()
    {
        return [
            'code.required' => 'Kolom kode diskon tidak boleh kosong.',
            'value.min' => 'Kolom jumlah diskon tidak boleh kosong.',
            'is_active.unique' => 'Kolom status tidak boleh kosong.',
            'type.required' => 'Kolom jenis diskon tidak boleh kosong.',
        ];
    }
}
