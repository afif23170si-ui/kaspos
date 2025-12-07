/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout'
import PagePagination from '@/components/page-pagination';
import { User, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import Heading from '@/components/heading';
import { Setting } from '@/types/setting';
import { Transaction, TransactionLink } from '@/types/transaction';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/action-button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Coins, FileText, Printer } from 'lucide-react';
import { ModalDelete } from '@/components/modal-delete';
import { toast } from 'sonner';
import axios from 'axios';
import SheetPayment from './sheet-payment';
import { BankAccount } from '@/types/bank';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Retur Penjualan',
        href: '#',
    },
];

interface IndexProps {
    transactions: {
        data: Transaction[],
        links: TransactionLink[],
        current_page: number,
        per_page: number
    };
    perPage: number;
    currentPage: number;
    cashiers: User[];
    platforms: Setting[];
    banks: BankAccount[];
    [key: string]: unknown;
}

export default function Index() {

    const { transactions, perPage, currentPage, platforms, cashiers, banks } = usePage<IndexProps>().props;

    const statusColor = (status: string) => {
        switch (status) {
            case 'unpaid':
                return <Badge variant={'destructive'} className='capitalize'>Belum Bayar</Badge>
            case 'pending':
                return <Badge variant='destructive' className='capitalize'>Pending</Badge>
            case 'partial':
                return <Badge variant='secondary' className='capitalize'>Partial</Badge>
            case 'paid':
                return <Badge variant='default' className='capitalize'>Paid</Badge>
        }
    }

    const { data, setData } = useForm({
        id: '',
        transaction: null as any
    });

    const [deleteModal, setDeleteModal] = React.useState(false);

    const handleModalDelete = (transaction: Transaction) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: transaction.id,
        }))
    }

    const handlePrintReceipt = async (transaction: Transaction) => {
        try {
            await axios.post(route('apps.transactions.print-receipt', transaction.id));
            toast.success("Struk berhasil dicetak");
        } catch (error) {
            console.error(error);
            toast.error('Gagal mencetak Struk')
        }
    }

    const [openSheet, setOpenSheet] = useState(false);

    const openSheetPayment = (transaction: Transaction) => {
        setOpenSheet(!openSheet);
        setData(prevData => ({
            ...prevData,
            transaction: transaction
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Penjualan' />
            <div className='p-6'>
                <Heading title='Penjualan' description='Halaman ini digunakan untuk mengelola data penjualan'/>
                <div className="mt-6">
                    <TableFilter
                        withFilterStatus
                        withFilterDate
                        withFilterPlatform
                        withFilterShipping
                        withFilterCashier
                        platforms={platforms}
                        cashiers={cashiers}
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.transactions.index')}
                        placeholder="Cari data penjualan berdasarkan No. Invoice, Nama Customer, No Referensi, No Resi"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>No. Invoice</TableHead>
                                <TableHead>Tipe Transaksi</TableHead>
                                <TableHead>Platform</TableHead>
                                <TableHead className='w-[10px] text-center'>Status Pembayaran</TableHead>
                                <TableHead className='w-[10px] text-center'>Total Bayar</TableHead>
                                <TableHead>Bayar</TableHead>
                                <TableHead>Sisa Bayar</TableHead>
                                <TableHead>Status Pengiriman</TableHead>
                                <TableHead>No. Resi</TableHead>
                                <TableHead>No. Referensi</TableHead>
                                <TableHead>Nama Customer</TableHead>
                                <TableHead>Nama Kasir</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.length === 0 ?
                                <TableEmpty colSpan={9} message='data retur penjualan' />
                                :
                                transactions.data.map((transaction, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{++index + (transactions.current_page - 1) * transactions.per_page}</TableCell>
                                        <TableCell>{transaction.transaction_date}</TableCell>
                                        <TableCell>{transaction.invoice}</TableCell>
                                        <TableCell>{transaction.transaction_type}</TableCell>
                                        <TableCell>{transaction.platform ?? '-'}</TableCell>
                                        <TableCell className='text-center'>
                                           {statusColor(transaction.status)}
                                        </TableCell>
                                        <TableCell><sup>Rp</sup> {transaction.grand_total}</TableCell>
                                        <TableCell><sup>Rp</sup> {transaction.pay}</TableCell>
                                        <TableCell><sup>Rp</sup> {String(transaction.remaining)}</TableCell>
                                        <TableCell>{transaction.shipping_status ?? '-'}</TableCell>
                                        <TableCell>{transaction.shipping_ref ?? '-'}</TableCell>
                                        <TableCell>{transaction.notes_noref ?? '-'}</TableCell>
                                        <TableCell>{transaction.customer?.name ?? 'Umum'}</TableCell>
                                        <TableCell>{transaction.cashier_shift.user.name ?? '-'}</TableCell>
                                        <TableCell>
                                            <div className='flex items-center justify-center'>
                                                <ActionButton
                                                    permissionPrefix='transactions'
                                                    withEdit={false}
                                                    withDelete={transaction.status == 'pending'}
                                                    actionDelete={() => handleModalDelete(transaction)}
                                                >
                                                    {transaction.status != 'paid' &&
                                                        <DropdownMenuItem onClick={() => openSheetPayment(transaction)}>
                                                            <Coins/> Pelunasan Pembayaran
                                                        </DropdownMenuItem>
                                                    }
                                                    <DropdownMenuItem asChild>
                                                        <a
                                                            href={route('apps.transactions.print-invoice', transaction.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <FileText /> Cetak Invoice
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handlePrintReceipt(transaction)}>
                                                        <Printer /> Print Nota
                                                    </DropdownMenuItem>
                                                </ActionButton>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableCard>
                <SheetPayment open={openSheet} onOpenChange={setOpenSheet} transaction={data.transaction} banks={banks}/>
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.transactions.destroy', data.id)}/>
                <PagePagination data={transactions} />
            </div>
        </AppLayout>
    )
}
