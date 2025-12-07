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
import { Material, MaterialLink } from '@/types/material';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ingredients',
        href: route('apps.materials.index'),
    },
];

interface IndexProps {
    materials: {
        data: Material[],
        links: MaterialLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { materials, perPage, currentPage } = usePage<IndexProps>().props;

    console.log(materials);

    const [deleteModal, setDeleteModal] = React.useState(false);

    const {data, setData} = useForm({
        id: '',
    })


    const handleModalDelete = (material: Material) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: material.id,
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Ingredients'/>
            <div className='p-6'>
                {hasAnyPermission(['materials-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.materials.create')}>
                            <PlusCircle className="size-4"/> <span className="hidden sm:inline-flex font-semibold">Add New Ingredients</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.materials.index')}
                        placeholder="Search ingredients by ingredient name"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Initial Qty</TableHead>
                                <TableHead>Minimum Qty</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className='w-[10px]'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.data.length === 0 ?
                                <TableEmpty colSpan={7} message='data ingredients'/>
                                :
                                materials.data.map((material, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                         <TableCell>{material.name}</TableCell>
                                        <TableCell>{material.unit.name}</TableCell>
                                        <TableCell>{material.initial_stock.quantity}</TableCell>
                                        <TableCell>{material.minimum_qty}</TableCell>
                                        <TableCell>
                                            <sup>Rp</sup> {material.price}
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['materials-update']) || hasAnyPermission(['materials-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='materials'
                                                        actionEditHref={route('apps.materials.edit', material.id)}
                                                        actionDelete={() => handleModalDelete(material)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.materials.destroy', data.id)}/>
                <PagePagination data={materials}/>
            </div>
        </AppLayout>
    )
}
