<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseRequest extends FormRequest
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
            'expensee_number' => [
                'required',
                'min:3',
                $method === 'POST'
                    ? 'unique:expenses'
                    : 'unique:expenses,expensee_number,' . $this->expense->id,
            ],
            'date' => 'required|date',
            'expense_category_id' => 'required',
            'expense_subcategory_id' => 'required',
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

    public function messages(): array
    {
        return [
            'expensee_number.required' => 'Kolom no biaya tidak boleh kosong.',
            'expensee_number.unique' => 'Kolom no biaya sudah ada, silahkan gunakan no biaya lainnya.',
            'date' => 'Kolom tanggal tidak boleh kosong.',
            'expense_category_id' => 'Kolom kategori biaya tidak boleh kosong.',
            'expense_subcategory_id' => 'Kolom subkategori biaya tidak boleh kosong.',
            'payments.*.payment_date.required' => 'Kolom tanggal pembayaran tidak boleh kosong.',
            'payments.*.payment_method.required' => 'Kolom metode pembayaran tidak boleh kosong.',
            'payments.*.total_pay.required' => 'Kolom jumlah bayar tidak boleh kosong.',
            'payments.*.total_pay.numeric' => 'Kolom jumlah bayar harus berupa angka.',
            'payments.*.total_pay.min' => 'Kolom jumlah bayar harus lebih dari 0.',
        ];
    }
}
