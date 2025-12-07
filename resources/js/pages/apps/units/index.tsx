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
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import { toast } from 'sonner';
import { Unit, UnitLink } from '@/types/unit';
import { Textarea } from '@/components/ui/textarea';
import Heading from '@/components/heading';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Satuan',
        href: route('apps.units.index'),
    },
];

interface IndexProps {
    units: {
        data: Unit[],
        links: UnitLink[],
        current_page: number,
        per_page: number
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { units, perPage, currentPage } = usePage<IndexProps>().props;

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        id: '',
        name: '',
        description: '',
        open: false as boolean,
        isUpdate: false as boolean
    });

    const [deleteModal, setDeleteModal] = React.useState(false);

    transform((data) => ({
        ...data,
        _method: data.isUpdate ? 'put' : 'post',
    }))


    const handleModalUpdate = (unit: Unit) => {
        setData(prevData => ({
            ...prevData,
            id: unit.id,
            name: unit.name,
            description: unit.description,
            open: true,
            isUpdate: true
        }))
    }


    const handleModalDelete = (unit: Unit) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: unit.id,
        }))
    }

    const storeData = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(data.isUpdate)
            post(route('apps.units.update', data.id), {
                onSuccess: () => {
                    toast('Data has been saved.')
                    reset()
                },
            });
        else
            post(route('apps.units.store'), {
                onSuccess: () => {
                    toast('Data has been saved.')
                    reset()
                },
            });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Satuan'/>
            <div className='p-6'>
                <Heading title='Satuan' description='Halaman ini digunakan untuk mengelola data satuan'/>
                <Dialog
                    open={data.open}
                    onOpenChange={(open) => setData({
                        ...data, open: open, name: '', id: '', isUpdate: false
                    })}
                >
                    {hasAnyPermission(['units-create']) &&
                        <DialogTrigger className="h-9 px-4 py-2 has-[>svg]:px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructivee border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground font-semibold">
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex">Tambah Satuan</span>
                        </DialogTrigger>
                    }
                    <DialogContent className='p-0' aria-describedby='modal-create'>
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle>{data.isUpdate ? 'Ubah' : 'Tambah'} Satuan</DialogTitle>
                            <DialogDescription>{data.isUpdate ? 'Form ini digunakan untuk mengubah data satuan' : 'Form ini digunakan untuk menambah data satuan'}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={storeData}>
                            <div className='px-4 py-2'>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Nama Satuan<span className='text-rose-500'>*</span></Label>
                                    <Input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}  placeholder="Masukan nama satuan"/>
                                    <p className="text-red-500 text-xs">{errors.name}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Deskripsi Satuan</Label>
                                    <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} placeholder='Masukan deskripsi satuan'/>
                                    <p className="text-red-500 text-xs">{errors.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="destructive" type="button" onClick={() => reset()}>
                                        <X/> Kembali
                                    </Button>
                                    <Button variant="secondary" type="submit" disabled={processing}>
                                        {processing ? <LoaderCircle className="animate-spin" /> : <Save /> } Simpan Data
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
                        url={route('apps.units.index')}
                        placeholder="Cari data satuan berdsarkan nama satuan"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.data.length === 0 ?
                                <TableEmpty colSpan={4} message='data satuan'/>
                                :
                                units.data.map((unit, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{++index + + (units.current_page - 1) * units.per_page}</TableCell>
                                        <TableCell>{unit.name}</TableCell>
                                        <TableCell>{unit.description}</TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['units-update']) || hasAnyPermission(['units-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='units'
                                                        isModal
                                                        actionEdit={() => handleModalUpdate(unit)}
                                                        actionDelete={() => handleModalDelete(unit)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.units.destroy', data.id)}/>
                <PagePagination data={units}/>
            </div>
        </AppLayout>
    )
}
