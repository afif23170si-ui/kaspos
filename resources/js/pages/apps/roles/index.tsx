import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import { Role, RoleLink } from '@/types/role';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: route('apps.roles.index'),
    },
];

interface IndexProps {
    roles: {
        data: Role[],
        links: RoleLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { roles, perPage, currentPage } = usePage<IndexProps>().props;

    const { data, setData } = useForm({
        id: '',
    });

    const [deleteModal, setDeleteModal] = React.useState(false);

    const handleModalDelete = (role: Role) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: role.id,
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Roles'/>
            <div className='p-6'>
                {hasAnyPermission(['roles-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.roles.create')}>
                            <PlusCircle className="size-4"/> <span className="hidden sm:inline-flex font-semibold">Add New Role</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.roles.index')}
                        placeholder="Search roles by role name"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Role Name</TableHead>
                                <TableHead>Permission</TableHead>
                                <TableHead className='w-[10px]'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.data.length === 0 ?
                                <TableEmpty colSpan={3} message='data roles'/>
                                :
                                roles.data.map((role, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{role.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.map((permission, i) => (
                                                    <Badge variant='default' key={i}>{permission.name}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['roles-update']) || hasAnyPermission(['roles-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='roles'
                                                        actionEditHref={route('apps.roles.edit', role.id)}
                                                        actionDelete={() => handleModalDelete(role)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.roles.destroy', data.id)}/>
                <PagePagination data={roles}/>
            </div>
        </AppLayout>
    )
}
