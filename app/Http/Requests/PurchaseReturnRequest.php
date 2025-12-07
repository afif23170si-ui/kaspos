<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseReturnRequest extends FormRequest
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
                    ? 'unique:purchase_returns'
                    : 'unique:purchase_returns,return_code,' . $this->purchase_return->id,
            ],
            'selectedSupplier' => 'required',
            'selectedOrder' => 'required',
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
            'selectedSupplier.required' => 'Kolom supplier tidak boleh kosong.',
            'selectedOrder.required' => 'Kolom nomor faktur pembelian tidak boleh kosong.',
            'return_code.required' => 'Kolom nomor retur pembelian tidak boleh kosong.',
            'purchase_return_date.required' => 'Kolom tanggal retur pembelian tidak boleh kosong.',
            'refund_method.required' => 'Kolom jenis retur tidak boleh kosong.',
            'status.required' => 'Kolom status retur tidak boleh kosong.',
            'selectedReturn.required' => 'tabel return pembelian tidak boleh kosong.',
            'selectedReturn.*.retur_quantity.required' => 'Kolom retur tidak boleh kosong.',
            'selectedReturn.*.retur_quantity.min' => 'Kolom return minimal harus lebih dari 0.',
            'selectedReturn.*.reason.required' => 'Kolom alasan retur tidak boleh kosong.'
        ];
    }
}
