import React from 'react';
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Permission } from '@/types/permission';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableCard, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: route('apps.roles.index'),
    },
    {
        title: 'Create Role',
        href: '#',
    },
];

interface CreateProps {
    permissions: Permission[];
    [key: string]: unknown;
}

export default function Create() {

    const { permissions } = usePage<CreateProps>().props;

    const {data, setData, errors, processing, post, reset} = useForm({
        name: '',
        selectedPermissions: [] as string[]
    });

    const selectedPermission = (e: React.ChangeEvent<HTMLInputElement>) => {
        let permissionIds = data.selectedPermissions;

        if(permissionIds.some((name) => name === e.target.value))
           permissionIds = permissionIds.filter((name) => name !== e.target.value);
        else
            permissionIds.push(e.target.value);

        setData('selectedPermissions', permissionIds);
    };

    const selectAllPermission = (e: React.ChangeEvent<HTMLInputElement>) => {
        const permissionsIds = permissions.map(permission => permission.name);

        setData('selectedPermissions', e.target.checked ? permissionsIds : []);
    }

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.roles.store'), {
            onSuccess: () => {
                toast('Data has been saved.')
                reset()
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Create Role'/>
            <div className='p-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Create Role</CardTitle>
                        <CardDescription>This form for create role</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={storeData}>
                        <div className="mb-4 flex flex-col gap-2">
                                <Label>Role Name<span className='text-rose-500'>*</span></Label>
                                <Input type="text" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)}  placeholder="Input roles name"/>
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            </div>
                            <div className='mb-4 flex flex-col gap-2'>
                                <Label>Permissions<span className='text-rose-500'>*</span></Label>
                                <TableCard>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px] text-center">
                                                    <Checkbox onChange={(e) => selectAllPermission(e as React.ChangeEvent<HTMLInputElement>)} checked={data.selectedPermissions.length === permissions.length}/>
                                                </TableHead>
                                                <TableHead>Permission Name</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {permissions.map((permission, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="w-[50px]">
                                                        <div className='flex justify-center'>
                                                            <Checkbox checked={data.selectedPermissions.includes(permission.name)} onChange={(e) => selectedPermission(e as React.ChangeEvent<HTMLInputElement>)} key={i} value={permission.name} id={`permission-${i}`}/>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{permission.name}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableCard>
                                <p className="text-red-500 text-xs">{errors.selectedPermissions}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href='/apps/roles'><ArrowLeft/> Go Back</Link>
                                </Button>
                                <Button variant="default" type="submit" disabled={processing}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : <Save /> } Save Data
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
