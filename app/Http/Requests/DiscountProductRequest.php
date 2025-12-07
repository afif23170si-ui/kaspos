<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DiscountProductRequest extends FormRequest
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
            'discount_name' => 'required',
            'discount_value' => 'required',
            'discount_type' => 'required',
            'discount_quantity' => 'required|numeric|min:1',
            'is_active' => 'required',
            'is_all_products' => 'required',
            'is_all_customers' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'discount_name.required' => 'Kolom Nama Promo tidak boleh kosong.',
            'discount_value.required' => 'Kolom Nilai Diskon tidak boleh kosong.',
            'discount_type.required' => 'Kolom Tipe Diskon tidak boleh kosong.',
            'discount_quantity.required' => 'Kolom Minimal Quantity tidak boleh kosong.',
            'discount_quantity.min' => 'Kolom Minimal Quantity harus lebih dari 0 tidak boleh kosong.',
            'is_active.required' => 'Kolom Status tidak boleh kosong.',
            'is_all_products' => 'Kolom Berlaku Untuk Semua Produk tidak boleh kosong.',
            'is_all_customers' => 'Kolom Berlaku Untuk Pelanggan tidak boleh kosong.',
        ];
    }
}
