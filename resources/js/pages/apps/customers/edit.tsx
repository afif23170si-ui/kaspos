import React from 'react';
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types/customer';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pelanggan',
        href: route('apps.customers.index'),
    },
    {
        title: 'Ubah Pelanggan',
        href: '#',
    },
];

interface CreateProps {
    customer: Customer
    [key: string] : unknown;
}

export default function Edit() {

    const { customer } = usePage<CreateProps>().props;

    const {data, setData, errors, processing, post } = useForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        is_admin: true,
        _method: 'PUT'
    });

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.customers.update', customer.id), {
            onSuccess: () => {
                toast('Data has been saved.')
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Tambah Pelanggan' />
            <div className='p-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Ubah Pelanggan</CardTitle>
                        <CardDescription>Form ini digunakan untuk mengubah data pelanggan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={storeData}>
                            <div className='mb-4 flex flex-col gap-2'>
                                <Label>Nama Pelanggan <span className='text-rose-500'>*</span></Label>
                                <Input type='text' value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder='Masukan nama pelanggan'/>
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            </div>
                            <div className='mb-4 flex flex-col gap-2'>
                                <Label>Email Pelanggan</Label>
                                <Input type='email' value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder='Masukan email pelanggan'/>
                                <p className="text-red-500 text-xs">{errors.email}</p>
                            </div>
                            <div className='mb-4 flex flex-col gap-2'>
                                <Label>Nomor HP Pelanggan</Label>
                                <Input type='number' value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder='Masukan nomor hp pelanggan'/>
                                <p className="text-red-500 text-xs">{errors.phone}</p>
                            </div>
                            <div className='mb-4 flex flex-col gap-2'>
                                <Label>Alamat Pelanggan</Label>
                                <Textarea rows={5} value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder='Masukan alamat pelanggan'/>
                                <p className="text-red-500 text-xs">{errors.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.customers.index')}><ArrowLeft />Kembali</Link>
                                </Button>
                                <Button variant="secondary" type="submit" disabled={processing}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
