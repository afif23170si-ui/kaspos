<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseCategoryRequest extends FormRequest
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
                'name' => 'required|string|min:3|max:255|unique:expense_categories',
            ];
        elseif($method === 'PUT')
            return [
                'name' => 'required|string|min:3|max:255|unique:expense_categories,name,' . $this->expense_category->id,
            ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Kolom nama kategori pengeluaran tidak boleh kosong.',
            'name.min' => 'Kolom nama kategori pengeluaran minimal 3 karakter.',
            'name.max' => 'Kolom nama kategori pengeluaran maksimal 255 karakter.',
            'name.unique' => 'Kolom nama kategori pengeluaran sudah ada, silahkan gunakan nama lainnya.',
        ];
    }
}
