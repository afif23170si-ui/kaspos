import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Info } from 'lucide-react';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import { Menu, MenuLink } from '@/types/menu';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from "@/components/ui/tooltip";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Menu',
        href: route('apps.menus.index'),
    },
];

interface IndexProps {
    menus: {
        data: Menu[],
        links: MenuLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { menus, perPage, currentPage } = usePage<IndexProps>().props;

    const [deleteModal, setDeleteModal] = React.useState(false);

    const { data, setData } = useForm({
        id: '',
    })


    const handleModalDelete = (menu: Menu) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: menu.id,
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Menus' />
            <div className='p-6'>
                {hasAnyPermission(['menus-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.menus.create')}>
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex font-semibold">Tambah Menu</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.menus.index')}
                        placeholder="Cari data menu berdasarkan nama menu"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead className='w-[10px]'>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Capital Price</TableHead>
                                <TableHead>Selling Price</TableHead>
                                <TableHead className="flex items-center gap-1">Margin
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-pointer">
                                                <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Margin di sini adalah <strong>markup</strong> (dihitung dari modal), yang berguna untuk <strong>menentukan harga jual dari modal</strong>.<br />
                                            Contoh: Jika modal = 10.000 dan harga jual = 15.000,<br />
                                            Maka margin = ((15.000 - 10.000) / 10.000) × 100% = <strong>50%</strong>
                                        </TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableHead className='w-[10px]'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menus.data.length === 0 ?
                                <TableEmpty colSpan={8} message='data menus' />
                                :
                                menus.data.map((menu, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>
                                            <img src={menu.image} className='w-10 h-10'/>
                                        </TableCell>
                                        <TableCell>{menu.name}</TableCell>
                                        <TableCell>{menu.category?.name}</TableCell>
                                        <TableCell><sup>Rp</sup> {menu.capital_price}</TableCell>
                                        <TableCell><sup>Rp</sup> {menu.selling_price}</TableCell>
                                        <TableCell>{menu.margin}%</TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['menus-update']) || hasAnyPermission(['menus-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='menus'
                                                        actionEditHref={route('apps.menus.edit', menu.id)}
                                                        actionDelete={() => handleModalDelete(menu)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.menus.destroy', data.id)} />
                <PagePagination data={menus} />
            </div>
        </AppLayout>
    )
}
