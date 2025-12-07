<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
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
        $withPayment = $this->boolean('withPayment');

        $validate = [
            'order_code' => [
                'required',
                'min:3',
                $method === 'POST'
                    ? 'unique:orders'
                    : 'unique:orders,order_code,' . $this->order->id,
            ],
            'supplier_id' => 'required',
            'type' => 'required',
            'order_date' => 'required|date',
            'grand_total' => 'required',
            'items' => 'required|array|min:1',
            'items.*.item' => 'required',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.price' => 'required|numeric|min:1',
            'items.*.total_price' => 'required|numeric|min:1',
        ];

        if ($withPayment) {
            $validate = array_merge($validate, [
                'payments' => 'required|array|min:1',
                'payments.*.payment_date' => 'required',
                'payments.*.payment_method' => 'required',
                'payments.*.total_pay' => 'required|numeric|min:1',
            ]);
        }

        return $validate;
    }


    public function messages()
    {
        return [
            'order_code.required' => 'Kolom nomor faktur pembelian tidak boleh kosong.',
            'order_code.min' => 'Kolom nomor faktur pembelian minimal 3 karakter.',
            'order_code.unique' => 'Nomor faktur pembelian sudah ada, silahkan gunakan nama lainnya.',
            'supplier_id.required' => 'Kolom supplier tidak boleh kosong.',
            'type.required' => 'Kolom jenis order tidak boleh kosong.',
            'order_date.required' => 'Kolom tanggal pembelian tidak boleh kosong.',
            'grand_total.required' => 'Kolom grand total tidak boleh kosong.',
            'items.*.item.required' => 'Kolom item tidak boleh kosong.',
            'items.*.quantity.required' => 'Kolom kuantitas tidak boleh kosong.',
            'items.*.quantity.min' => 'Kolom kuantitas minimal harus lebih dari 0.',
            'items.*.price.required' => 'Kolom harga tidak boleh kosong.',
            'items.*.price.numeric' => 'Kolom harga harus berupa angka.',
            'items.*.price.min' => 'Kolom harga minimal harus lebih dari 0.',
            'items.*.total_price.required' => 'Kolom total harga tidak boleh kosong.',
            'items.*.total_price.numeric' => 'Kolom total harga harus berupa angka.',
            'items.*.total_price.min' => 'Kolom total harga harus lebih dari 0.',
            'payments.*.payment_date.required' => 'Kolom tanggal pembayaran tidak boleh kosong.',
            'payments.*.payment_method.required' => 'Kolom metode pembayaran tidak boleh kosong.',
            'payments.*.total_pay.required' => 'Kolom jumlah bayar tidak boleh kosong.',
            'payments.*.total_pay.numeric' => 'Kolom jumlah bayar harus berupa angka.',
            'payments.*.total_pay.min' => 'Kolom jumlah bayar harus lebih dari 0.',
        ];
    }
}
