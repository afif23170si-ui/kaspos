/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BankAccount } from '@/types/bank';
import { Transaction } from '@/types/transaction';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, PlusCircle, Save, Trash, X } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface SheetPaymentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction;
    banks: BankAccount[];
}

export default function SheetPayment({ open, onOpenChange, transaction, banks }: SheetPaymentProps) {
    const initialRemaining = Number(transaction?.remaining_payment ?? 0);

    const { data, setData, errors, processing, post, reset, clearErrors } = useForm({
        payments: [{ payment_date: '', payment_method: '', payment_account: '', total_pay: 0 }],
        total_payment: 0,
        remaining_payment: Number(initialRemaining),
    });

    React.useEffect(() => {
        if (open) {
            const sisaAwal = Number(transaction?.remaining_payment ?? 0);
            setData({
                payments: [{ payment_date: '', payment_method: '', payment_account: '', total_pay: 0 }],
                total_payment: 0,
                remaining_payment: sisaAwal,
            });
        }
    }, [open, transaction?.id]);


    const recomputeTotals = (rows: any[]) => {
        const total = rows.reduce((sum, r) => sum + (Number(r.total_pay) || 0), 0);
        const remaining = Math.max(initialRemaining - total, 0);
        setData(prev => ({ ...prev, total_payment: total, remaining_payment: remaining }));
    };

   const setPaymentsData = (index: number, field: string, value: string | number) => {
        const updatedItems = [...data.payments];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        const totalPayment = updatedItems.reduce((total, item) => total + (item.total_pay || 0), 0);

        setData({ ...data, payments: updatedItems, total_payment: totalPayment });
        recomputeTotals(updatedItems);
    };

    const addMoreColumnPayment = () => {
        const updated = [...data.payments, { payment_date: '', payment_method: '', payment_account: '', total_pay: 0 }];
        setData(prev => ({ ...prev, payments: updated }));
        recomputeTotals(updated);
    };

    const removeColumnPayment = (key: number) => {
        if (data.payments.length === 1) return;
        const updated = data.payments.filter((_, i) => i !== key);
        setData(prev => ({ ...prev, payments: updated }));
        recomputeTotals(updated);
    };

    const handleClose = () => {
        onOpenChange(false);
        clearErrors();
        reset();
        setData({
            payments: [{ payment_date: '', payment_method: '', payment_account: '', total_pay: 0 }],
            total_payment: 0,
            remaining_payment: initialRemaining,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.total_payment <= 0) {
            toast.error('Total bayar harus lebih dari 0.');
            return;
        }
        if (data.total_payment > initialRemaining) {
            toast.error('Total bayar tidak boleh melebihi sisa bayar.');
            return;
        }

        post(route('apps.transactions.payments', transaction.id), {
            onSuccess: () => {
                toast.success('Data berhasil disimpan')
                handleClose();
            },
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="md:w-[600px] md:max-w-[600px] lg:w-[800px] lg:max-w-[800px]">
                <form onSubmit={handleSubmit}>
                    <SheetHeader>
                        <SheetTitle>Pelunasan Pembayaran</SheetTitle>
                        <SheetDescription>Form ini digunakan untuk melakukan pelunasan pembayaran</SheetDescription>
                    </SheetHeader>
                    <Table className="mt-0 border-t border-b">
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Tanggal Pembayaran<span className="text-rose-500">*</span></TableHead>
                                <TableHead>Metode Pembayaran<span className="text-rose-500">*</span></TableHead>
                                <TableHead>Akun Bank</TableHead>
                                <TableHead>Jumlah Bayar<span className="text-rose-500">*</span></TableHead>
                                <TableHead className="text-center w-[10px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.payments.map((p, i) => (
                                <TableRow key={i}>
                                    <TableCell className="align-center">
                                        <div className="text-center">{i + 1}</div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <DatePicker
                                            date={p.payment_date}
                                            setDate={(val) => setPaymentsData(i, 'payment_date', val as string)}
                                            label="Pilih Tanggal Pembayaran"
                                        />
                                        {(errors as any)[`payments.${i}.payment_date`] && (
                                            <div className="text-xs text-red-500">{(errors as any)[`payments.${i}.payment_date`]}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Select value={p.payment_method} onValueChange={(val) => setPaymentsData(i, 'payment_method', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Metode Pembayaran" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="transfer">Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {(errors as any)[`payments.${i}.payment_method`] && (
                                            <div className="text-xs text-red-500">{(errors as any)[`payments.${i}.payment_method`]}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        {(p.payment_method === 'transfer' || p.payment_method === 'credit') && (
                                            <Select value={p.payment_account} onValueChange={(val) => setPaymentsData(i, 'payment_account', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Akun Bank" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {banks.map((bank) => (
                                                        <SelectItem key={bank.id} value={bank.id.toString()}>
                                                            {bank.bank_name} - {bank.account_name} [{bank.account_number}]
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Input
                                            type="number"
                                            inputMode="numeric"
                                            name="total_pay"
                                            value={p.total_pay}
                                            onChange={(e) => setPaymentsData(i, 'total_pay', Number(e.target.value))}
                                            min={0}
                                        />
                                        {(errors as any)[`payments.${i}.total_pay`] && (
                                            <div className="text-xs text-red-500">{(errors as any)[`payments.${i}.total_pay`]}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-start justify-center">
                                            <Button type="button" variant="destructive" onClick={() => removeColumnPayment(i)} disabled={i === 0 && data.payments.length === 1}>
                                                {i === 0 && data.payments.length === 1 ? <X /> : <Trash />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={4} className="text-right font-semibold py-3">
                                    Total Bayar
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <Input type="text" readOnly value={data.total_payment} className="dark:bg-zinc-800 bg-gray-100 cursor-not-allowed" />
                                    <p className="text-red-500 text-xs">{(errors as any).total_payment}</p>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={4} className="text-right font-semibold py-3">
                                    Sisa Bayar
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <Input type="text" readOnly value={data.remaining_payment} className="dark:bg-zinc-800 bg-gray-100 cursor-not-allowed" />
                                    <p className="text-red-500 text-xs">{(errors as any).remaining_payment}</p>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="p-4">
                        <Button type="button" onClick={addMoreColumnPayment} variant="outline" size="sm">
                            <PlusCircle /> Tambah Kolom
                        </Button>
                    </div>
                    <div className="flex justify-end items-center gap-2">
                        <Button type="button" variant="destructive" onClick={handleClose}>
                            <ArrowLeft /> Kembali
                        </Button>
                        <Button variant="secondary" type="submit" disabled={processing}>
                            {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
