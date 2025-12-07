import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { ActionButton } from '@/components/action-button';
import { Coupon, CouponLink } from '@/types/coupon';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ModalDelete } from '@/components/modal-delete';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Diskon',
        href: route('apps.coupons.index'),
    },
];

interface IndexProps {
    coupons: {
        data: Coupon[],
        links: CouponLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { coupons, perPage, currentPage } = usePage<IndexProps>().props;

    const {data, setData} = useForm({
        id: '',
    })

    const [deleteModal, setDeleteModal] = React.useState(false);

    const handleModalDelete = (coupon: Coupon) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: coupon.id,
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Diskon'/>
            <div className='p-6'>
                <Heading title='Diskon' description='Halaman ini digunakan untuk mengelola data diskon'/>
                {hasAnyPermission(['coupons-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.coupons.create')}>
                            <PlusCircle className="size-4"/> <span className="hidden sm:inline-flex font-semibold">Tambah Diskon</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.coupons.index')}
                        placeholder="Cari data diskon berdasakan kode diskon"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Kode Diskon</TableHead>
                                <TableHead>Jumlah Diskon</TableHead>
                                <TableHead className='w-[10px]'>Jenis Diskon</TableHead>
                                <TableHead className='w-[10px]'>Status</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.data.length === 0 ?
                                <TableEmpty colSpan={6} message='data diskon'/>
                                :
                                coupons.data.map((coupon, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{coupon.code}</TableCell>
                                        <TableCell>
                                            {coupon.type == 'rupiah' && <sup>Rp</sup>} {coupon.value}{coupon.type == 'percentage' && '%'}
                                        </TableCell>
                                        <TableCell className='capitalize'>{coupon.type}</TableCell>
                                        <TableCell className='capitalize'>
                                            {coupon.is_active == '1'
                                                ? <Badge variant={'default'}>Aktif</Badge>
                                                : <Badge variant={'destructive'}>Tidak Aktif</Badge>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['coupons-update']) || hasAnyPermission(['coupons-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='coupons'
                                                        actionEditHref={route('apps.coupons.edit', coupon.id)}
                                                        actionDelete={() => handleModalDelete(coupon)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.coupons.destroy', data.id)}/>
                <PagePagination data={coupons}/>
            </div>
        </AppLayout>
    )
}
