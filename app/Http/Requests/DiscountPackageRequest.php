<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DiscountPackageRequest extends FormRequest
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
            'name' => 'required|min:3',
            'image' => 'required|mimes:jpg,jpeg,png|max:2048',
            'is_active' => 'required|boolean',
        ];

        return $validate;
    }

    public function messages()
    {
        return [
            'name.required' => 'Kolom nama diskon paket tidak boleh kosong.',
            'name.min' => 'Kolom nama diskon paket minimal 3 karakter.',
            'image.required' => 'Kolom gambar diskon paket tidak boleh kosong.',
            'image.mimes' => 'Gambar harus berupa file dengan ekstensi jpg, jpeg, atau png.',
            'image.max' => 'Ukuran gambar tidak boleh lebih dari 2MB.',
            'is_active.required' => 'Kolom status aktif tidak boleh kosong.',
            'is_active.boolean' => 'Status aktif harus berupa nilai boolean (true/false).',
        ];
    }
}
