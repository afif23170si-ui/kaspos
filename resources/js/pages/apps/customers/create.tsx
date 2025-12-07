import React from 'react';
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pelanggan',
        href: route('apps.customers.index'),
    },
    {
        title: 'Tambah Pelanggan',
        href: '#',
    },
];

export default function Create() {

    const {data, setData, errors, processing, post } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        is_admin: true,
    });

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.customers.store'), {
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
                        <CardTitle>Tambah Pelanggan</CardTitle>
                        <CardDescription>Form ini digunakan untuk menambahkan data pelanggan</CardDescription>
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
