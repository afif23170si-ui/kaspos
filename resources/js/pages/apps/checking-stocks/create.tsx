/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect }  from 'react';
import AppLayout from '@/layouts/app-layout'
import { User, type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { ArrowLeft, LoaderCircle, PlusCircle, Save, X, Trash } from 'lucide-react'
import DatePicker from '@/components/ui/date-picker';
import axios from 'axios';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table'
import { ProductVariant } from '@/types/product-variant';
import { ProductVariantValue } from '@/types/product-variant-value';
import { Material } from '@/types/material';
import { BankAccount } from '@/types/bank';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stok Opname',
        href: route('apps.checking-stocks.index'),
    },
    {
        title: 'Tambah Stok Opname',
        href: '#',
    },
];

interface CreateProps {
    users: User[];
    materials: Material[];
    products: ProductVariant[];
    banks: BankAccount[];
    noRef: string;
    [key: string]: unknown;
}

export default function Create() {

    const { users, materials, products, noRef } = usePage<CreateProps>().props;

    const { data, setData, errors, processing, post, reset } = useForm({
        no_ref: noRef,
        user_id: '',
        due_date: '',
        type: '',
        status: '',
        note: '',
        items: [
            { item: '', quantity: 0, price: 0, unit: '', real_quantity: 0, diffrence: 0, diffrence_price: 0, note: '' }
        ],
    });

    const setItemsData = async (key: number, e: React.ChangeEvent<HTMLInputElement> | string, fieldName?: string) => {
        let updatedItems = [...data.items];

        let value: string | any;
        let name: string;

        if (typeof e !== 'string') {
            value = e.target.value;
            name = e.target.name;
        } else {
            value = e;
            name = fieldName || 'item';
        }

        if (name === 'quantity' || name === 'price') {
            value = parseFloat(value) || 0;
        }

        if (data.type === 'materials' && fieldName === 'item') {
            const selectedIngredient = materials.find(material => material.id.toString() === value);
            if (selectedIngredient) {
                updatedItems[key].unit = selectedIngredient.unit?.name || '';
                updatedItems[key].price = selectedIngredient.price || 0;

                try {
                    const response = await axios.get(route('apps.options.get-stocks'), {
                        params: {
                            item: selectedIngredient.id,
                            type: data.type,
                            date: data.due_date
                        }
                    });
                    updatedItems[key].quantity = response.data.data;
                } catch (error) {
                    console.error('Gagal ambil stok bahan:', error);
                }
            }
        } else if (data.type === 'products' && fieldName === 'item') {
            const selectedProduct = products.find(product => product.id.toString() === value);
            if (selectedProduct) {
                updatedItems[key].unit = selectedProduct.unit?.name || '';
                updatedItems[key].price = selectedProduct.capital_price || 0;

                try {
                    const response = await axios.get(route('apps.options.get-stocks'), {
                        params: {
                            item: selectedProduct.id,
                            type: data.type,
                            date: data.due_date
                        }
                    });
                    updatedItems[key].quantity = response.data.data;
                } catch (error) {
                    console.error('Gagal ambil stok produk:', error);
                }
            }
        }

        if (name === 'item')
            updatedItems[key] = {
                ...updatedItems[key],
                item: value,
            };
        else
            updatedItems[key] = {
                ...updatedItems[key],
                [name]: value,
            };

        const currentItem = updatedItems[key];
        if (currentItem.real_quantity !== undefined && currentItem.quantity !== undefined && currentItem.price !== undefined && currentItem.real_quantity > 0) {
            const difference = currentItem.real_quantity - currentItem.quantity;
            const differencePrice = difference * currentItem.price;

            updatedItems[key] = {
                ...currentItem,
                diffrence: difference,
                diffrence_price: differencePrice,
            };
        }

        setData({...data, items: updatedItems });
    }


    const addMoreColumn = () => {
        setData(prevData => ({
            ...prevData,
            items: [...prevData.items,{ item: '', quantity: 0, price: 0, unit: '', real_quantity: 0, diffrence: 0, diffrence_price: 0, note: '' }]
        }))
    }


    const removeColumn = (key: number) => {
        const items = [...data.items];
        items.splice(key, 1);

        setData({...data, items});
    }

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.checking-stocks.store'), {
            onSuccess: () => {
                toast('Data has been saved.')
                reset();
            },
        });
    };

    useEffect(() => {
        setData('items', [
            { item: '', quantity: 0, price: 0, unit: '', real_quantity: 0, diffrence: 0, diffrence_price: 0, note: '' }
        ]);
    }, [data.type]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Tambah Stok Opname'/>
            <div className='p-6'>
                <form onSubmit={storeData}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Stok Opname</CardTitle>
                            <CardDescription>Form ini digunakan untuk menambahkan stok opname</CardDescription>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <div className='p-6'>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Nomor Referensi<span className='text-rose-500'>*</span></Label>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={data.no_ref}
                                        onChange={(e) => setData('no_ref', e.target.value)}
                                        placeholder="Masukan nomor referensi stock opname"
                                    />
                                    <p className="text-red-500 text-xs">{errors.no_ref}</p>
                                </div>
                                <div className='mb-4 flex lg:flex-row gap-4'>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Tanggal Stok Opname<span className='text-rose-500'>*</span></Label>
                                        <DatePicker
                                            date={data.due_date}
                                            setDate={(e) => setData('due_date', e)}
                                            label='Pilih Tanggal Stock Opname'
                                        />
                                        <p className="text-red-500 text-xs">{errors.due_date}</p>
                                    </div>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Petugas<span className='text-rose-500'>*</span></Label>
                                        <Combobox
                                            options={users.map((user) => ({
                                                id: user.id.toString(),
                                                name: user.name
                                            }))}
                                            placeholder="Pilih Petugas"
                                            value={data.user_id}
                                            setValue={(e: string) => setData('user_id', e)}
                                            message='petugas'
                                        />
                                        <p className="text-red-500 text-xs">{errors.user_id}</p>
                                    </div>
                                </div>
                                <div className='mb-4 flex lg:flex-row gap-4'>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Jenis Stok Opname<span className='text-rose-500'>*</span></Label>
                                        <Select value={data.type} onValueChange={(e) => setData('type', e)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Jenis Stock Opname" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='materials'>Bahan Baku</SelectItem>
                                                <SelectItem value='products'>Produk</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-red-500 text-xs">{errors.type}</p>
                                    </div>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Status Stok Opname<span className='text-rose-500'>*</span></Label>
                                        <Select value={data.status} onValueChange={(e) => setData('status', e)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Status Stock Opname" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='done'>Setuji & Sesuaikan Stok</SelectItem>
                                                <SelectItem value='draft'>Draft</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-red-500 text-xs">{errors.status}</p>
                                    </div>
                                </div>
                                <div className='mb-4 flex flex-col gap-2'>
                                    <Label>Catatan</Label>
                                    <Textarea
                                        name="note"
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                        rows={5}
                                        placeholder="Masukan catatan stock opname"
                                    />
                                    <p className="text-red-500 text-xs">{errors.note}</p>
                                </div>
                            </div>
                            {data.type != '' &&
                                <>
                                    <Table className='border-t border-b'>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className='text-center w-[10px]'>Aksi</TableHead>
                                                <TableHead className='w-lg'>Item<span className='text-rose-500'>*</span></TableHead>
                                                <TableHead>Satuan</TableHead>
                                                <TableHead>Harga Modal</TableHead>
                                                <TableHead>Stok Sistem</TableHead>
                                                <TableHead>Stok Fisik</TableHead>
                                                <TableHead>Selisih</TableHead>
                                                <TableHead>Nilai Selisih</TableHead>
                                                <TableHead>Keterangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.items.map((item, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>
                                                        <div className='flex items-start justify-center'>
                                                            <Button type="button" variant="destructive" onClick={() => removeColumn(i)} disabled={i === 0}>
                                                                {i === 0 ? <X /> : <Trash />}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className='align-top'>
                                                        {data.type == 'products' ?
                                                            <Combobox
                                                                options={products.map((product) => ({
                                                                    id: product.id.toString(),
                                                                    name:
                                                                        product.product.has_variant ?
                                                                        `${product.product.name} [${product.product_variant_values
                                                                            .map((variant: ProductVariantValue) => `${variant.variant_value.variant_option.name}: ${variant.variant_value.name}`)
                                                                            .join(', ')}]`
                                                                        :
                                                                        `${product.product.name}`
                                                                }))}
                                                                placeholder={"Pilih Produk"}
                                                                message={'produk'}
                                                                value={item.item}
                                                                setValue={(e) => setItemsData(i, e, 'item')}
                                                            />
                                                            :
                                                            <Combobox
                                                                options={materials.map((ingredient) => ({
                                                                    id: ingredient.id.toString(),
                                                                    name: ingredient.name + ' [' + ingredient.unit.name + ']'
                                                                }))}
                                                                placeholder={"Pilih Bahan Baku"}
                                                                message={'bahan baku'}
                                                                value={item.item}
                                                                setValue={(e) => setItemsData(i, e, 'item')}
                                                            />
                                                        }
                                                        {(errors as any)[`items.${i}.item`] && <div className="text-xs text-red-500">{(errors as any)[`items.${i}.item`]}</div>}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="text" name='unit' value={item.unit} readOnly className='cursor-not-allowed bg-secondary'/>
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="text" name='price' value={item.price} readOnly className='cursor-not-allowed bg-secondary' />
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="text" name='quantity' value={item.quantity} readOnly className='cursor-not-allowed bg-secondary'/>
                                                    </TableCell>
                                                     <TableCell className="align-top">
                                                        <Input type="text" name='real_quantity' value={item.real_quantity} onChange={(e) => setItemsData(i, e, 'real_quantity')} />
                                                        {(errors as any)[`items.${i}.real_quantity`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.real_quantity`]}</span>}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="text" name='diffrence' value={item.diffrence} onChange={(e) => setItemsData(i, e, 'diffrence')} readOnly className='cursor-not-allowed bg-secondary'/>
                                                        {(errors as any)[`items.${i}.diffrence`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.diffrence`]}</span>}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="text" name='diffrence_price' value={item.diffrence_price} onChange={(e) => setItemsData(i, e, 'diffrence_price')} readOnly className='cursor-not-allowed bg-secondary'/>
                                                        {(errors as any)[`items.${i}.diffrence_price`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.diffrence_price`]}</span>}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="text" name='note' value={item.note} onChange={(e) => setItemsData(i, e, 'note')}/>
                                                        {(errors as any)[`items.${i}.note`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.note`]}</span>}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className='p-4'>
                                        <Button type="button" onClick={addMoreColumn} variant="outline" size="sm">
                                            <PlusCircle /> Tambah Kolom
                                        </Button>
                                    </div>
                                </>
                            }
                        </CardContent>
                        <CardFooter className='border-t p-4 w-full overflow-x-auto'>
                            <div className="flex justify-end items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.checking-stocks.index')}><ArrowLeft /> Kembali</Link>
                                </Button>
                                <Button variant="secondary" type="submit" disabled={processing}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    )
}
