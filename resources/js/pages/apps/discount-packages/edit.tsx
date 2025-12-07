/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox';
import { Product } from '@/types/product';
import { Menu } from '@/types/menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DiscountPackage } from '@/types/discount-package';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Diskon Paket',
        href: route('apps.discount-packages.index'),
    },
    {
        title: 'Ubah Diskon Paket',
        href: '#',
    },
];

interface EditProps {
    items: Product[] | Menu[];
    discountPackage: DiscountPackage;
    [key: string] : unknown;
}

export default function Edit() {
    const { items, discountPackage } = usePage<EditProps>().props;

    const mapType = (modelClass: string): 'menu' | 'product' | undefined => {
        if (modelClass === 'App\\Models\\Menu') return 'menu';
        if (modelClass === 'App\\Models\\ProductVariant') return 'product';
        return undefined;
    };

    const getVariantValues = (item: any): string => {
        if (!item?.items?.product_variant_values) return '';

        return item.items.product_variant_values
            .map((pv: any) => pv.variant_value?.name)
            .filter(Boolean)
            .join(' ');
    };

    const { data, setData, post, reset, processing, errors } = useForm({
        name: discountPackage.name,
        image: null as File | null,
        item_id: '',
        is_active: discountPackage.is_active == '1' ? '1' : '0',
        selectedItems: discountPackage.discount_package_items.map((item) => {
            return {
                id: String(item.items_id),
                name: mapType(item.items_type) === 'menu' ?  (item.items as any).name: `${(item.items as any).product.name} ${getVariantValues(item)}`,
                capital_price: Number((item.items as any).capital_price),
                selling_price: mapType(item.items_type) === 'menu' ? Number((item.items as any).selling_price) : Number((item.items as any).price),
                estimate_price: String(item.estimate_price),
                type: mapType(item.items_type),
            }
        }),
        _method: 'PUT'
    });

    const addItem = (itemParams: string) => {
        if (!itemParams) {
            return toast('Gagal menambahkan produk');
        }

        const selectedProduct = items.find(item => item.id.toString() === itemParams);

        if (selectedProduct) {
            const newItem = {
                id: selectedProduct.id,
                name: selectedProduct.name,
                capital_price: Number(selectedProduct.capital_price),
                selling_price: selectedProduct.type === 'menu' ? Number(selectedProduct.selling_price) : Number(selectedProduct.price),
                estimate_price: selectedProduct.type === 'menu' ? String(selectedProduct.selling_price) : String(selectedProduct.price),
                type: selectedProduct.type as 'product' | 'menu',
            };

            const isDuplicate = Array.isArray(data.selectedItems) && data.selectedItems.some(item => item.name === newItem.name);

            if (isDuplicate) {
                return toast('Produk sudah ada dalam daftar');
            }

            setData(prevData => ({
                ...prevData,
                selectedItems: [...data.selectedItems, newItem],
                item_id: '',
            }));
        } else {
            toast('Produk tidak ditemukan');
        }
    };

    const removeItem = (index: number) => {
        setData(prevData => ({
            ...prevData,
            selectedItems: prevData.selectedItems.filter((_, i) => i !== index),
        }));
    };

    const updateEstimatePrice = (index: number, newValue: number) => {
        const updatedItems = [...data.selectedItems];
        updatedItems[index].estimate_price = String(newValue);

        setData(prevData => ({
            ...prevData,
            selectedItems: updatedItems,
        }));
    };

    const totalEstimate = Array.isArray(data.selectedItems) && data.selectedItems.reduce((total, item) => {
        return total + (Number(item.estimate_price) || 0);
    }, 0);

    const storeData = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.discount-packages.update', discountPackage.id), {
            onSuccess: () => {
                toast('Data berhasil disimpan.')
                reset()
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Ubah Diskon Paket'/>
            <div className='p-6'>
                <form onSubmit={storeData}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Ubah Diskon Paket Makanan</CardTitle>
                            <CardDescription>Form ini digunakan untuk mengubah data diskon paket makanan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Nama Paket */}
                            <div>
                                <Label>Nama Paket<span className='text-rose-500'>*</span></Label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: Paket Hemat 1" />
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            </div>

                              <div>
                                <Label>Gambar Produk<span className='text-rose-500'>*</span></Label>
                                <Input type="file" onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setData('image', e.target.files[0]);
                                    }
                                }} />
                                <p className="text-red-500 text-xs">{errors.image}</p>
                            </div>

                            <div>
                                <Label>Status<span className='text-rose-500'>*</span></Label>
                                <Select value={data.is_active} onValueChange={(e) => setData('is_active', e)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Aktif</SelectItem>
                                        <SelectItem value="0">Tidak</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-red-500 text-xs">{errors.is_active}</p>
                            </div>

                            {/* Input Tambah Produk */}
                            <div className="space-y-2">
                                <Label>Tambah Produk ke Paket<span className='text-rose-500'>*</span></Label>
                                <Combobox
                                    options={items.map((item) => ({
                                        id: item.id.toString(),
                                        name: item.name,
                                    }))}
                                    placeholder="Pilih Produk"
                                    message='data Produk'
                                    value={data.item_id}
                                    setValue={(e) => {setData('item_id', e)}}
                                />
                                <Button variant="outline" type='button' onClick={() => addItem(data.item_id)}>Tambah Produk</Button>
                            </div>

                            {/* Daftar Produk dalam Paket */}
                            <div className="space-y-2 pt-4">
                                <Label>Daftar Produk dalam Paket</Label>
                                <div className="overflow-auto border rounded-md">
                                    <table className="min-w-full text-sm text-left border-collapse">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-4 py-2 border-b">No</th>
                                                <th className="px-4 py-2 border-b">Nama Produk</th>
                                                <th className="px-4 py-2 border-b">Harga Modal</th>
                                                <th className="px-4 py-2 border-b">Harga Jual</th>
                                                <th className="px-4 py-2 border-b">Harga Estimasi</th>
                                                <th className="px-4 py-2 border-b text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.selectedItems.map((item, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-2 border-b">{i + 1}</td>
                                                    <td className="px-4 py-2 border-b">{item.name}</td>
                                                    <td className="px-4 py-2 border-b">
                                                        Rp {item.capital_price.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-2 border-b">
                                                        Rp {item.selling_price.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-2 border-b">
                                                        <Input
                                                            type="number"
                                                            className="w-24"
                                                            value={item.estimate_price}
                                                            onChange={(e) => updateEstimatePrice(i, parseInt(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 border-b text-center">
                                                        <Button size="sm" variant="ghost" onClick={() => removeItem(i)}>Hapus</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Total Estimasi Harga Paket */}
                            <div className="flex justify-between font-semibold border-t pt-4 text-base">
                                <span>Harga Paket</span>
                                <span>Rp {totalEstimate.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.discount-packages.index')}><ArrowLeft /> Kembali</Link>
                                </Button>
                                <Button variant="secondary" type="submit" disabled={processing}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    )
}
