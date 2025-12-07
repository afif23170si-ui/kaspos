import React from 'react';
import AppLayout from '@/layouts/app-layout'
import { User, type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableCard, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/types/role';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: route('apps.users.index'),
    },
    {
        title: 'Edit User',
        href: '#',
    },

];

interface IndexProps {
    user: User;
    roles: Role[];
    [key: string]: unknown;
}

export default function Index() {

    const { user, roles } = usePage<IndexProps>().props;

    const {data, setData, errors, processing, post, reset} = useForm({
        name: user.name,
        username: user.username,
        email: user.email,
        password: '',
        password_confirmation: '',
        selectedRoles: user.roles.map((role: Role) => role.name),
        _method: 'put'
    });

    const selectRole = (e: React.ChangeEvent<HTMLInputElement>) => {
        let roleIds = data.selectedRoles;

        if(roleIds.some((name) => name === e.target.value))
           roleIds = roleIds.filter((name) => name !== e.target.value);
        else
            roleIds.push(e.target.value);

        setData('selectedRoles', roleIds);
    };

    const selectAllRole = (e: React.ChangeEvent<HTMLInputElement>) => {
        const roleIds = roles.map(role => role.name);

        setData('selectedRoles', e.target.checked ? roleIds : []);
    }

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.users.update', user.id), {
            onSuccess: () => {
                toast('Data has been saved.')
                reset()
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Edit User'/>
            <div className='p-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit User</CardTitle>
                        <CardDescription>This form for edit user</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={storeData}>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Name<span className='text-rose-500'>*</span></Label>
                                <Input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}  placeholder="Input fullname"/>
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Username<span className='text-rose-500'>*</span></Label>
                                <Input type="text" value={data.username} onChange={(e) => setData('username', e.target.value)}  placeholder="Input username"/>
                                <p className="text-red-500 text-xs">{errors.username}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Email<span className='text-rose-500'>*</span></Label>
                                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}  placeholder="Input email"/>
                                <p className="text-red-500 text-xs">{errors.email}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Password<span className='text-rose-500'>*</span></Label>
                                <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}  placeholder="Input password"/>
                                <p className="text-red-500 text-xs">{errors.password}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Password Confirmation<span className='text-rose-500'>*</span></Label>
                                <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}  placeholder="Input password confirmation"/>
                                <p className="text-red-500 text-xs">{errors.password_confirmation}</p>
                            </div>
                            <div className='mb-4 flex flex-col gap-2'>
                                <Label>Roles<span className='text-rose-500'>*</span></Label>
                                <TableCard>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px] text-center">
                                                    <Checkbox onChange={(e) => selectAllRole(e as React.ChangeEvent<HTMLInputElement>)} checked={data.selectedRoles.length === roles.length}/>
                                                </TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Permissions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {roles.map((role, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="w-[50px]">
                                                        <div className='flex justify-center'>
                                                            <Checkbox checked={data.selectedRoles.includes(role.name)} onChange={(e) => selectRole(e as React.ChangeEvent<HTMLInputElement>)} key={i} value={role.name} id={`role-${i}`}/>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{role.name}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-2">
                                                            {role.permissions.map((permission, i) => (
                                                                <Badge variant='default' key={i}>{permission.name}</Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableCard>
                                <p className="text-red-500 text-xs">{errors.selectedRoles}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.users.index')}><ArrowLeft/> Go Back</Link>
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
