import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { User, UserLink, type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: route('apps.users.index'),
    },
];

interface IndexProps {
    users: {
        data: User[],
        links: UserLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { users, perPage, currentPage } = usePage<IndexProps>().props;

    const { data, setData } = useForm({
        id: '',
    });

    const [deleteModal, setDeleteModal] = React.useState(false);

    const handleModalDelete = (user: User) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: user.id
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Users'/>
            <div className='p-6'>
                {hasAnyPermission(['users-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.users.create')}>
                            <PlusCircle className="size-4"/> <span className="hidden sm:inline-flex font-semibold">Add New User</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.users.index')}
                        placeholder="Search users by name or username"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className='w-[10px]'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ?
                                <TableEmpty colSpan={6} message='data users'/>
                                :
                                users.data.map((user, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role, i) => (
                                                    <Badge variant='default' key={i}>{role.name}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['users-update']) || hasAnyPermission(['users-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='users'
                                                        withDetail
                                                        actionDetailHref={route('apps.users.show', user.id)}
                                                        actionEditHref={route('apps.users.edit', user.id)}
                                                        actionDelete={() => handleModalDelete(user)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.users.destroy', data.id)}/>
                <PagePagination data={users}/>
            </div>
        </AppLayout>
    )
}
