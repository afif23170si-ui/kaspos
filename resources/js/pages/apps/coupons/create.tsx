/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Diskon',
        href: route('apps.coupons.index'),
    },
    {
        title: 'Tambah Diskon',
        href: '#',
    },
];


export default function Create() {
    const {data, setData, errors, processing, post, reset} = useForm({
        code : '',
        value: '',
        is_active: '',
        type: '',
    });

    const storeData = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.coupons.store'), {
            onSuccess: () => {
                toast('Data berhasil disimpan.')
                reset()
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Tambah Diskon'/>
            <div className='p-6'>
                <form onSubmit={storeData}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Diskon</CardTitle>
                            <CardDescription>Form ini digunakan untuk menambahkan data diskon</CardDescription>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <div className='p-6'>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Kode Diskon<span className='text-rose-500'>*</span></Label>
                                    <Input placeholder="Masukan kode diskon" type="text" value={data.code} onChange={(e) => setData('code', e.target.value)}/>
                                    <p className="text-red-500 text-xs">{errors.code}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Jumlah Diskon<span className='text-rose-500'>*</span></Label>
                                    <Input placeholder="Masukan Jumlah Diskon" type="text" value={data.value} onChange={(e) => setData('value', e.target.value)}/>
                                    <p className="text-red-500 text-xs">{errors.value}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Jenis Diskon<span className='text-rose-500'>*</span></Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Jenis Diskon"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='rupiah'>Rp</SelectItem>
                                            <SelectItem value='percentage'>%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-red-500 text-xs">{errors.type}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Status Diskon<span className='text-rose-500'>*</span></Label>
                                    <Select
                                        value={data.is_active}
                                        onValueChange={(value) => setData('is_active', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Status Diskon"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='active'>Aktif</SelectItem>
                                            <SelectItem value='non-active'>Tidak</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-red-500 text-xs">{errors.type}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="destructive" asChild>
                                        <Link href={route('apps.coupons.index')}><ArrowLeft /> Kembali</Link>
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
