import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { ActionButton } from '@/components/action-button';
import { Customer, CustomerLink } from '@/types/customer';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ModalDelete } from '@/components/modal-delete';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pelanggan',
        href: route('apps.customers.index'),
    },
];

interface IndexProps {
    customers: {
        data: Customer[],
        links: CustomerLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { customers, perPage, currentPage } = usePage<IndexProps>().props;

    const {data, setData} = useForm({
        id: '',
    })

    const [deleteModal, setDeleteModal] = React.useState(false);

    const handleModalDelete = (customer: Customer) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: customer.id,
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Pelanggan'/>
            <div className='p-6'>
                <Heading title='Pelanggan' description='Halaman ini digunakan untuk mengelola data pelanggan'/>
                {hasAnyPermission(['customers-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.customers.create')}>
                            <PlusCircle className="size-4"/> <span className="hidden sm:inline-flex font-semibold">Tambah Pelanggan</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.customers.index')}
                        placeholder="Cari data pelanggan berdasarkan nama pelanggan"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Nama Pelanggan</TableHead>
                                <TableHead>Nomor Hp</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead className='text-center'>Point</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.data.length === 0 ?
                                <TableEmpty colSpan={7} message='data pelanggan'/>
                                :
                                customers.data.map((customer, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{customer.name}</TableCell>
                                        <TableCell>{customer.phone}</TableCell>
                                        <TableCell>{customer.email}</TableCell>
                                        <TableCell>{customer.address}</TableCell>
                                        <TableCell className='text-center'>{customer.available_points ?? 0}</TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['customers-update']) || hasAnyPermission(['customers-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='customers'
                                                        withDetail={true}
                                                        actionEditHref={route('apps.customers.edit', customer.id)}
                                                        actionDetailHref={route('apps.customers.show', customer.id)}
                                                        actionDelete={() => handleModalDelete(customer)}
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
                <PagePagination data={customers}/>
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.customers.destroy', data.id)}/>
            </div>
        </AppLayout>
    )
}
