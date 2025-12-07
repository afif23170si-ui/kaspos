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
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { Customer } from '@/types/customer';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Diskon Produk',
        href: route('apps.discount-products.index'),
    },
    {
        title: 'Tambah Diskon Produk',
        href: '#',
    },
];

interface CreateProps {
    items: Product[] | Menu[];
    customers : Customer[];
    [key: string] : unknown;
}

export default function Create() {
    const { items, customers } = usePage<CreateProps>().props;

    const {data, setData, post, reset, processing, errors} = useForm({
        item_id: '',
        customer_id: '',
        is_active: '',
        discount_type: '',
        discount_value: '',
        discount_quantity: 0,
        discount_name: '',
        is_all_products: '',
        is_all_customers: '',
        selectedItems: [] as any[],
        selectedCustomers: [] as any[],
    });

    const addItem = (itemParams: string, type: string) => {
        if (!itemParams) {
            return toast('Gagal menambahkan produk');
        }

        let selectedCustomer = null;
        let selectedProduct = null;
        if(type == 'customer')
            selectedCustomer = customers.find(customer => customer.id.toString() === itemParams);
        else
            selectedProduct = items.find(item => item.id.toString() === itemParams);

        if(selectedProduct){
            const newItem = {
                id: selectedProduct.id,
                name: selectedProduct.name,
                type: selectedProduct.type
            }

            const isDuplicate = data.selectedItems.some(item => item.name === newItem.name);

            if(isDuplicate)
                return toast('Produk sudah ada dalam daftar')

            setData(prevData => ({
                ...prevData,
                selectedItems: [...prevData.selectedItems, newItem],
                item_id: ''
            }))
        }

        if(selectedCustomer){
            const newItem = {
                id: selectedCustomer.id,
                name: selectedCustomer.name,
                phone: selectedCustomer.phone
            }

            const isDuplicate = data.selectedCustomers.some(item => item.name === newItem.name);

            if(isDuplicate)
                return toast('Customer sudah ada dalam daftar')

            setData(prevData => ({
                ...prevData,
                selectedCustomers: [...prevData.selectedCustomers, newItem],
                customer_id: ''
            }))
        }
    };

    const removeItem = (index: number, type: string) => {
        if(type === 'product')
            setData(prevData => ({
                ...prevData,
                selectedItems: prevData.selectedItems.filter((_, i) => i !== index),
            }));
        else
            setData(prevData => ({
                ...prevData,
                selectedCustomers: prevData.selectedCustomers.filter((_, i) => i !== index),
            }));
    };


    const storeData = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.discount-products.store'), {
            onSuccess: () => {
                toast('Data berhasil disimpan.')
                reset()
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Tambah Diskon Produk'/>
            <div className='p-6'>
                <form onSubmit={storeData}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Diskon Produk</CardTitle>
                            <CardDescription>Form ini digunakan untuk menambahkan data diskon produk</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Nama Promo</Label>
                                    <Input value={data.discount_name} onChange={(e) => setData('discount_name', e.target.value)} placeholder="Contoh: Promo Akhir Pekan" />
                                    <p className="text-red-500 text-xs">{errors.discount_name}</p>
                                </div>
                                <div>
                                    <Label>Tipe Diskon</Label>
                                    <Select value={data.discount_type} onValueChange={(e) => setData('discount_type', e)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Tipe Diskon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percent">Persentase (%)</SelectItem>
                                            <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-red-500 text-xs">{errors.discount_type}</p>
                                </div>
                                <div>
                                    <Label>Nilai Diskon</Label>
                                    <Input value={data.discount_value} onChange={(e) => setData('discount_value', e.target.value)} type="number" placeholder={data.discount_type === 'percent' ? 'Contoh: 10' : 'Contoh: 10000'} />
                                    <p className="text-red-500 text-xs">{errors.discount_value}</p>
                                </div>
                                <div>
                                    <Label>Minimal Quantity</Label>
                                    <Input value={data.discount_quantity} onChange={(e) => setData('discount_quantity', Number(e.target.value))} placeholder="Contoh: 3" />
                                    <p className="text-red-500 text-xs">{errors.discount_quantity}</p>
                                </div>
                                <div>
                                    <Label>Berlaku Untuk Produk</Label>
                                    <Select value={data.is_all_products} onValueChange={(e) => setData('is_all_products', e)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Produk atau Semua Produk" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="semua">Semua Produk</SelectItem>
                                            <SelectItem value="tertentu">Produk Tertentu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-red-500 text-xs">{errors.is_all_products}</p>
                                </div>
                                <div>
                                    <Label>Berlaku Untuk Pelanggan</Label>
                                    <Select value={data.is_all_customers} onValueChange={(e) => setData('is_all_customers', e)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Target Pelanggan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="semua">Semua Pelanggan</SelectItem>
                                            <SelectItem value="tertentu">Pelanggan Tertentu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-red-500 text-xs">{errors.is_all_customers}</p>
                                </div>
                                {data.is_all_products == 'tertentu' &&
                                    <div className="space-y-2">
                                        <Label>Tambah Produk<span className='text-rose-500'>*</span></Label>
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
                                        <Button variant="outline" type='button' onClick={() => addItem(data.item_id, 'product')}>Tambah Produk</Button>
                                    </div>
                                }
                                {data.is_all_customers == 'tertentu' &&
                                    <div className="space-y-2">
                                        <Label>Pilih Pelanggan<span className='text-rose-500'>*</span></Label>
                                        <Combobox
                                            options={customers.map((customer) => ({
                                                id: customer.id.toString(),
                                                name: customer.name,
                                            }))}
                                            placeholder="Pilih Pelanggan"
                                            message='data pelanggan'
                                            value={data.customer_id}
                                            setValue={(e) => {setData('customer_id', e)}}
                                        />
                                        <Button variant="outline" type='button' onClick={() => addItem(data.customer_id, 'customer')}>Tambah Pelanggan</Button>
                                    </div>
                                }
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

                            {data.selectedItems.length > 0 &&
                                <div className="space-y-2 pt-4">
                                    <Label>Daftar Produk</Label>
                                    <div className="overflow-auto border rounded-md">
                                        <table className="min-w-full text-sm text-left border-collapse">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="px-4 py-2 border-b">No</th>
                                                    <th className="px-4 py-2 border-b">Nama Produk</th>
                                                    <th className="px-4 py-2 border-b text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.selectedItems.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-2 border-b">{i + 1}</td>
                                                        <td className="px-4 py-2 border-b">{item.name}</td>
                                                        <td className="px-4 py-2 border-b text-center">
                                                            <Button size="sm" variant="ghost" onClick={() => removeItem(i, 'product')}>Hapus</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            }
                            {data.selectedCustomers.length > 0 &&
                                <div className="space-y-2 pt-4">
                                    <Label>Daftar Pelanggan</Label>
                                    <div className="overflow-auto border rounded-md">
                                        <table className="min-w-full text-sm text-left border-collapse">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="px-4 py-2 border-b">No</th>
                                                    <th className="px-4 py-2 border-b">Nomor HP</th>
                                                    <th className="px-4 py-2 border-b">Nama Pelanggan</th>
                                                    <th className="px-4 py-2 border-b text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.selectedCustomers.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-2 border-b">{i + 1}</td>
                                                        <td className="px-4 py-2 border-b">{item.phone}</td>
                                                        <td className="px-4 py-2 border-b">{item.name}</td>
                                                        <td className="px-4 py-2 border-b text-center">
                                                            <Button size="sm" variant="ghost" onClick={() => removeItem(i, 'customer')}>Hapus</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            }
                            <div className="flex items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.discount-products.index')}><ArrowLeft /> Kembali</Link>
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
