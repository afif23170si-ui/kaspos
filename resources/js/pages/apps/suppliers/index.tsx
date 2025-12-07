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
import { Supplier, SupplierLink } from '@/types/supplier';
import Heading from '@/components/heading';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supplier',
        href: route('apps.suppliers.index'),
    },
];

interface IndexProps {
    suppliers: {
        data: Supplier[],
        links: SupplierLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { suppliers, perPage, currentPage } = usePage<IndexProps>().props;

    const [deleteModal, setDeleteModal] = React.useState(false);

    const {data, setData} = useForm({
        id: '',
    })

    const handleModalDelete = (supplier: Supplier) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: supplier.id,
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Supplier'/>
            <div className='p-6'>
                <Heading title='Supplier' description='Halaman ini digunakan untuk mengelola data supplier'/>
                {hasAnyPermission(['suppliers-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.suppliers.create')}>
                            <PlusCircle className="size-4"/> <span className="hidden sm:inline-flex font-semibold">Tambah Supplier</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.suppliers.index')}
                        placeholder="Cari data supplier berdasarkan nama atau kode supplier"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Telp</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.data.length === 0 ?
                                <TableEmpty colSpan={7} message='data supplier'/>
                                :
                                suppliers.data.map((supplier, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                         <TableCell>{supplier.code}</TableCell>
                                        <TableCell>{supplier.name}</TableCell>
                                        <TableCell>{supplier.email}</TableCell>
                                        <TableCell>{supplier.phone}</TableCell>
                                        <TableCell>{supplier.address}</TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['suppliers-update']) || hasAnyPermission(['suppliers-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='suppliers'
                                                        actionEditHref={route('apps.suppliers.edit', supplier.id)}
                                                        actionDelete={() => handleModalDelete(supplier)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.suppliers.destroy', data.id)}/>
                <PagePagination data={suppliers}/>
            </div>
        </AppLayout>
    )
}
