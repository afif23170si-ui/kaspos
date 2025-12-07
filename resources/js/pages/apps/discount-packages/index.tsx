import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { ActionButton } from '@/components/action-button';
import { DiscountPackage, DiscountPackageLink } from '@/types/discount-package';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ModalDelete } from '@/components/modal-delete';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Diskon Paket',
        href: route('apps.discount-packages.index'),
    },
];

interface IndexProps {
    discountPackages: {
        data: DiscountPackage[],
        links: DiscountPackageLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { discountPackages, perPage, currentPage } = usePage<IndexProps>().props;

    const {data, setData} = useForm({
        id: '',
    })

    const [deleteModal, setDeleteModal] = React.useState(false);

    const handleModalDelete = (discountPackage: DiscountPackage) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: discountPackage.id,
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Diskon Paket'/>
            <div className='p-6'>
                <Heading title='Diskon Paket' description='Halaman ini digunakan untuk mengelola data diskon paket'/>
                {hasAnyPermission(['discount-packages-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.discount-packages.create')}>
                            <PlusCircle className="size-4"/> <span className="hidden sm:inline-flex font-semibold">Tambah Diskon Paket</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.discount-packages.index')}
                        placeholder="Cari data diskon paket berdasakan nama diskon paket"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Gambar Diskon Paket</TableHead>
                                <TableHead>Nama Diskon Paket</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead className='w-[10px]'>Status</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discountPackages.data.length === 0 ?
                                <TableEmpty colSpan={5} message='data diskon paket'/>
                                :
                                discountPackages.data.map((discountPackage, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>
                                            <img src={discountPackage.image} className='w-10 h-10'/>
                                        </TableCell>
                                        <TableCell>{discountPackage.name}</TableCell>
                                        <TableCell><sup>Rp</sup> {discountPackage.total_price.toLocaleString()}</TableCell>
                                        <TableCell className='capitalize'>
                                            {discountPackage.is_active == '1'
                                                ? <Badge variant={'default'}>Aktif</Badge>
                                                : <Badge variant={'destructive'}>Tidak Aktif</Badge>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['discount-packages-update']) || hasAnyPermission(['discount-packages-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='discount-packages'
                                                        withDetail
                                                        actionDetailHref={route('apps.discount-packages.show', discountPackage.id)}
                                                        actionEditHref={route('apps.discount-packages.edit', discountPackage.id)}
                                                        actionDelete={() => handleModalDelete(discountPackage)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.discount-packages.destroy', data.id)}/>
                <PagePagination data={discountPackages}/>
            </div>
        </AppLayout>
    )
}
