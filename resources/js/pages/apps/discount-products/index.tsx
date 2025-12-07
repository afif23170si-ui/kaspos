import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { ActionButton } from '@/components/action-button';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ModalDelete } from '@/components/modal-delete';
import { Badge } from '@/components/ui/badge';
import { DiscountProduct, DiscountProductLink } from '@/types/discount-product';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Diskon Produk',
        href: route('apps.discount-products.index'),
    },
];

interface IndexProps {
    discountProducts: {
        data: DiscountProduct[],
        links: DiscountProductLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { discountProducts, perPage, currentPage } = usePage<IndexProps>().props;

    const {data, setData} = useForm({
        id: '',
    })

    const [deleteModal, setDeleteModal] = React.useState(false);

    const handleModalDelete = (discountProduct: DiscountProduct) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: discountProduct.id,
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Diskon Produk'/>
            <div className='p-6'>
                <Heading title='Diskon Produk' description='Halaman ini digunakan untuk mengelola data diskon produk'/>
                {hasAnyPermission(['discount-products-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.discount-products.create')}>
                            <PlusCircle className="size-4"/> <span className="hidden sm:inline-flex font-semibold">Tambah Diskon Produk</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.discount-products.index')}
                        placeholder="Cari data diskon paket berdasakan nama diskon paket"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Nama Diskon Produk</TableHead>
                                <TableHead>Minimum Pembelian</TableHead>
                                <TableHead>Jenis Diskon</TableHead>
                                <TableHead>Total Diskon</TableHead>
                                <TableHead className='w-[10px]'>Status</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discountProducts.data.length === 0 ?
                                <TableEmpty colSpan={7} message='data diskon produk'/>
                                :
                                discountProducts.data.map((discountProduct, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{discountProduct.discount_name}</TableCell>
                                        <TableCell>{discountProduct.discount_quantity}</TableCell>
                                        <TableCell>{discountProduct.discount_type}</TableCell>
                                        <TableCell>{discountProduct.discount_value}</TableCell>
                                        <TableCell className='capitalize'>
                                            {discountProduct.is_active
                                                ? <Badge variant={'default'}>Aktif</Badge>
                                                : <Badge variant={'destructive'}>Tidak Aktif</Badge>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['discount-products-update']) || hasAnyPermission(['discount-products-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='discount-products'
                                                        withDetail
                                                        actionDetailHref={route('apps.discount-products.show', discountProduct.id)}
                                                        actionEditHref={route('apps.discount-products.edit', discountProduct.id)}
                                                        actionDelete={() => handleModalDelete(discountProduct)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.discount-products.destroy', data.id)}/>
                <PagePagination data={discountProducts}/>
            </div>
        </AppLayout>
    )
}
