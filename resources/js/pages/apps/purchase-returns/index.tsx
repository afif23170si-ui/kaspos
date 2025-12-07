import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, PlusCircle  } from 'lucide-react';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import Heading from '@/components/heading';
import { PurchaseReturn, PurchaseReturnLink } from '@/types/purchase-return';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Retur Pembelian',
        href: '#',
    },
];

interface IndexProps {
    purchaseReturns: {
        data: PurchaseReturn[],
        links: PurchaseReturnLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { purchaseReturns, perPage, currentPage } = usePage<IndexProps>().props;

    const [deleteModal, setDeleteModal] = React.useState(false);

    const { data, setData } = useForm({
        id: '',
    })


    const handleModalDelete = (purchaseReturn: PurchaseReturn) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: purchaseReturn.id,
        }))
    }

    const refundMethod = (status: string): string => {
        switch (status) {
            case 'refund':
                return 'Pengembalian Dana';
            case 'replacement':
                return 'Pergantian Barang';
            case 'debt_reduction':
                return 'Pengurangan Hutang';
            default:
                return 'Status Tidak Dikenal';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Retur Pembelian' />
            <div className='p-6'>
                <Heading title='Return Pembelian' description='Halaman ini digunakan untuk mengelola data retur pembelian'/>
                {hasAnyPermission(['purhcase-returns-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.purchase-returns.create')}>
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex font-semibold">Tambah Retur Pembelian</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.purchase-returns.index')}
                        placeholder="Cari data pembelian berdasarkan nomor faktur pembelian"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Nomor Retur Pembelian</TableHead>
                                <TableHead>Nomor Faktur Pembelian</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Tanggal Retur</TableHead>
                                <TableHead className='w-[10px] text-center'>Status Retur</TableHead>
                                <TableHead className='w-[10px] text-center'>Jenis Retur</TableHead>
                                <TableHead>Total Retur</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseReturns.data.length === 0 ?
                                <TableEmpty colSpan={9} message='data pembelian' />
                                :
                                purchaseReturns.data.map((purchaseReturn, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>
                                            {purchaseReturn.return_code}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={route('apps.orders.show', purchaseReturn.order.id)} className='flex items-center gap-1'>
                                                <FileText size={15}/> {purchaseReturn.order.order_code}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            [{purchaseReturn.order.supplier.code}] {purchaseReturn.order.supplier.name}
                                        </TableCell>
                                        <TableCell>
                                            {purchaseReturn.return_date}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <Badge variant={'secondary'}>{purchaseReturn.status == 'pending'? 'Diajukan' : 'Diterima'}</Badge>
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {refundMethod(purchaseReturn.refund_method)}
                                        </TableCell>
                                        <TableCell className='text-right font-semibold'>
                                            <sup>Rp</sup> {purchaseReturn.grand_total}
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['purchase-returns-update']) || hasAnyPermission(['purchase-returns-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='purchase-returns'
                                                        withDetail
                                                        actionDetailHref={route('apps.purchase-returns.show', purchaseReturn.id)}
                                                        actionEditHref={route('apps.purchase-returns.edit', purchaseReturn.id)}
                                                        actionDelete={() => handleModalDelete(purchaseReturn)}
                                                        withDelete={purchaseReturn.status == 'pending'}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.purchase-returns.destroy', data.id)} />
                <PagePagination data={purchaseReturns} />
            </div>
        </AppLayout>
    )
}
