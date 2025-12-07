/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supplier',
        href: route('apps.suppliers.index'),
    },
    {
        title: 'Tambah Supplier',
        href: '#',
    },
];

interface CreateProps {
    supplierCode: string;
    [key: string]: unknown;
}

export default function Create() {

    const { supplierCode } = usePage<CreateProps>().props;

    const {data, setData, errors, processing, post, reset} = useForm({
        code: supplierCode,
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.suppliers.store'), {
            onSuccess: () => {
                toast('Data has been saved.')
                reset()
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Tambah Supplier'/>
            <div className='p-6'>
                <form onSubmit={storeData}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Supplier</CardTitle>
                            <CardDescription>Form ini digunakan untuk menambahkan data supplier</CardDescription>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <div className='p-6'>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Kode Supplier<span className='text-rose-500'>*</span></Label>
                                    <Input className='cursor-not-allowed bg-gray-100 dark:bg-zinc-900 focus:ring-0' readOnly type="text" value={data.code} onChange={(e) => setData('code', e.target.value)}/>
                                    <p className="text-red-500 text-xs">{errors.code}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Nama Supplier<span className='text-rose-500'>*</span></Label>
                                    <Input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}  placeholder="Masukan nama supplier"/>
                                    <p className="text-red-500 text-xs">{errors.name}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder='Masukan email supplier'/>
                                    <p className="text-red-500 text-xs">{errors.email}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Telp</Label>
                                    <Input type="number" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder='Masukan telp supplier'/>
                                    <p className="text-red-500 text-xs">{errors.phone}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Alamat</Label>
                                    <Textarea rows={5} value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder='Masukan alamat supplier'/>
                                    <p className="text-red-500 text-xs">{errors.address}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="destructive" asChild>
                                        <Link href={route('apps.suppliers.index')}><ArrowLeft /> Kembali</Link>
                                    </Button>
                                    <Button variant="secondary" type="submit" disabled={processing}>
                                        {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    )
}
