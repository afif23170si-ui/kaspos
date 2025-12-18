/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout'
import PagePagination from '@/components/page-pagination';
import { User, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import Heading from '@/components/heading';
import { Setting } from '@/types/setting';
import { Transaction, TransactionLink } from '@/types/transaction';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/action-button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Coins, FileText, Printer, Trash2, AlertTriangle, Download } from 'lucide-react';
import { ModalDelete } from '@/components/modal-delete';
import { toast } from 'sonner';
import axios from 'axios';
import SheetPayment from './sheet-payment';
import { BankAccount } from '@/types/bank';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

    // Reset sales state
    const [resetModal, setResetModal] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const handleExportAndReset = async () => {
        if (!resetPassword.trim()) {
            toast.error('Masukkan password untuk konfirmasi');
            return;
        }

        setIsResetting(true);
        
        try {
            // First, download the export
            window.open(route('apps.transactions.export-all'), '_blank');
            
            // Wait a moment for download to start, then reset
            setTimeout(() => {
                router.post(route('apps.transactions.reset-all'), {
                    password: resetPassword
                }, {
                    onSuccess: () => {
                        toast.success('Data penjualan berhasil dihapus');
                        setResetModal(false);
                        setResetPassword('');
                    },
                    onError: (errors: any) => {
                        toast.error(errors.password || 'Gagal menghapus data');
                    },
                    onFinish: () => {
                        setIsResetting(false);
                    }
                });
            }, 1000);
        } catch (error) {
            toast.error('Terjadi kesalahan');
            setIsResetting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Penjualan' />
            <div className='p-6'>
                <div className="flex items-start justify-between gap-4">
                    <Heading title='Penjualan' description='Halaman ini digunakan untuk mengelola data penjualan'/>
                    <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setResetModal(true)}
                        className="flex-shrink-0"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reset Data
                    </Button>
                </div>
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

                {/* Reset Data Dialog */}
                <Dialog open={resetModal} onOpenChange={setResetModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Reset Semua Data Penjualan
                            </DialogTitle>
                            <DialogDescription className="text-left">
                                <span className="block mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                                    <strong>PERINGATAN:</strong> Tindakan ini akan menghapus SEMUA data transaksi secara permanen. Data akan di-export ke CSV terlebih dahulu sebagai backup.
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium block mb-2">
                                    Masukkan password Anda untuk konfirmasi:
                                </label>
                                <input
                                    type="password"
                                    value={resetPassword}
                                    onChange={(e) => setResetPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800"
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setResetModal(false);
                                    setResetPassword('');
                                }}
                                disabled={isResetting}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleExportAndReset}
                                disabled={isResetting || !resetPassword.trim()}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isResetting ? 'Memproses...' : 'Export & Reset Data'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    )
}
