/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { ArrowLeft, LoaderCircle, Save, RefreshCcw } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { Category } from '@/types/category';
import { Unit } from '@/types/unit';
import { Product } from '@/types/product';
import { VariantValue } from '@/types/variant-value';
import { VariantOption } from '@/types/variant-option';
import DatePicker from '@/components/ui/date-picker';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk',
        href: route('apps.products.index'),
    },
    {
        title: 'Ubah Produk',
        href: '#',
    },
];

interface EditProps {
    product: Product
    categories: Category[];
    units: Unit[];
    variantOptions: VariantOption[];
    variantValues: VariantValue[];
    [key: string]: unknown;
}

export default function Edit() {

    const { product, categories, units, variantOptions, variantValues } = usePage<EditProps>().props;

    const toBool = (v: unknown) => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'number') return v === 1;
        if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
        return false;
    };

    const { data, setData, errors, processing, post } = useForm({
        name: product.name,
        sku: product.sku,
        image: null as File | null,
        category_id: product.category_id.toString(),
        description: product.description,
        unit: toBool(product.hasVariant) ? '' : product.variants[0].unit_id.toString(),
        barcode: toBool(product.hasVariant) ? '' : product.variants[0].barcode,
        price: toBool(product.hasVariant) ? '' : Number(product.variants[0].price),
        capital_price: toBool(product.has_variant) ? '' : Number(product.variants[0].capital_price),
        quantity: toBool(product.hasVariant) ? '' : product.initial_stock?.quantity,
        expired: toBool(product.hasVariant) ? '' : product.initial_stock?.expired_at,
        minimum_quantity: toBool(product.hasVariant) ? '' : product.variants[0].minimum_quantity,
        hasStock: toBool(product.has_stock) as boolean,
        hasVariant: toBool(product.has_variant) as boolean,
        variantOptions: toBool(product.has_variant) ?
            variantOptions.map((option) => ({
                name: option.name,
                values: variantValues[parseInt(option.id)] as any,
            })) : [{ name: '', values: [''] }],
        variants: toBool(product.has_variant) ?
            product.variants.map((variant) => ({
                combination: variant.product_variant_values.map(value => value.variant_value.name),
                barcode: variant.barcode,
                unit: variant.unit_id.toString(),
                price: variant.price.toString(),
                capital_price: variant.capital_price.toString(),
                minimum_quantity: variant.minimum_quantity,
                quantity: toBool(product.has_stock) ? variant.initial_stock.quantity : '',
                expired: toBool(product.has_stock) ? variant.initial_stock.expired_at : ''
            })) : [] as { combination: string[]; barcode: string; unit: string; price: string, capital_price: string, minimum_quantity: string, quantity: string, expired: string }[],
        _method: 'put'
    });

    const handleInputOptionChange = (key: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedItems = [...data.variantOptions];
        updatedItems[key].name = e.target.value;
        setData(prevData => ({
            ...prevData,
            variantOptions: updatedItems,
        }))
    }

    const addMoreOption = () => {
        setData(prevData => ({
            ...prevData,
            variantOptions: [...prevData.variantOptions, { name: '', values: [''] }]
        }))
    }

    const handleInputVariantChange = (optionKey: number, key: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedItems = [...data.variantOptions];
        updatedItems[optionKey].values[key] = e.target.value;
        setData(prevData => ({
            ...prevData,
            variantOptions: updatedItems
        }))
    }

    const addMoreValue = (key: number) => {
        const newItems = [...data.variantOptions];
        const updatedValues = [...newItems[key].values, ''];
        newItems[key].values = updatedValues;
        setData(prevData => ({
            ...prevData,
            variantOptions: newItems
        }));
    }

    const removeValue = (optionId: number, key: number) => {
        const newOptions = [...data.variantOptions];
        newOptions[optionId].values.splice(key, 1);

        if (newOptions[optionId].values.length === 0) {
            newOptions.splice(optionId, 1);
        }

        setData(prevData => ({
            ...prevData,
            variantOptions: newOptions
        }))
    };

    const handleVariantChange = (index: number, field: 'barcode' | 'unit' | 'price' | 'capital_price' | 'minimum_quantity' | 'quantity' | 'expired', value: string) => {
        const updatedVariants = [...data.variants];
        updatedVariants[index][field] = value;

        setData(prevData => ({
            ...prevData,
            variants: updatedVariants
        }));
    };

    useEffect(() => {
        if (data.variantOptions.length === 0) {
            setData(prevData => ({
                ...prevData,
                variants: []
            }));
            return;
        }
        const items = data.variantOptions.reduce<string[][]>((acc, option) => {
            if (acc.length === 0) return option.values.map((v: any) => [v]);

            const result: string[][] = [];

            for (const prev of acc) {
                for (const val of option.values) {
                    result.push([...prev, val]);
                }
            }

            return result;
        }, []);

        const newVariants = items.map((combination) => {
            const existingVariant = data.variants.find(v => JSON.stringify(v.combination) == JSON.stringify(combination));

            if (existingVariant)
                return {
                    ...existingVariant,
                    price: existingVariant.price?.toString() ?? '',
                    capital_price: existingVariant.capital_price?.toString() ?? ''
                };

            return {
                combination,
                barcode: '',
                unit: '',
                price: '',
                capital_price: '',
                minimum_quantity: '',
                quantity: '',
                expired: ''
            };
        });

        setData(prevData => ({
            ...prevData,
            variants: newVariants
        }));
    }, [data.variantOptions]);

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.products.update', product.id), {
            onSuccess: () => {
                toast('Data has been saved.')
            }
        });
    }

    // fungsi untuk generate SKU
    const generateSKU = (name: string) => {
        if (!name) return '';

        const initials = name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase())
            .join('');

        const randomNumber = Math.floor(1000 + Math.random() * 9000);

        return `${initials}-${randomNumber}`;
    };

    useEffect(() => {
        if (data.name) {
            setData('sku', generateSKU(data.name));
        }
    }, [data.name]);

    // fungsi untuk generate Barcode 13 digit angka (EAN-13 style)
    const generateBarcode = () => {
        let code = "";
        for (let i = 0; i < 13; i++) {
            code += Math.floor(Math.random() * 10).toString();
        }
        return code;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Ubah Produk' />
            <div className='p-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Ubah Produk</CardTitle>
                        <CardDescription>Form ini digunakan untuk mengubah data produk</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={storeData}>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Gambar Produk</Label>
                                <Input type="file" onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setData('image', e.target.files[0]);
                                    }
                                }} />
                                <p className="text-red-500 text-xs">{errors.image}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>SKU Produk<span className='text-rose-500'>*</span></Label>
                                <Input type="text" value={data.sku} onChange={(e) => setData('sku', e.target.value)} placeholder="Input product sku" />
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Nama Produk<span className='text-rose-500'>*</span></Label>
                                <Input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Input product name" />
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Kategori Produk<span className='text-rose-500'>*</span></Label>
                                <Select value={data.category_id} onValueChange={(e) => setData('category_id', e)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-red-500 text-xs">{errors.category_id}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Deskripsi Produk</Label>
                                <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} placeholder='Input product description' />
                                <p className="text-red-500 text-xs">{errors.description}</p>
                            </div>
                            <div className='mb-4 flex items-center gap-4'>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="has-variant" checked={data.hasVariant} onChange={() => setData('hasVariant', !data.hasVariant)} />
                                    <Label htmlFor="has-variant">Produk ini memiliki variasi?</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="has-stock" checked={data.hasStock} onChange={() => setData('hasStock', !data.hasStock)} />
                                    <Label htmlFor="has-stock">Produk ini memiliki stock?</Label>
                                </div>
                            </div>
                            {data.hasVariant ? (
                                <div className="mb-4 border rounded-lg p-6">
                                    <Label className="mb-2 block">Atur Variasi Produk</Label>
                                    {data.variantOptions.map((option, i) => (
                                        <div key={i} className="mb-4">
                                            <Input
                                                placeholder="Nama variasi (contoh: Ukuran)"
                                                className="mb-2"
                                                value={option.name}
                                                onChange={(e) => handleInputOptionChange(i, e)}
                                            />
                                            {<p className="text-xs text-red-500 mb-2">{(errors as any)[`variantOptions.${i}.name`]}</p>}
                                            {option.values.map((val: string, key: number) => (
                                                <React.Fragment key={key}>
                                                    <div className="flex items-start gap-2">
                                                        <Input
                                                            className="mb-2"
                                                            placeholder={`Nilai (${option.name || 'variasi'})`}
                                                            value={val}
                                                            onChange={(e) => handleInputVariantChange(i, key, e)}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => removeValue(i, key)}
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                    {<p className="text-xs text-red-500 mb-2">{(errors as any)[`variantOptions.${i}.values.${key}`]}</p>}
                                                </React.Fragment>
                                            ))}
                                            <Button type="button" variant="secondary" size="sm" onClick={() => addMoreValue(i)}>
                                                Tambah Nilai
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={addMoreOption}>
                                        Tambah Variasi Baru
                                    </Button>
                                    {data.variants.length > 0 && (
                                        <div className="mt-6">
                                            <Label className="block mb-2">Kombinasi Varian</Label>
                                            <div className="border rounded-lg overflow-x-auto w-full">
                                                <table className="w-full text-sm rounded-lg">
                                                    <thead>
                                                        <tr className="bg-muted text-left">
                                                            {data.variantOptions.map((option, key) => (
                                                                <th key={key} className="p-2 border-r">{option.name}<span className='text-red-500'>*</span></th>
                                                            ))}
                                                            <th className="p-2 whitespace-nowrap">Barcode<span className='text-red-500'>*</span></th>
                                                            <th className="p-2 whitespace-nowrap">Satuan<span className='text-red-500'>*</span></th>
                                                            <th className="p-2 whitespace-nowrap">Harga Jual<span className='text-red-500'>*</span></th>
                                                            <th className="p-2 whitespace-nowrap">Harga Beli<span className='text-red-500'>*</span></th>
                                                            <th className="p-2 whitespace-nowrap">Min Quantity<span className='text-red-500'>*</span></th>
                                                            {data.hasStock == true &&
                                                                <>
                                                                    <th className="p-2 whitespace-nowrap">Stok Awal<span className='text-red-500'>*</span></th>
                                                                    <th className="p-2 whitespace-nowrap">Expired</th>
                                                                </>
                                                            }
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.variants.map((variant, idx) => (
                                                            <tr key={idx} className="border-t">
                                                                {variant.combination.map((val, i) => (
                                                                    <td key={i} className="p-2 border-r">{val}</td>
                                                                ))}
                                                                <td className="p-2">
                                                                    <div className="flex">
                                                                        <Input
                                                                            value={variant.barcode}
                                                                            onChange={(e) => handleVariantChange(idx, 'barcode', e.target.value)}
                                                                            placeholder='masukan barcode produk'
                                                                            className="rounded-r-none"
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            onClick={() => handleVariantChange(idx, "barcode", generateBarcode())}
                                                                            className="rounded-l-none border-l-0"
                                                                        >
                                                                            <RefreshCcw className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                    {<p className="text-xs text-red-500 mb-2">{(errors as any)[`variants.${idx}.barcode`]}</p>}
                                                                </td>
                                                                <td className="p-2">
                                                                    <Select value={variant.unit} onValueChange={(e) => handleVariantChange(idx, 'unit', e)}>
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue placeholder="Pilih satuan produk" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {units.map((unit) => (
                                                                                <SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {<p className="text-xs text-red-500 mb-2">{(errors as any)[`variants.${idx}.unit`]}</p>}
                                                                </td>
                                                                <td className="p-2">
                                                                    <Input
                                                                        value={variant.price}
                                                                        onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                                                                        placeholder='masukan harga produk'
                                                                    />
                                                                    {<p className="text-xs text-red-500 mb-2">{(errors as any)[`variants.${idx}.price`]}</p>}
                                                                </td>
                                                                <td className="p-2">
                                                                    <Input
                                                                        value={variant.capital_price}
                                                                        onChange={(e) => handleVariantChange(idx, 'capital_price', e.target.value)}
                                                                        placeholder='masukan harga produk'
                                                                    />
                                                                    {<p className="text-xs text-red-500 mb-2">{(errors as any)[`variants.${idx}.capital_price`]}</p>}
                                                                </td>
                                                                <td className="p-2">
                                                                    <Input
                                                                        value={variant.minimum_quantity}
                                                                        onChange={(e) => handleVariantChange(idx, 'minimum_quantity', e.target.value)}
                                                                        placeholder='masukan minimum quantity'
                                                                    />
                                                                    {<p className="text-xs text-red-500 mb-2">{(errors as any)[`variants.${idx}.minimum_quantity`]}</p>}
                                                                </td>
                                                                {data.hasStock == true &&
                                                                    <>
                                                                        <td className="p-2">
                                                                            <Input
                                                                                type='number'
                                                                                value={variant.quantity}
                                                                                onChange={(e) => handleVariantChange(idx, 'quantity', e.target.value)}
                                                                                placeholder='masukan stock awal'
                                                                            />
                                                                            {<p className="text-xs text-red-500 mb-2">{(errors as any)[`variants.${idx}.quantity`]}</p>}
                                                                        </td>
                                                                        <td className="p-2">
                                                                            <DatePicker
                                                                                date={variant.expired}
                                                                                setDate={(e: string) => handleVariantChange(idx, 'expired', e)}
                                                                                label="Pilih tanggal expired"
                                                                            />
                                                                            {<p className="text-xs text-red-500 mb-2">{(errors as any)[`variants.${idx}.expired`]}</p>}
                                                                        </td>
                                                                    </>
                                                                }
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-4 border rounded-lg p-6">
                                    <Label className="mb-4 block">Detail Produk</Label>
                                    <div className="mb-4">
                                        <Label>Barcode<span className='text-red-500'>*</span></Label>
                                        <div className="flex">
                                            <Input
                                                type="text"
                                                value={data.barcode || ''}
                                                onChange={(e) => setData('barcode', e.target.value)}
                                                placeholder="Masukkan barcode produk"
                                                className="rounded-r-none"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setData("barcode", generateBarcode())}
                                                className="rounded-l-none border-l-0"
                                            >
                                                <RefreshCcw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-red-500 text-xs">{errors.barcode}</p>
                                    </div>
                                    <div className='mb-4'>
                                        <Label>Satuan<span className='text-red-500'>*</span></Label>
                                        <Select value={data.unit} onValueChange={(e) => setData('unit', e)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih satuan produk" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-red-500 text-xs">{errors.unit}</p>
                                    </div>
                                    <div className="mb-4">
                                        <Label>Harga Jual<span className='text-red-500'>*</span></Label>
                                        <Input
                                            type="number"
                                            value={data.price || ''}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="Masukkan harga produk"
                                        />
                                        <p className="text-red-500 text-xs">{errors.price}</p>
                                    </div>
                                    <div className="mb-4">
                                        <Label>Harga Beli<span className='text-red-500'>*</span></Label>
                                        <Input
                                            type="number"
                                            value={data.capital_price || ''}
                                            onChange={(e) => setData('capital_price', e.target.value)}
                                            placeholder="Masukkan harga produk"
                                        />
                                        <p className="text-red-500 text-xs">{errors.capital_price}</p>
                                    </div>
                                    <div className="mb-4">
                                        <Label>Minimum Quantity<span className='text-red-500'>*</span></Label>
                                        <Input
                                            type="number"
                                            value={data.minimum_quantity || ''}
                                            onChange={(e) => setData('minimum_quantity', e.target.value)}
                                            placeholder="Masukkan minimum quantity produk"
                                        />
                                        <p className="text-red-500 text-xs">{errors.price}</p>
                                    </div>
                                    {data.hasStock == true &&
                                        <>
                                            <div className="mb-4">
                                                <Label>Stok Awal<span className='text-red-500'>*</span></Label>
                                                <Input
                                                    type="number"
                                                    value={data.quantity}
                                                    onChange={(e) => setData('quantity', e.target.value)}
                                                    placeholder="Masukkan stock awal"
                                                />
                                                <p className="text-red-500 text-xs">{errors.quantity}</p>
                                            </div>
                                            <div className="mb-4">
                                                <Label>Expired</Label>
                                                <DatePicker date={data.expired} setDate={(e: string) => setData('expired', e)} label="Pilih tanggal expired" />
                                                <p className="text-red-500 text-xs">{errors.expired}</p>
                                            </div>
                                        </>
                                    }
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.products.index')}><ArrowLeft />Kembali</Link>
                                </Button>
                                <Button variant="secondary" type="submit" disabled={processing}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
