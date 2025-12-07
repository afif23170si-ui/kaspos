import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle  } from 'lucide-react';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import Heading from '@/components/heading';
import { TransactionReturn, TransactionReturnLink } from '@/types/transaction-return';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Retur Penjualan',
        href: '#',
    },
];

interface IndexProps {
    transactionReturns: {
        data: TransactionReturn[],
        links: TransactionReturnLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { transactionReturns, perPage, currentPage } = usePage<IndexProps>().props;

    const [deleteModal, setDeleteModal] = React.useState(false);

    const { data, setData } = useForm({
        id: '',
    })

    const handleModalDelete = (transactionReturn: TransactionReturn) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: transactionReturn.id,
        }))
    }

    const refundMethod = (status: string): string => {
        switch (status) {
            case 'refund':
                return 'Pengembalian Dana';
            case 'replacement':
                return 'Pergantian Barang';
            default:
                return 'Status Tidak Dikenal';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Retur Penjualan' />
            <div className='p-6'>
                <Heading title='Return Penjualan' description='Halaman ini digunakan untuk mengelola data retur penjualan'/>
                {hasAnyPermission(['transaction-returns-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.transaction-returns.create')}>
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex font-semibold">Tambah Retur Penjualan</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.transaction-returns.index')}
                        placeholder="Cari data retur penjualan berdasarkan nomor faktur penjualan"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Nomor Retur Penjualan</TableHead>
                                <TableHead>Nomor Faktur Penjualan</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Tanggal Retur</TableHead>
                                <TableHead className='w-[10px] text-center'>Status Retur</TableHead>
                                <TableHead className='w-[10px] text-center'>Jenis Retur</TableHead>
                                <TableHead>Total Retur</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionReturns.data.length === 0 ?
                                <TableEmpty colSpan={9} message='data retur penjualan' />
                                :
                                transactionReturns.data.map((transactionReturn, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>
                                            {transactionReturn.return_code}
                                        </TableCell>
                                        <TableCell>
                                            {transactionReturn.transaction.invoice}
                                        </TableCell>
                                        <TableCell>
                                            {transactionReturn.transaction?.customer?.name ?? 'Umum'}
                                        </TableCell>
                                        <TableCell>
                                            {transactionReturn.return_date}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <Badge variant={'secondary'}>{transactionReturn.status == 'pending'? 'Diajukan' : 'Diterima'}</Badge>
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {refundMethod(transactionReturn.refund_method)}
                                        </TableCell>
                                        <TableCell className='text-right font-semibold'>
                                            <sup>Rp</sup> {transactionReturn.grand_total}
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['transaction-returns-update']) || hasAnyPermission(['transaction-returns-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='transaction-returns'
                                                        withDetail
                                                        actionDetailHref={route('apps.transaction-returns.show', transactionReturn.id)}
                                                        actionEditHref={route('apps.transaction-returns.edit', transactionReturn.id)}
                                                        actionDelete={() => handleModalDelete(transactionReturn)}
                                                        withDelete={transactionReturn.status == 'pending'}
                                                    />
                                                }
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableCard>
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.transaction-returns.destroy', data.id)} />
                <PagePagination data={transactionReturns} />
            </div>
        </AppLayout>
    )
}
