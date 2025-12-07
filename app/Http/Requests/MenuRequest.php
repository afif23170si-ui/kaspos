<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MenuRequest extends FormRequest
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
            'name' => 'required|min:3|max:255',
            'category_id' => 'required',
            'grand_price' => 'required|numeric|min:1',
            'selling_price' => 'required|numeric|min:1',
            'margin' => 'required|numeric|min:1',
            'image' => 'nullable|mimes:png,jpg,jpeg|max:2048',
            'items' => 'required|array|min:1',
            'items.*.ingredient' => 'required',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.price' => 'required|numeric|min:1',
            'items.*.total_price' => 'required|numeric|min:1',
        ];
    }
}
