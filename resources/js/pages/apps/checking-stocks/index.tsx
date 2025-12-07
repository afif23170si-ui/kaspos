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
import { CheckingStock } from '@/types/checking-stock';
import { CheckingStockDetail } from '@/types/checking-stock-detail';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stok Opname',
        href: '#',
    },
];

interface IndexProps {
    checkingStocks: {
        data: CheckingStock[],
        links: CheckingStockDetail[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { checkingStocks, perPage, currentPage } = usePage<IndexProps>().props;

    const [deleteModal, setDeleteModal] = React.useState(false);

    const { data, setData } = useForm({
        id: '',
    })


    const handleModalDelete = (CheckingStock: CheckingStock) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: CheckingStock.id,
        }))
    }

    const status = (status: string): string => {
        switch (status) {
            case 'draft':
                return 'Draft';
            case 'cancel':
                return 'Batal';
            case 'done':
                return 'Selesai';
            default:
                return 'Status Tidak Dikenal';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Stok Opname' />
            <div className='p-6'>
                <Heading title='Tambah Stok Opname' description='Halaman ini digunakan untuk mengelola data stok opname'/>
                {hasAnyPermission(['checking-stocks-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.checking-stocks.create')}>
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex font-semibold">Tambah Stok Opname</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.checking-stocks.index')}
                        placeholder="Cari data pembelian berdasarkan nomor faktur pembelian"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Nomor Referensi</TableHead>
                                <TableHead>Tanggal Stok Opname</TableHead>
                                <TableHead>Jenis Stok Opname</TableHead>
                                <TableHead>Petugas</TableHead>
                                <TableHead className='w-[10px] text-center'>Status</TableHead>
                                <TableHead className='w-[10px] text-center'>Total Items</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {checkingStocks.data.length === 0 ?
                                <TableEmpty colSpan={9} message='data pembelian' />
                                :
                                checkingStocks.data.map((checkingStock, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>
                                            {checkingStock.no_ref}
                                        </TableCell>
                                        <TableCell>
                                            {checkingStock.due_date}
                                        </TableCell>
                                        <TableCell>
                                            {checkingStock.type == 'products' ? 'Produk' : 'Bahan Baku'}
                                        </TableCell>
                                        <TableCell>
                                            {checkingStock.user.name}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <Badge variant={'secondary'}>{status(checkingStock.status)}</Badge>
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {checkingStock.details_count}
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['checking-stocks-update']) || hasAnyPermission(['checking-stocks-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='checking-stocks'
                                                        withDetail
                                                        actionDetailHref={route('apps.checking-stocks.show', checkingStock.id)}
                                                        actionEditHref={route('apps.checking-stocks.edit', checkingStock.id)}
                                                        actionDelete={() => handleModalDelete(checkingStock)}
                                                        withDelete={checkingStock.status == 'draft'}
                                                        withEdit={checkingStock.status != 'done'}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.checking-stocks.destroy', data.id)} />
                <PagePagination data={checkingStocks} />
            </div>
        </AppLayout>
    )
}
