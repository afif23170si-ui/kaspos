import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CirclePause, PlusCircle, XCircle } from 'lucide-react';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import { Order, OrderLink } from '@/types/order';
import Heading from '@/components/heading';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pembelian',
        href: route('apps.orders.index'),
    },
];

interface IndexProps {
    orders: {
        data: Order[],
        links: OrderLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { orders, perPage, currentPage } = usePage<IndexProps>().props;

    const [deleteModal, setDeleteModal] = React.useState(false);

    const { data, setData } = useForm({
        id: '',
    })


    const handleModalDelete = (order: Order) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: order.id,
        }))
    }

    const statusPayment = (status: string): React.ReactNode => {
        switch (status) {
            case 'paid':
                return <div className='flex items-center gap-1 text-green-500'><CheckCircle className='size-4'/> Lunas</div>
            case 'partial':
                return <div className='flex items-center gap-1 text-amber-500'><CirclePause className='size-4'/> Belum Lunas</div>
            case 'unpaid':
                return <div className='flex items-center gap-1 text-rose-500'><XCircle className='size-4'/> Belum Dibayar</div>
            default:
                return 'Status Tidak Dikenal';
        }
    };

    const statusOrder = (status: string): string => {
        switch (status) {
            case 'confirmed':
                return 'Dipesan';
            case 'received':
                return 'Diterima';
            case 'pending':
                return 'Tertunda';
            default:
                return 'Status Tidak Dikenal';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Pembelian' />
            <div className='p-6'>
                <Heading title='Pembelian' description='Halaman ini digunakan untuk mengelola data pembelian'/>
                {hasAnyPermission(['orders-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.orders.create')}>
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex font-semibold">Tambah Pembelian</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.orders.index')}
                        placeholder="Cari data pembelian berdasarkan nomor faktur pembelian"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Nomor Faktur</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Tanggal Pembelian</TableHead>
                                <TableHead className='w-[10px] text-center'>Jenis Pembelian</TableHead>
                                <TableHead className='w-[10px] text-center'>Status Pembelian</TableHead>
                                <TableHead className='w-[10px] text-center'>Status Pembayaran</TableHead>
                                <TableHead>Total Pembelian</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length === 0 ?
                                <TableEmpty colSpan={9} message='data pembelian' />
                                :
                                orders.data.map((order, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>
                                            {order.order_code}
                                        </TableCell>
                                        <TableCell>
                                            [{order.supplier.code}] {order.supplier.name}
                                        </TableCell>
                                        <TableCell>
                                            {order.order_date}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {order.type == 'products' ? 'Produk' : 'Bahan Baku'}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <Badge variant={'secondary'}>{statusOrder(order.order_status)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-1 justify-center'>
                                                {statusPayment(order.payment_status)}
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-right font-semibold'>
                                            <sup>Rp</sup> {order.grand_total}
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['orders-update']) || hasAnyPermission(['orders-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='orders'
                                                        withDetail
                                                        actionDetailHref={route('apps.orders.show', order.id)}
                                                        actionEditHref={route('apps.orders.edit', order.id)}
                                                        actionDelete={() => handleModalDelete(order)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.orders.destroy', data.id)} />
                <PagePagination data={orders} />
            </div>
        </AppLayout>
    )
}
