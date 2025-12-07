/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlusCircle, LoaderCircle, Save, X, QrCode, Eraser } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import { toast } from 'sonner';
import { Table as TableType, TableLink } from '@/types/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Meja', href: route('apps.tables.index') },
];

interface IndexProps {
    tables: { data: TableType[], links: TableLink[] };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {
    const { tables, perPage, currentPage } = usePage<IndexProps>().props;

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        id: '',
        number: '',
        capacity: 0,
        status: '',
        open: false as boolean,
        isUpdate: false as boolean
    });

    const [deleteModal, setDeleteModal] = React.useState(false);
    const [qrModal, setQrModal] = React.useState<{ open: boolean; table: TableType | null }>({
        open: false, table: null
    });
    const [openTable, setOpenTable] = React.useState<{ open: boolean; table: TableType | null }>({
        open: false, table: null
    });

    transform((data) => ({
        ...data,
        _method: data.isUpdate ? 'put' : 'post',
    }))

    const handleModalUpdate = (table: TableType) => {
        setData(prev => ({
            ...prev,
            id: table.id,
            number: table.number,
            capacity: table.capacity,
            status: table.status,
            open: true,
            isUpdate: true
        }))
    }

    const handleModalDelete = (table: TableType) => {
        setDeleteModal(true);
        setData(prev => ({ ...prev, id: table.id, }))
    }

    const storeData = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (data.isUpdate)
            post(route('apps.tables.update', data.id), {
                onSuccess: () => {
                    toast('Data has been saved.'),
                        setData({ id: '', number: '', capacity: 0, status: '', open: false, isUpdate: false })
                },
            });
        else
            post(route('apps.tables.store'), {
                onSuccess: () => {
                    toast('Data has been saved.'),
                        setData({ id: '', number: '', capacity: 0, status: '', open: false, isUpdate: false })
                },
            });
    }

    const statusTable = (status: string) => {
        switch (status) {
            case 'available': return <Badge variant='default' className='capitalize'>Tersedia</Badge>
            case 'occupied': return <Badge variant='destructive' className='capitalize'>Tidak Tersedia</Badge>
            case 'reserved': return <Badge variant='secondary' className='capitalize'>Dibooking</Badge>
        }
    }

    const openTableData = () => {
        post(route('apps.tables.open-tables', openTable.table?.id), {
            onSuccess : () => {
                setOpenTable({
                    open: false, table: null
                }),
                toast.success('Meja berhasil di buka kembali');
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Meja' />
            <div className='p-6'>
                <Heading title='Meja' description='Halaman ini digunakan untuk mengelola data meja' />

                {/* Modal Create/Update */}
                <Dialog
                    open={data.open}
                    onOpenChange={(open) => setData({ ...data, open, number: '', capacity: 0, status: '', id: '', isUpdate: false })}
                >
                    {hasAnyPermission(['tables-create']) &&
                        <DialogTrigger className="h-9 px-4 py-2 has-[>svg]:px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructivee border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground font-semibold">
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex">Tambah Meja</span>
                        </DialogTrigger>
                    }
                    <DialogContent className='p-0' aria-describedby='modal-create'>
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle>{data.isUpdate ? 'Ubah' : 'Tambah'} Meja</DialogTitle>
                            <DialogDescription>{data.isUpdate ? 'Form ini digunakan untuk mengubah data meja' : 'Form ini digunakan untuk menambahkan data meja'}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={storeData}>
                            <div className='px-4 py-2'>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Nomor Meja<span className='text-rose-500'>*</span></Label>
                                    <Input type="number" value={data.number} onChange={(e) => setData('number', e.target.value)} placeholder="Input table number" />
                                    <p className="text-red-500 text-xs">{errors.number}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Kapasitas<span className='text-rose-500'>*</span></Label>
                                    <Input type="number" value={data.capacity} onChange={(e) => setData('capacity', parseInt(e.target.value))} placeholder="Input table capacity" />
                                    <p className="text-red-500 text-xs">{errors.capacity}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Status<span className='text-rose-500'>*</span></Label>
                                    <Select value={data.status} onValueChange={(e) => setData('status', e)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih status meja" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='available'>Tersedia</SelectItem>
                                            <SelectItem value='occupied'>Tidak Tersedia</SelectItem>
                                            <SelectItem value='reserved'>Dibooking</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-red-500 text-xs">{errors.status}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="destructive" type="button" onClick={() => reset()}>
                                        <X /> Cancel
                                    </Button>
                                    <Button variant="secondary" type="submit" disabled={processing}>
                                        {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
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
                        url={route('apps.tables.index')}
                        placeholder="Cari data meja berdasarkan nomor meja"
                    />
                </div>

                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>Nomor Meja</TableHead>
                                <TableHead>Kapasitas</TableHead>
                                <TableHead className='w-[10px] text-center'>Status Meja</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tables.data.length === 0 ? (
                                <TableEmpty colSpan={5} message='data meja' />
                            ) : (
                                tables.data.map((table, index) => (
                                    <TableRow key={table.id}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{table.number}</TableCell>
                                        <TableCell>{table.capacity}</TableCell>
                                        <TableCell><div className='text-center'>{statusTable(table.status)}</div></TableCell>
                                        <TableCell>
                                            <div className='flex items-center justify-center gap-2'>
                                                {(hasAnyPermission(['tables-update']) || hasAnyPermission(['tables-delete'])) && (
                                                    <ActionButton
                                                        permissionPrefix='tables'
                                                        isModal
                                                        actionEdit={() => handleModalUpdate(table)}
                                                        actionDelete={() => handleModalDelete(table)}
                                                    >
                                                        <DropdownMenuItem onClick={() => setQrModal({ open: true, table })}>
                                                            <QrCode /> Generate QR Code
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setOpenTable({ open: true, table })}>
                                                            <Eraser /> Kosongkan Meja
                                                        </DropdownMenuItem>
                                                    </ActionButton>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableCard>
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.tables.destroy', data.id)} />
                <PagePagination data={tables} />
                <Dialog open={qrModal.open} onOpenChange={(open) => setQrModal({ open, table: open ? qrModal.table : null })}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>QR Meja {qrModal.table?.number}</DialogTitle>
                            <DialogDescription>Scan QR ini untuk memulai pesanan di Meja {qrModal.table?.number}.</DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center gap-3 py-2">
                            {qrModal.table && (
                                <>
                                    <img
                                        src={route('apps.tables.qrcode', qrModal.table.id)}
                                        alt={`QR Meja ${qrModal.table.number}`}
                                        className="w-full max-w-xs border rounded"
                                    />
                                    <div className="flex gap-2">
                                        <a
                                            href={route('apps.tables.qrcode', qrModal.table.id)}
                                            download={`table-${qrModal.table.number}.png`}
                                            className="px-3 py-2 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            Download PNG
                                        </a>
                                        <a
                                            href={route('apps.tables.qrcode', qrModal.table.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            Buka di Tab Baru
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={openTable.open} onOpenChange={(open) => setOpenTable({ open, table: open ? openTable.table : null })}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Konfirmasi</DialogTitle>
                            <DialogHeader>
                                   Aksi ini akan mengosongkan / membuka kembali meja dengan nomor{' '}
                                    {openTable.table?.number ? `${openTable.table.number}` : ''}.
                            </DialogHeader>
                        </DialogHeader>
                        <Button onClick={openTableData}>Open Meja</Button>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    )
}
