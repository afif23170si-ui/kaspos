import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import { Product, ProductLink } from '@/types/product';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk',
        href: route('apps.products.index'),
    },
];

interface IndexProps {
    products: {
        data: Product[],
        links: ProductLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { products, perPage, currentPage } = usePage<IndexProps>().props;

    const [deleteModal, setDeleteModal] = React.useState(false);

    const { data, setData } = useForm({
        id: '',
    })

    const handleModalDelete = (product: Product) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: product.id,
        }))
    }

    const toBool = (v: unknown) => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'number') return v === 1;
        if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
        return false;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Produk' />
            <div className='p-6'>
                {hasAnyPermission(['products-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.products.create')}>
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex font-semibold">Tambah Produk</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.products.index')}
                        placeholder="Cari data produk berdasarkan nama produk"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead className='w-[10px]'>Gambar produk</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Nama Produk</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className='w-[10px]'>Jenis Produk</TableHead>
                                <TableHead className='w-[10px]'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length === 0 ?
                                <TableEmpty colSpan={6} message='data products' />
                                :
                                products.data.map((product, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>
                                            <img src={product.image} className='w-10 h-10'/>
                                        </TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.category?.name}</TableCell>
                                        <TableCell className='text-center'>
                                            <Badge>{toBool(product.has_variant) ? 'Varint' : 'Single'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['products-update']) || hasAnyPermission(['products-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='products'
                                                        withDetail
                                                        actionDetailHref={route('apps.products.show', product.id)}
                                                        actionEditHref={route('apps.products.edit', product.id)}
                                                        actionDelete={() => handleModalDelete(product)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.products.destroy', data.id)} />
                <PagePagination data={products} />
            </div>
        </AppLayout>
    )
}
