/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import InputError from '@/components/input-error';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import DatePicker from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout'
import { Table, TableCard, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ProductVariantValue } from '@/types/product-variant-value';
import { ArrowLeft, CheckCircle, CircleX, LoaderCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Customer } from '@/types/customer';
import { Transaction } from '@/types/transaction';
import { TransactionDetail } from '@/types/transaction-detail';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Retur Penjualan',
        href: route('apps.transaction-returns.index'),
    },
    {
        title: 'Tambah Retur Penjualan',
        href: '#',
    },
];

interface CreateProps {
    customers: Customer[];
    returnCode : string;
    [key: string]: unknown;
}

export default function Create() {

    const { customers, returnCode } = usePage<CreateProps>().props;

    const {data, setData, post, processing, errors} = useForm({
        refund_method: '',
        purchase_return_date: '',
        return_code: returnCode,
        status: '',
        note: '',
        orders: [],
        order_details: [],
        loading: false as boolean,
        order: [] as any,
        selectedCustomer: '',
        selectedTransaction: '',
        selectedItems: [],
        selectedReturn : [] as any[],
        sub_total: 0,
        order_payment: 0,
        grand_total: 0
    })

    const handleCustomerChange = async (customerId: string) => {
        try{
            const response = await axios.get(route('apps.options.get-transactions', customerId));
            const orders = response.data.data;
            setData(prevData => ({
                ...prevData,
                orders: orders
            }));
        }catch(error){
            console.log(error);
        }
    }

    const handleTransactionChange = async (transactionId: string) => {
        try{
            setData('loading', true)
            const response = await axios.get(route('apps.options.get-transaction-details', transactionId));
            const orderDetails = response.data.data.transaction_details;
            const order = response.data.data.transaction;
            setData(prevData => ({
                ...prevData,
                selectedReturn: [],
                order_details: orderDetails,
                order: order,
                loading: false,
            }));
        }catch(error){
            console.log(error);
        }
    }

    const productName = (type: string, detail: any) => {
        switch (type) {
            case 'App\\Models\\ProductVariant':
                return detail.items.product.has_variant
                    ? `${detail.items.product.name} [${detail.items.product_variant_values
                        .map((variant: ProductVariantValue) =>
                        `${variant.variant_value.variant_option.name}: ${variant.variant_value.name}`
                        )
                        .join(', ')}]`
                    : detail.items.product.name;
            case 'App\\Models\\DiscountPackage':
                return detail.items.name;
            case 'App\\Models\\Menu':
                return detail.items.name;
        }
    };

    const addItem = (itemId: string) => {
        const items = data.order_details.filter((item : TransactionDetail) => item.id.toString() == itemId);

        const collection = items.map((item: TransactionDetail) => ({
            id: item.id,
            product_id: item.items_id,
            name: productName(item.items_type as string, item),
            quantity: item.quantity,
            price: item.price,
            retur_quantity: '',
            reason: '',
            total_price : ''
        }));

        setData('selectedReturn', [...data.selectedReturn, ...collection]);
    }

    const setReturData = (index: number, field: 'retur_quantity' | 'reason', value: string) => {
        const updatedItems = [...data.selectedReturn];
        const currentItem = updatedItems[index];

        if (!currentItem) return;

        if (field === 'retur_quantity') {
            const returQuantity = Number(value);

            if (isNaN(returQuantity) || returQuantity < 0) {
                toast.error('Kuantitas retur harus berupa angka positif');
                return;
            }

            if (returQuantity > currentItem.quantity) {
                toast.error('Kuantitas retur tidak boleh lebih besar dari jumlah pembelian');
                return;
            }

            currentItem.retur_quantity = returQuantity;
            currentItem.total_price = returQuantity * (currentItem.price || 0);
        } else {
            currentItem[field] = value;
        }

        updatedItems[index] = { ...currentItem };

        const totalPayment = updatedItems.reduce((total, item) => total + (item.total_price || 0), 0);

        setData({
            ...data,
            selectedReturn: updatedItems,
            sub_total: totalPayment,
            grand_total: totalPayment - data.order_payment || 0
        });
    };

    const storeData = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('apps.transaction-returns.store'), {
            onSuccess: () => {
                toast('Data berhasil disimpan');
            },
        });
    }

    useEffect(() => {
        const total = Number(data.sub_total) || 0;

        if (data.grand_total) {
            const remaining = Number(data.order_payment) - total;
            setData('grand_total', remaining < 0 ? 0 : remaining);
        }
    }, [data.sub_total]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Tambah Retur Pembelian'/>
            <div className='p-6'>
                <form onSubmit={storeData}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Retur Pembelian</CardTitle>
                            <CardDescription>Form ini digunakan untuk menambahkan retur pembelian</CardDescription>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <div className='p-6'>
                                <div className='mb-4 flex lg:flex-row gap-4'>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Pelanggan<span className='text-rose-500'>*</span></Label>
                                        <Combobox
                                            options={customers.map((customer : Customer) => ({
                                                id: customer.id.toString(),
                                                name: `[${customer.phone}] ${customer.name}`,
                                            }))}
                                            placeholder={"Pilih Pelanggan"}
                                            message={'pelanggan'}
                                            value={data.selectedCustomer}
                                            setValue={(e) => setData('selectedCustomer', e)}
                                            withChain={(e) => handleCustomerChange(e)}
                                        />
                                        <InputError message={errors.selectedCustomer}/>
                                    </div>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Nomor Faktur Penjualan<span className='text-rose-500'>*</span></Label>
                                        <Combobox
                                            options={data.orders.map((transaction : Transaction) => ({
                                                id: transaction.id.toString(),
                                                name: transaction.invoice,
                                            }))}
                                            placeholder={"Pilih Nomor Faktur penjualan"}
                                            message={'nomor faktur penjualan'}
                                            value={data.selectedTransaction}
                                            setValue={(e) => setData('selectedTransaction', e)}
                                            disabled={data.orders.length === 0}
                                            withChain={(e) => handleTransactionChange(e)}
                                        />
                                        <InputError message={errors.selectedTransaction}/>
                                    </div>
                                </div>
                                <div className='mb-4 flex lg:flex-row gap-4'>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Nomor Retur Pembelian<span className='text-rose-500'>*</span></Label>
                                        <Input value={data.return_code} onChange={(e) => setData('return_code', e.target.value)} placeholder='Masukan nomor retur pembelian'/>
                                        <InputError message={errors.return_code}/>
                                    </div>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Tanggal Retur Pembelian<span className='text-rose-500'>*</span></Label>
                                        <DatePicker
                                            date={data.purchase_return_date}
                                            setDate={(date) => setData('purchase_return_date', date)}
                                            label='Pilih Tanggal Retur Pembelian'
                                        />
                                        <InputError message={errors.purchase_return_date}/>
                                    </div>
                                </div>
                                <div className='mb-4 flex lg:flex-row gap-4'>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Jenis Retur<span className='text-rose-500'>*</span></Label>
                                        <Select value={data.refund_method} onValueChange={(value) => setData('refund_method', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Jenis Refund" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='refund'>Pengembalian Dana</SelectItem>
                                                <SelectItem value='replacement'>Pergantian Barang</SelectItem>
                                                {data.order && data.order.payment_status == 'partial' &&
                                                    <SelectItem value='debt_reduction'>Pengurangan Hutang</SelectItem>
                                                }
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.refund_method}/>
                                    </div>
                                    <div className="w-full lg:w-1/2 flex flex-col gap-2">
                                        <Label>Status Retur<span className='text-rose-500'>*</span></Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Status Retur" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='pending'>Diajukan</SelectItem>
                                                <SelectItem value='confirmed'>Diterima</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status}/>
                                    </div>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Catatan Retur Pembelian</Label>
                                    <Textarea
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                        placeholder='Masukan catatan retur pembelian'
                                        rows={5}
                                    />
                                    <InputError message={errors.note}/>
                                </div>
                            </div>
                            {!data.loading ? data.order_details.length > 0 &&
                                <>
                                    <div className='border-t'>
                                        <div className='p-4 bg-secondary'>Detail Pembelian</div>
                                        <Table className='border-t border-b'>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className='w-lg'>Item</TableHead>
                                                    <TableHead>Kuantitas</TableHead>
                                                    <TableHead>Harga</TableHead>
                                                    <TableHead>Total Harga</TableHead>
                                                    <TableHead className='w-[10px]'>Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.order_details.map((detail : any, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>
                                                            {productName(detail.items_type, detail)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {detail.quantity}
                                                        </TableCell>
                                                        <TableCell>
                                                            {detail.price}
                                                        </TableCell>
                                                        <TableCell>
                                                            {detail.total_price}
                                                        </TableCell>
                                                        <TableCell className='w-[10px]'>
                                                            {data.selectedReturn.map((item: any) => item.id).includes(detail.id) ?
                                                                <Button disabled variant={'secondary'} size={'sm'}>
                                                                    <CircleX/>
                                                                    Item Sudah Ditambahkan
                                                                </Button>
                                                                :
                                                                <Button type='button' variant={'secondary'} size={'sm'} onClick={() => addItem(detail.id)}>
                                                                    <CheckCircle/>
                                                                    Tambahkan Item
                                                                </Button>
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {data.selectedReturn.length > 0 &&
                                        <div className='border-t'>
                                            <div className='p-4 bg-secondary'>Retur Penjualan</div>
                                            <Table className='border-t'>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className='text-center w-[10px]'>#</TableHead>
                                                        <TableHead>Item</TableHead>
                                                        <TableHead>Alasan Retur<span className='text-rose-500'>*</span></TableHead>
                                                        <TableHead className='w-[100px]'>Kuantitas</TableHead>
                                                        <TableHead className='w-[100px]'>Retur<span className='text-rose-500'>*</span></TableHead>
                                                        <TableHead className='w-[200px]'>Total Harga</TableHead>
                                                        <TableHead className='text-center w-[10px]'>Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {data.selectedReturn.map((item, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="align-center">
                                                                <div className='text-center'>{i + 1}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.name}
                                                                <div>
                                                                    <small>Harga : {item.price}</small>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input value={item.reason} onChange={(e) => setReturData(i, 'reason', e.target.value)}/>
                                                                {(errors as any)[`selectedReturn.${i}.reason`] && <span className="text-xs text-red-500">{(errors as any)[`selectedReturn.${i}.reason`]}</span>}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input value={item.quantity} readOnly className='cursor-not-allowed bg-secondary'/>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input value={item.retur_quantity} onChange={(e) => setReturData(i, 'retur_quantity', e.target.value)}/>
                                                                {(errors as any)[`selectedReturn.${i}.retur_quantity`] && <span className="text-xs text-red-500">{(errors as any)[`selectedReturn.${i}.retur_quantity`]}</span>}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input value={item.total_price} readOnly className='cursor-not-allowed bg-secondary'/>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className='flex items-center justify-center'>
                                                                    <Button variant={'secondary'} size={'sm'} onClick={() => setData('selectedReturn', data.selectedReturn.filter((_, index) => index !== i))}>
                                                                        <CircleX/>
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {data.refund_method == 'refund' &&
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-right font-semibold py-3">Total Pengembalian Dana</TableCell>
                                                            <TableCell colSpan={2}>
                                                                <Input type="text" readOnly value={data.sub_total} className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' />
                                                                <p className="text-red-500 text-xs">{errors.sub_total}</p>
                                                            </TableCell>
                                                        </TableRow>
                                                    }
                                                </TableBody>
                                            </Table>
                                        </div>
                                    }
                                </>
                            :
                                <>
                                    <TableCard className='mt-10 mb-4'>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className='w-[10px]'>
                                                        <div className='flex items-center justify-center'>
                                                            <Skeleton className="w-10 h-4"/>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className='w-[400px]'><Skeleton className="w-16 h-4"/></TableHead>
                                                    <TableHead><Skeleton className="w-16 h-4"/></TableHead>
                                                    <TableHead className='w-[100px]'>
                                                        <div className='flex items-center justify-center'>
                                                            <Skeleton className="w-16 h-4"/>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className='w-[150px]'><Skeleton className="w-16 h-4"/></TableHead>
                                                    <TableHead className='w-[150px]'><Skeleton className="w-16 h-4"/></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>
                                                            <div className='flex items-center justify-center'>
                                                                <Skeleton className="w-10 h-4"/>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Skeleton className="w-48 h-4"/>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Skeleton className="w-16 h-4"/>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className='flex items-center justify-center'>
                                                                <Skeleton className="w-16 h-4"/>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className='flex items-center justify-end'>
                                                                <Skeleton className="w-16 h-4"/>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className='flex items-center justify-end'>
                                                                <Skeleton className="w-16 h-4"/>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableCard>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-10 w-28 rounded-md" />
                                        <Skeleton className="h-10 w-32 rounded-md" />
                                    </div>
                                </>
                            }
                        </CardContent>
                        <CardFooter className='border-t p-4 w-full overflow-x-auto'>
                            <div className="flex justify-end items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.transaction-returns.index')}><ArrowLeft /> Kembali</Link>
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
