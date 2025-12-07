<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckingStockRequest extends FormRequest
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

        $validate = [
            'no_ref' => [
                'required',
                'min:3',
                $method === 'POST'
                    ? 'unique:checking_stocks'
                    : 'unique:checking_stocks,no_ref,' . $this->checking_stock->id,
            ],
            'user_id' => 'required',
            'due_date' => 'required|date',
            'type' => 'required',
            'status' => 'required',
            'items' => 'required|array|min:1',
            'items.*.item' => 'required',
            'items.*.real_quantity' => 'required|numeric|min:1',
        ];

        return $validate;
    }

    public function messages()
    {
        return [
            'no_ref.required' => 'Kolom nomor referensi tidak boleh kosong.',
            'no_ref.min' => 'Kolom nomor referensi minimal 3 karakter.',
            'no_ref.unique' => 'Nomor referensi sudah ada, silahkan gunakan nomor lainnya.',
            'user_id.required' => 'Kolom petugas tidak boleh kosong.',
            'type.required' => 'Kolom jenis stok opname tidak boleh kosong.',
            'due_date.required' => 'Kolom tanggal stok opname tidak boleh kosong.',
            'status.required' => 'Kolom status stok opname tidak boleh kosong.',
            'items.*.item.required' => 'Kolom item tidak boleh kosong.',
            'items.*.real_quantity.required' => 'Kolom stok fisik tidak boleh kosong.',
            'items.*.real_quantity.min' => 'Kolom stok fisik harus lebih dari 0.',
        ];
    }
}
