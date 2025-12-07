import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlusCircle, LoaderCircle, Save, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Permission, PermissionLink } from '@/types/permission';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permissions',
        href: route('apps.permissions.index'),
    },
];

interface IndexProps {
    permissions: {
        data: Permission[],
        links: PermissionLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { permissions, perPage, currentPage } = usePage<IndexProps>().props;

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        id: '',
        name: '',
        open: false as boolean,
        isUpdate: false as boolean
    });

    const [deleteModal, setDeleteModal] = React.useState(false);


    transform((data) => ({
        ...data,
        _method: data.isUpdate ? 'put' : 'post',
    }))


    const handleModalUpdate = (permission: Permission) => {
        setData(prevData => ({
            ...prevData,
            id: permission.id,
            name: permission.name,
            open: true,
            isUpdate: true
        }))
    }


    const handleModalDelete = (permission: Permission) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: permission.id,
        }))
    }

    const storeData = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(data.isUpdate)
            post(route('apps.permissions.update', data.id), {
                onSuccess: () => {
                    toast('Data has been saved.')
                    reset()
                },
            });
        else
            post(route('apps.permissions.store'), {
                onSuccess: () => {
                    toast('Data has been saved.')
                    reset()
                },
            });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Permissions'/>
            <div className='p-6'>
                <Dialog
                    open={data.open}
                    onOpenChange={(open) => setData({
                        ...data, open: open, name: '', id: '', isUpdate: false
                    })}
                >
                    {hasAnyPermission(['permissions-create']) &&
                        <DialogTrigger className="h-9 px-4 py-2 has-[>svg]:px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructivee border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex">Add New Permission</span>
                        </DialogTrigger>
                    }
                    <DialogContent className='p-0' aria-describedby='modal-create'>
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle>{data.isUpdate ? 'Edit' : 'Create'} Permission</DialogTitle>
                            <DialogDescription>{data.isUpdate ? 'This form for edit permission' : 'This form for create permission'}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={storeData}>
                            <div className='px-4 py-2'>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Permissions Name<span className='text-rose-500'>*</span></Label>
                                    <Input type="text" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)}  placeholder="Input permissions name"/>
                                    <p className="text-red-500 text-xs">{errors.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="destructive" type="button" onClick={() => reset()}>
                                        <X/> Cancel
                                    </Button>
                                    <Button variant="default" type="submit" disabled={processing}>
                                        {processing ? <LoaderCircle className="animate-spin" /> : <Save /> } Save Data
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.permissions.index')}
                        placeholder="Search permissions by permission name"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Permission</TableHead>
                                <TableHead className='w-[10px]'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.data.length === 0 ?
                                <TableEmpty colSpan={3} message='data permissions'/>
                                :
                                permissions.data.map((permission, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{permission.name}</TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['permissions-update']) || hasAnyPermission(['permissions-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='permissions'
                                                        isModal
                                                        actionEdit={() => handleModalUpdate(permission)}
                                                        actionDelete={() => handleModalDelete(permission)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.permissions.destroy', data.id)}/>
                <PagePagination data={permissions}/>
            </div>
        </AppLayout>
    )
}
