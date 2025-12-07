<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
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

        if ($method === 'POST') {
            $skuRule = 'required|string|max:255|unique:products,sku';
        } elseif ($method === 'PUT') {
            $skuRule = 'required|string|max:255|unique:products,sku,' . $this->product->id;
        }

        $rules = [
            'name' => 'required|string|max:255',
            'sku' => $skuRule,
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'hasVariant' => 'required|boolean',
            'hasStock' => 'required|boolean'
        ];

        if ($this->has('hasVariant') && $this->boolean('hasVariant')) {
            $rules['variantOptions'] = 'required|array|min:1';
            $rules['variantOptions.*.name'] = 'required|string|max:255';
            $rules['variantOptions.*.values'] = 'required|array|min:1';
            $rules['variantOptions.*.values.*'] = 'required|string|max:255';

            $rules['variants'] = 'required|array|min:1';
            $rules['variants.*.combination'] = 'required|array|min:1';
            $rules['variants.*.combination.*'] = 'required|string|max:255';
            $rules['variants.*.barcode'] = 'required|string|max:255';
            $rules['variants.*.price'] = 'required|numeric|min:0';
            $rules['variants.*.unit'] = 'required|exists:units,id';
            if($this->has('hasStock') && $this->boolean('hasStock'))
                $rules['variants.*.quantity'] = 'required|numeric|min:0';
        } else {
            $rules['barcode'] = 'required|string|max:255';
            $rules['price'] = 'required|numeric|min:0';
            $rules['unit'] = 'required|exists:units,id';
            if($this->has('hasStock') && $this->boolean('hasStock') && $method === 'POST')
                $rules['quantity'] = 'required|numeric|min:0';
        }

        return $rules;
     }
}
