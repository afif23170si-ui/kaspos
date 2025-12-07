/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect }  from 'react';
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { ArrowLeft, LoaderCircle, PlusCircle, Save, X, Trash } from 'lucide-react'
import { Supplier } from '@/types/supplier';
import DatePicker from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table'
import { ProductVariant } from '@/types/product-variant';
import { ProductVariantValue } from '@/types/product-variant-value';
import { Material } from '@/types/material';
import { Order } from '@/types/order';
import { BankAccount } from '@/types/bank';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
{
    title: 'Pembelian',
    href: route('apps.orders.index'),
},
{
    title: 'Ubah Pembelian',
    href: '#',
},
];

interface CreateProps {
suppliers: Supplier[];
materials: Material[];
products: ProductVariant[];
order: Order;
banks: BankAccount[];
[key: string]: unknown;
}

export default function Create() {

    const { suppliers, materials, products, order, banks } = usePage<CreateProps>().props;

    const { data, setData, errors, processing, post, reset } = useForm({
        order_code: order.order_code,
        supplier_id: order.supplier_id.toString(),
        order_date: order.order_date,
        type: order.type,
        discount_type: order.discount_type,
        order_status: order.order_status,
        discount: order.discount,
        sub_total: 0,
        grand_total: 0,
        remaining_payment: 0,
        notes: order.notes,
        withPayment: order.order_payments.length > 0 ? true : false,
        items: order.order_details.map((order_detail) => ({
            item: order_detail.items_id.toString(),
            quantity: order_detail.quantity,
            price: order_detail.price,
            unit: (order_detail.items as { unit: { name: string } }).unit.name,
            expired_at: order_detail.expired_at ?? '',
            total_price: order_detail.quantity * order_detail.price
        })),
        payments: order.order_payments.map((order_payment) => ({
            payment_date: order_payment.paid_at,
            payment_method: order_payment.payment_method,
            payment_account: order_payment.bank_account_id?.toString(),
            total_pay: Number(order_payment.amount),
        })),
        total_payment: 0,
        _method: 'put'
    });

    const prevTypeRef = React.useRef(data.type);

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
                updatedItems[key].price = selectedIngredient.capital_price || 0;
            }
        } else if (data.type === 'products' && fieldName === 'item') {
            const selectedProduct = products.find(product => product.id.toString() === value);
            if (selectedProduct) {
                updatedItems[key].unit = selectedProduct.unit?.name || '';
                updatedItems[key].price = selectedProduct.capital_price || 0;
            }
        }

        if (name === 'item') {
            updatedItems[key] = {
                ...updatedItems[key],
                item: value,
            };
        } else {
            updatedItems[key] = {
                ...updatedItems[key],
                [name]: value,
            };

            if (name === 'quantity' || name === 'price') {
                updatedItems[key].total_price = updatedItems[key].quantity * updatedItems[key].price;
            }
        }

        const subTotal = updatedItems.reduce((total, item) => total + (item.total_price || 0), 0);

        setData({
            ...data,
            items: updatedItems,
            sub_total: subTotal
        });
    }

    const setPaymentsData = (index: number, field: string, value: string | number) => {
        const updatedItems = [...data.payments];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        const totalPayment = updatedItems.reduce((total, item) => total + (item.total_pay || 0), 0);

        setData({ ...data, payments: updatedItems, total_payment: totalPayment });
    };

    const addMoreColumn = () => {
        setData(prevData => ({
            ...prevData,
            items: [...prevData.items, { item: '', quantity: 0, price: 0, unit: '', expired_at: '', total_price: 0 }]
        }))
    }

    const addMoreColumnPayment = () => {
        setData(prevData => ({
            ...prevData,
            payments: [...prevData.payments, {payment_date : '', payment_method: '', payment_account: '', total_pay: 0}]
        }))
    }

    const removeColumn = (key: number) => {
        const items = [...data.items];
        items.splice(key, 1);

        const grandPrice = items.reduce((total, item) => total + (item.total_price || 0), 0);

        setData({
            ...data,
            items,
            grand_total: grandPrice,
        });
    }

    const removeColumnPayment = (key: number) => {
        const payments = [...data.payments];

        payments.splice(key, 1);

        setData({
            ...data,
            payments,
        });
    }

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(data.total_payment > data.grand_total)
            return toast('Jumlah bayar tidak boleh melebihi grand total')
        else
            post(route('apps.orders.update', order.id), {
                onSuccess: () => {
                    toast('Data has been saved.')
                    reset();
                },
            });
    };

    useEffect(() => {
        if (prevTypeRef.current !== data.type) {
            setData('items', [
                { item: '', quantity: 0, price: 0, unit: '', expired_at: '', total_price: 0 }
            ]);
            prevTypeRef.current = data.type;
        }
    }, [data.type]);

    useEffect(() => {
        const totalPayment = data.payments.reduce((total, item) => total + (Number(item.total_pay) || 0), 0);

        if (data.total_payment !== totalPayment) {
            setData('total_payment', totalPayment);
        }
    }, [data.payments]);

    useEffect(() => {
        const subPayment = data.items.reduce(
            (total, item) => total + (Number(item.total_price) || 0),
            0
        );

        if (data.sub_total !== subPayment) {
            setData('sub_total', subPayment);
        }
    }, [data.items]);

    useEffect(() => {
        let total = data.sub_total || 0;

        if (data.discount_type === 'percentage') {
            total = total - (total * (Number(data.discount) || 0) / 100);
        } else {
            total = total - (Number(data.discount) || 0);
        }

        const calculatedGrandTotal = total < 0 ? 0 : total;

        if (data.grand_total !== calculatedGrandTotal) {
            setData('grand_total', calculatedGrandTotal);
        }
    }, [data.discount_type, data.discount, data.sub_total]);

    useEffect(() => {
        let remainingPayment = data.grand_total - data.total_payment;

        if (remainingPayment < 0) {
            remainingPayment = 0;
        }

        if (data.remaining_payment !== remainingPayment) {
            setData('remaining_payment', remainingPayment);
        }
    }, [data.grand_total, data.total_payment]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Ubah Pembelian'/>
            <div className='p-6'>
                <form onSubmit={storeData}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Ubah Pembelian</CardTitle>
                            <CardDescription>Form ini digunakan untuk mengubah pembelian barang</CardDescription>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <div className='p-6'>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Nomor Faktur<span className='text-rose-500'>*</span></Label>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={data.order_code}
                                        onChange={(e) => setData('order_code', e.target.value)}
                                        placeholder="Masukan nomor faktur pembelian"
                                    />
                                    <p className="text-red-500 text-xs">{errors.order_code}</p>
                                </div>
                                <div className='mb-4 flex lg:flex-row gap-4'>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Tanggal Pembelian<span className='text-rose-500'>*</span></Label>
                                        <DatePicker
                                            date={data.order_date}
                                            setDate={(e) => setData('order_date', e)}
                                            label='Pilih Tanggal Pembelian'
                                        />
                                        <p className="text-red-500 text-xs">{errors.order_date}</p>
                                    </div>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Supplier<span className='text-rose-500'>*</span></Label>
                                        <Combobox
                                            options={suppliers.map((supplier) => ({
                                                id: supplier.id.toString(),
                                                name: supplier.name
                                            }))}
                                            placeholder="Pilih Supplier"
                                            value={data.supplier_id}
                                            setValue={(e: string) => setData('supplier_id', e)}
                                            message='supplier'
                                        />
                                        <p className="text-red-500 text-xs">{errors.supplier_id}</p>
                                    </div>
                                </div>
                                <div className='mb-4 flex lg:flex-row gap-4'>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Jenis Pembelian<span className='text-rose-500'>*</span></Label>
                                        <Select value={data.type} onValueChange={(e) => setData('type', e)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Jenis Order" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='materials'>Bahan Baku</SelectItem>
                                                <SelectItem value='products'>Produk</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-red-500 text-xs">{errors.type}</p>
                                    </div>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Status Pembelian<span className='text-rose-500'>*</span></Label>
                                        <Select value={data.order_status} onValueChange={(e) => setData('order_status', e)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Status Pembelian" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='received'>Diterima</SelectItem>
                                                <SelectItem value='confirmed'>Dipesan</SelectItem>
                                                <SelectItem value='pending'>Tertunda</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-red-500 text-xs">{errors.order_status}</p>
                                    </div>
                                </div>
                                <div className='mb-4'>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="has-variant" checked={data.withPayment} onChange={() => setData('withPayment', !data.withPayment)} />
                                        <Label htmlFor="has-variant">Pembelian dengan DP (Uang Muka) ?</Label>
                                    </div>
                                </div>
                            </div>
                            {data.type != '' &&
                                <>
                                    <Table className='border-t border-b'>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className='text-center w-[10px]'>Aksi</TableHead>
                                                <TableHead className='w-lg'>Item<span className='text-rose-500'>*</span></TableHead>
                                                <TableHead>Tanggal Expired</TableHead>
                                                <TableHead>Kuantitas<span className='text-rose-500'>*</span></TableHead>
                                                <TableHead>Harga<span className='text-rose-500'>*</span></TableHead>
                                                <TableHead>Satuan</TableHead>
                                                <TableHead>Total Harga</TableHead>
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
                                                        {(errors as any)[`items.${i}.ingredient`] && <div className="text-xs text-red-500">{(errors as any)[`items.${i}.ingredient`]}</div>}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="date" name='expired_at' value={item.expired_at} onChange={(e) => setItemsData(i, e, 'expired_at')} />
                                                        {(errors as any)[`items.${i}.expired_at`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.expired_at`]}</span>}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="text" name='quantity' value={item.quantity} onChange={(e) => setItemsData(i, e, 'quantity')} />
                                                        {(errors as any)[`items.${i}.quantity`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.quantity`]}</span>}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="text" name='price' value={item.price} onChange={(e) => setItemsData(i, e, 'price')} />
                                                        {(errors as any)[`items.${i}.price`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.price`]}</span>}
                                                    </TableCell>
                                                        <TableCell className="align-top">
                                                        <Input type="text" name='unit' readOnly className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' value={item.unit} onChange={(e) => setItemsData(i, e, 'unit')} />
                                                        {(errors as any)[`items.${i}.unit`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.unit`]}</span>}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input type="text" name='price' readOnly className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' value={item.total_price} onChange={(e) => setItemsData(i, e, 'total_price')} />
                                                        {(errors as any)[`items.${i}.total_price`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.total_price`]}</span>}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell rowSpan={3} colSpan={3} className='hover:bg-none'>
                                                    <Textarea className='w-full h-32 bg-secondary' placeholder='Catatan Pembelian' value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                                </TableCell>
                                                <TableCell colSpan={2} className="text-right font-semibold py-3">Diskon</TableCell>
                                                <TableCell>
                                                    <Select value={data.discount_type} onValueChange={(e) => setData('discount_type', e)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Jenis Diskon" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='percentage'>%</SelectItem>
                                                            <SelectItem value='rupiah'>Rp</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input type="text" value={data.discount} onChange={(e) => setData('discount', e.target.value)}/>
                                                    <p className="text-red-500 text-xs">{errors.discount}</p>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-right font-semibold py-3">SubTotal</TableCell>
                                                <TableCell colSpan={2}>
                                                    <Input type="text" readOnly value={data.sub_total} className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' />
                                                    <p className="text-red-500 text-xs">{errors.sub_total}</p>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-right font-semibold py-3">GrandTotal</TableCell>
                                                <TableCell colSpan={2}>
                                                    <Input type="text" readOnly value={data.grand_total} className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' />
                                                    <p className="text-red-500 text-xs">{errors.grand_total}</p>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <div className='p-4'>
                                        <Button type="button" onClick={addMoreColumn} variant="outline" size="sm">
                                            <PlusCircle /> Tambah Kolom
                                        </Button>
                                    </div>
                                    {data.withPayment &&
                                        <div className='border-t'>
                                            <div className='p-4 bg-secondary'>Metode Pembayaran</div>
                                            <Table className='border-t border-b'>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>#</TableHead>
                                                        <TableHead>Tanggal Pembayaran<span className='text-rose-500'>*</span></TableHead>
                                                        <TableHead>Metode Pembayaran<span className='text-rose-500'>*</span></TableHead>
                                                        <TableHead>Akun Bank</TableHead>
                                                        <TableHead>Jumlah Bayar<span className='text-rose-500'>*</span></TableHead>
                                                        <TableHead className='text-center w-[10px]'>Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {data.payments.map((payment, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="align-center">
                                                                <div className='text-center'>{i + 1}</div>
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                <DatePicker
                                                                    date={payment.payment_date}
                                                                    setDate={(e) => setPaymentsData(i, 'payment_date', e)}
                                                                    label='Pilih Tanggal Pembayaran'
                                                                    disabled={payment.payment_method == 'retur'}
                                                                />
                                                                {(errors as any)[`payments.${i}.payment_date`] && <div className="text-xs text-red-500">{(errors as any)[`payments.${i}.payment_date`]}</div>}
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                <Select value={payment.payment_method} onValueChange={(e) => setPaymentsData(i, 'payment_method', e)} disabled={payment.payment_method == 'retur'}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Pilih Metode Pembayaran" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="cash">Cash</SelectItem>
                                                                        <SelectItem value="transfer">Transfer</SelectItem>
                                                                        {payment.payment_method == 'retur' &&
                                                                            <SelectItem value="retur">Retur</SelectItem>
                                                                        }
                                                                    </SelectContent>
                                                                </Select>
                                                                {(errors as any)[`payments.${i}.payment_method`] && <div className="text-xs text-red-500">{(errors as any)[`payments.${i}.payment_method`]}</div>}
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                {(payment.payment_method == 'transfer' || payment.payment_method == 'credit') &&
                                                                    <Select value={payment.payment_account} onValueChange={(e) => setPaymentsData(i, 'payment_account', e)}>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Pilih Akun Bank" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {banks.map((bank,i) => <SelectItem key={i} value={bank.id.toString()}>{bank.bank_name} - {bank.account_name} [{bank.account_number}]</SelectItem>)}
                                                                        </SelectContent>
                                                                    </Select>
                                                                }
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                <Input type="text" name='total_pay' value={payment.total_pay} onChange={(e) => setPaymentsData(i, 'total_pay', Number(e.target.value))} disabled={payment.payment_method == 'retur'}/>
                                                                {(errors as any)[`payments.${i}.total_pay`] && <div className="text-xs text-red-500">{(errors as any)[`payments.${i}.total_pay`]}</div>}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className='flex items-start justify-center'>
                                                                    <Button type="button" variant="destructive" onClick={() => removeColumnPayment(i)} disabled={i === 0 || payment.payment_method == 'retur'}>
                                                                        {i === 0 ? <X /> : <Trash />}
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-right font-semibold py-3">Total Bayar</TableCell>
                                                        <TableCell colSpan={2}>
                                                            <Input type="text" readOnly value={data.total_payment} className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' />
                                                            <p className="text-red-500 text-xs">{errors.total_payment}</p>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-right font-semibold py-3">Sisa Bayar</TableCell>
                                                        <TableCell colSpan={2}>
                                                            <Input type="text" readOnly value={data.remaining_payment} className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' />
                                                            <p className="text-red-500 text-xs">{errors.remaining_payment}</p>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                            <div className='p-4'>
                                                <Button type="button" onClick={addMoreColumnPayment} variant="outline" size="sm">
                                                    <PlusCircle /> Tambah Kolom
                                                </Button>
                                            </div>
                                        </div>
                                    }
                                </>
                            }
                        </CardContent>
                        <CardFooter className='border-t p-4 w-full overflow-x-auto'>
                            <div className="flex justify-end items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.orders.index')}><ArrowLeft /> Kembali</Link>
                                </Button>
                                <Button variant='secondary' type="submit" disabled={processing}>
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
