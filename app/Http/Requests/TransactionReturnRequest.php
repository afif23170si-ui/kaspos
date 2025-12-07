<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionReturnRequest extends FormRequest
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
            'return_code' => [
                'required',
                'min:3',
                $method === 'POST'
                    ? 'unique:transaction_returns'
                    : 'unique:transaction_returns,return_code,' . $this->transaction_return->id,
            ],
            'selectedCustomer' => 'required',
            'selectedTransaction' => 'required',
            'purchase_return_date' => 'required',
            'refund_method' => 'required',
            'status' => 'required',
            'grand_total' => 'required',
            'selectedReturn' => 'required|array|min:1',
            'selectedReturn.*.retur_quantity' => 'required|numeric|min:1',
            'selectedReturn.*.reason' => 'required|max:255'
        ];

        return $validate;
    }

    public function messages()
    {
        return [
            'selectedCustomer.required' => 'Kolom pelanggan tidak boleh kosong.',
            'selectedTransaction.required' => 'Kolom nomor faktur penjualan tidak boleh kosong.',
            'return_code.required' => 'Kolom nomor retur penjualan tidak boleh kosong.',
            'purchase_return_date.required' => 'Kolom tanggal retur penjualan tidak boleh kosong.',
            'refund_method.required' => 'Kolom jenis retur tidak boleh kosong.',
            'status.required' => 'Kolom status retur tidak boleh kosong.',
            'selectedReturn.required' => 'tabel return penjualan tidak boleh kosong.',
            'selectedReturn.*.retur_quantity.required' => 'Kolom retur tidak boleh kosong.',
            'selectedReturn.*.retur_quantity.min' => 'Kolom return minimal harus lebih dari 0.',
            'selectedReturn.*.reason.required' => 'Kolom alasan retur tidak boleh kosong.'
        ];
    }
}
