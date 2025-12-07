/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table'
import DatePicker from '@/components/ui/date-picker'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card'
import { useForm } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types';
import { ExpenseCategory } from '@/types/expense-category'
import { ExpenseSubcategory } from '@/types/expense-subcategory'
import axios from 'axios'
import { X, PlusCircle, Trash, ArrowLeft, Save, LoaderCircle } from 'lucide-react'
import { BankAccount } from '@/types/bank'
import { toast } from 'sonner'


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengeluaran',
        href: route('apps.expenses.index'),
    },
    {
        title: 'Tambah Pengeluaran',
        href: '#',
    },
];

interface CreateProps {
    expensee_number: string;
    expenses_categories: ExpenseCategory[];
    banks: BankAccount[];
    [key: string]: unknown;
}

export default function Create() {

    const { expensee_number, expenses_categories, banks } = usePage<CreateProps>().props;

    const { data, setData, processing, post, errors } = useForm({
        expensee_number: expensee_number,
        reference_number: '',
        date: '',
        expense_category_id: '',
        expense_subcategories: [],
        expense_subcategory_id: '',
        amount: '',
        payment_status: '',
        description: '',
        file: null as File | null,
        sub_total: 0,
        grand_total: 0,
        remaining_payment: 0,
        total_payment: 0,
        withPayment: false as boolean,
        payments: [
            { payment_date : '', payment_method: '', payment_account: '', total_pay: 0 }
        ],
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0])
        }
    }

    const getSubcategories = async () => {
        try{
            const response = await axios.get(route('apps.options.get-expense-subcategories', data.expense_category_id));
            setData('expense_subcategories', response.data.data);
        }catch(e){
            console.log(e);
        }
    }

    useEffect(() => {
        if(data.expense_category_id)
            getSubcategories()
    }, [data.expense_category_id])

    const setPaymentsData = (index: number, field: string, value: string | number) => {
        const updatedPayments = [...data.payments];

        updatedPayments[index] = {
            ...updatedPayments[index],
            [field]: value,
        };

        const totalPayment = updatedPayments.reduce((total, item) => total + Number(item.total_pay || 0), 0);
        const amount = Number(data.amount) || 0;
        const remaining = amount - totalPayment;

        setData({
            ...data,
            payments: updatedPayments,
            total_payment: totalPayment,
            remaining_payment: remaining < 0 ? 0 : remaining,
        });
    };


    const addMoreColumnPayment = () => {
        setData(prevData => ({
            ...prevData,
            payments: [...prevData.payments, {payment_date : '', payment_method: '', payment_account: '', total_pay: 0}]
        }))
    }

    const removeColumnPayment = (key: number) => {
        const payments = [...data.payments];
        payments.splice(key, 1);

        const totalPayment = payments.reduce((total, item) => total + (item.total_pay || 0), 0);
        const amount = Number(data.amount) || 0;
        const remaining = amount - totalPayment;

        setData({
            ...data,
            payments,
            total_payment: totalPayment,
            remaining_payment: remaining < 0 ? 0 : remaining
        });
    };

    useEffect(() => {
        const total = Number(data.total_payment) || 0;
        const amount = Number(data.amount) || 0;

        const remaining = amount - total;
        setData('remaining_payment', remaining < 0 ? 0 : remaining);
    }, [data.amount]);


    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(data.total_payment > Number(data.amount))
            return toast('Jumlah bayar tidak boleh melebihi grand total')
        else
            post(route('apps.expenses.store'), {
                onSuccess: () => {
                    toast('Data berhasil disimpan.')
                }
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pengeluaran" />
            <div className="p-6">
                <form onSubmit={storeData}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Input Pengeluaran / Biaya</CardTitle>
                            <CardDescription>Form ini digunakan untuk menambahkan data pengeluaran baru</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">

                                {/* No. Biaya (readonly) */}
                                <div className="flex flex-col gap-1">
                                    <Label>No. Biaya</Label>
                                    <Input readOnly value={data.expensee_number} />
                                </div>

                                {/* No. Referensi */}
                                <div className="flex flex-col gap-1">
                                    <Label>No. Referensi</Label>
                                    <Input
                                        type="text"
                                        placeholder="Nota-XX, INV-123, BuktiTransfer456"
                                        value={data.reference_number}
                                        onChange={e => setData('reference_number', e.target.value)}
                                        autoComplete="off"
                                    />
                                    <p className="text-red-500 text-xs">{errors.reference_number}</p>
                                </div>

                                {/* Tanggal */}
                                <div className="flex flex-col gap-1">
                                    <Label>Tanggal <span className="text-rose-500">*</span></Label>
                                    <Input
                                        type="date"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                    />
                                    <p className="text-red-500 text-xs">{errors.date}</p>
                                </div>

                                {/* Kategori Biaya */}
                                <div className="flex flex-col gap-1">
                                    <Label>Kategori Biaya <span className="text-rose-500">*</span></Label>
                                    <Select
                                        value={data.expense_category_id}
                                        onValueChange={value => setData('expense_category_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expenses_categories.map(item => (
                                                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-red-500 text-xs">{errors.expense_category_id}</p>
                                </div>

                                {/* Sub Kategori */}
                                <div className="flex flex-col gap-1">
                                    <Label>Sub Kategori <span className="text-rose-500">*</span></Label>
                                    <Select
                                        value={data.expense_subcategory_id.toString()}
                                        onValueChange={value => setData('expense_subcategory_id', value)}
                                        disabled={data.expense_subcategories.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={data.expense_subcategories.length === 0 ? "Pilih kategori dulu" : "Pilih sub kategori"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data.expense_subcategories.map((item: ExpenseSubcategory) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-red-500 text-xs">{errors.expense_subcategory_id}</p>
                                </div>

                                {/* Jumlah */}
                                <div className="flex flex-col gap-1">
                                    <Label>Jumlah (Rp) <span className="text-rose-500">*</span></Label>
                                    <Input
                                        type="number"
                                        placeholder="250000"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        min={0}
                                    />
                                    <p className="text-red-500 text-xs">{errors.amount}</p>
                                </div>

                                {/* Deskripsi (full width) */}
                                <div className="flex flex-col gap-1 lg:col-span-2">
                                    <Label>Deskripsi</Label>
                                    <Textarea
                                        placeholder="Contoh: Bayar gas Elpiji bulan Mei"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                    <p className="text-red-500 text-xs">{errors.description}</p>
                                </div>

                                {/* Bukti Pembayaran (full width) */}
                                <div className="flex flex-col gap-1 lg:col-span-2">
                                    <Label>Bukti Pembayaran (opsional)</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf, .jpg, .jpeg, .png"
                                        onChange={handleFileChange}
                                    />
                                    {data.file instanceof File && (
                                        <p className="text-sm text-gray-700 mt-1">File: {data.file.name}</p>
                                    )}
                                    <p className="text-red-500 text-xs">{errors.file}</p>
                                </div>
                                <div className='mb-4'>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="has-variant" checked={data.withPayment} onChange={() => setData('withPayment', !data.withPayment)} />
                                        <Label htmlFor="has-variant">Pengeluaran dengan pembayaran ?</Label>
                                    </div>
                                </div>

                                {data.withPayment &&
                                    <div className="flex flex-col gap-1 lg:col-span-2">
                                        <div className="p-4 bg-secondary w-full">Metode Pembayaran</div>
                                        <Table className="border-t border-b">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>#</TableHead>
                                                    <TableHead>
                                                        Tanggal Pembayaran <span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Metode Pembayaran <span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>Akun Bank</TableHead>
                                                    <TableHead>
                                                        Jumlah Bayar <span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead className="text-center w-[10px]">Aksi</TableHead>
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
                                                            />
                                                            {(errors as any)[`payments.${i}.payment_date`] && <div className="text-xs text-red-500">{(errors as any)[`payments.${i}.payment_date`]}</div>}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Select value={payment.payment_method} onValueChange={(e) => setPaymentsData(i, 'payment_method', e)}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih Metode Pembayaran" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="cash">Cash</SelectItem>
                                                                    <SelectItem value="transfer">Transfer</SelectItem>
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
                                                            <Input type="text" name='total_pay' value={payment.total_pay} onChange={(e) => setPaymentsData(i, 'total_pay', Number(e.target.value))} />
                                                            {(errors as any)[`payments.${i}.total_pay`] && <div className="text-xs text-red-500">{(errors as any)[`payments.${i}.total_pay`]}</div>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className='flex items-start justify-center'>
                                                                <Button type="button" variant="destructive" onClick={() => removeColumnPayment(i)} disabled={i === 0}>
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
                            </div>
                        </CardContent>
                        <CardFooter className='border-t p-4 w-full overflow-x-auto'>
                            <div className="flex justify-end items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.expenses.index')}><ArrowLeft/> Kembali</Link>
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
