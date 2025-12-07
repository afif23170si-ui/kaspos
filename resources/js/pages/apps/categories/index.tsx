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
import { Category, CategoryLink } from '@/types/category';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kategori',
        href: route('apps.categories.index'),
    },
];

interface IndexProps {
    categories: {
        data: Category[],
        links: CategoryLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { categories, perPage, currentPage } = usePage<IndexProps>().props;

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        id: '',
        name: '',
        image: null as File | null,
        open: false as boolean,
        isUpdate: false as boolean
    });

    const [deleteModal, setDeleteModal] = React.useState(false);


    transform((data) => ({
        ...data,
        _method: data.isUpdate ? 'put' : 'post',
    }))


    const handleModalUpdate = (category: Category) => {
        setData(prevData => ({
            ...prevData,
            id: category.id,
            name: category.name,
            open: true,
            isUpdate: true
        }))
    }


    const handleModalDelete = (category: Category) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: category.id,
        }))
    }

    const storeData = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(data.isUpdate)
            post(route('apps.categories.update', data.id), {
                onSuccess: () => {
                    toast('Data has been saved.')
                    setData({
                        id: '',
                        name: '',
                        image: null,
                        open: false,
                        isUpdate: false
                    })
                },
            });
        else
            post(route('apps.categories.store'), {
                onSuccess: () => {
                    toast('Data has been saved.');
                    setData({
                        id: '',
                        name: '',
                        image: null,
                        open: false,
                        isUpdate: false
                    })
                },
            });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Kategori'/>
            <div className='p-6'>
                <Dialog
                    open={data.open}
                    onOpenChange={(open) => setData({
                        ...data, open: open, name: '', id: '', isUpdate: false
                    })}
                >
                    {hasAnyPermission(['categories-create']) &&
                        <DialogTrigger className="h-9 px-4 py-2 has-[>svg]:px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructivee border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground font-semibold">
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex">Tambah Kategori</span>
                        </DialogTrigger>
                    }
                    <DialogContent className='p-0' aria-describedby='modal-create'>
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle>{data.isUpdate ? 'Ubah' : 'Tambah'} Kategori</DialogTitle>
                            <DialogDescription>{data.isUpdate ? 'Form ini digunakan untuk mengubah data kategori' : 'Form ini digunakan untuk menambahkan data kategori'}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={storeData}>
                            <div className='px-4 py-2'>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Nama Kategori<span className='text-rose-500'>*</span></Label>
                                    <Input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}  placeholder="Input categories name"/>
                                    <p className="text-red-500 text-xs">{errors.name}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Gambar Kategori</Label>
                                    <Input type="file" onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('image', e.target.files[0]);
                                        }
                                    }}/>
                                    <p className="text-red-500 text-xs">{errors.image}</p>
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
                        url={route('apps.categories.index')}
                        placeholder="Cari data kategori berdasarkan nama kategori"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead className='w-[10px]'>Gambar Kategori</TableHead>
                                <TableHead>Nama Kategori</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.length === 0 ?
                                <TableEmpty colSpan={4} message='data categories'/>
                                :
                                categories.data.map((category, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>
                                            <img src={category.image} className='w-10 h-10'/>
                                        </TableCell>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['categories-update']) || hasAnyPermission(['categories-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='categories'
                                                        isModal
                                                        actionEdit={() => handleModalUpdate(category)}
                                                        actionDelete={() => handleModalDelete(category)}
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
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.categories.destroy', data.id)}/>
                <PagePagination data={categories}/>
            </div>
        </AppLayout>
    )
}
