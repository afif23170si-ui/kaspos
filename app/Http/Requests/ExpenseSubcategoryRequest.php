<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseSubcategoryRequest extends FormRequest
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
                'expense_category_id' => 'required',
                'name' => 'required|string|min:3|max:255|unique:expense_subcategories',
            ];
        elseif($method === 'PUT')
            return [
                'expense_category_id' => 'required',
                'name' => 'required|string|min:3|max:255|unique:expense_subcategories,name,' . $this->expense_subcategory->id,
            ];
    }

    public function messages()
    {
        return [
            'expense_category_id.required' => 'Kolom kategori pengeluaran tidak boleh kosong.',
            'name.required' => 'Kolom nama sub kategori pengeluaran tidak boleh kosong.',
            'name.min' => 'Kolom nama sub kategori pengeluaran minimal 3 karakter.',
            'name.max' => 'Kolom nama sub kategori pengeluaran maksimal 255 karakter.',
            'name.unique' => 'Kolom nama sub kategori pengeluaran sudah ada, silahkan gunakan nama lainnya.',
        ];
    }
}
