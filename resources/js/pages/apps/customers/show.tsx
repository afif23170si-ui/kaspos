import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCard, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Customer } from '@/types/customer';
import { CustomerPoint } from '@/types/customer-point';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pelanggan',
        href: route('apps.customers.index'),
    },
    {
        title: 'Detail Pelanggan',
        href: '#',
    },
];

function statusVariant(status: string) {
    switch (status) {
        case 'active':
            return 'default';
        case 'redeemed':
            return 'outline';
        case 'expired':
            return 'destructive';
        default:
            return 'secondary';
    }
}

interface ShowProps {
    customer: Customer;
    [key: string]: unknown;
}

export default function Show() {
    const { customer } = usePage<ShowProps>().props;

    const [open, setOpen] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<CustomerPoint | null>(null);

    const { data, setData, processing, reset, patch } = useForm({
        status: '',
    });

    const openDialog = (customerPoint: CustomerPoint) => {
        setSelectedPoint(customerPoint);
        setData('status', customerPoint?.status === 'active' ? 'redeemed' : (customerPoint?.status ?? 'active'));
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setSelectedPoint(null);
        reset();
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedPoint) return;
        patch(route('apps.customers.update', selectedPoint.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const totalRows = useMemo(() => customer?.customer_points?.length ?? 0, [customer]);

    return (
        <>
            <Head title="Detail Pelanggan" />
            <div className="p-6">
                <Heading title='Detail Pelanggan' description='Halaman ini digunakan untuk menampilkan history point pelanggan per transaksi'/>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border p-4">
                        <div className="text-muted-foreground text-sm">Nama</div>
                        <div className="font-medium">{customer?.name ?? '-'}</div>
                    </div>
                    <div className="rounded-xl border p-4">
                        <div className="text-muted-foreground text-sm">Email</div>
                        <div className="font-medium">{customer?.email ?? '-'}</div>
                    </div>
                    <div className="rounded-xl border p-4">
                        <div className="text-muted-foreground text-sm">Telepon</div>
                        <div className="font-medium">{customer?.phone ?? '-'}</div>
                    </div>
                </div>

                <TableCard className="mt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='text-center w-[10px]'>#</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Tanggal Transaksi</TableHead>
                                <TableHead>Jenis Transaksi</TableHead>
                                <TableHead>Total Transaksi</TableHead>
                                <TableHead className="text-right">Poin Didapat</TableHead>
                                <TableHead className='text-center w-[10px]'>Status</TableHead>
                                <TableHead className="w-[120px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customer?.customer_points?.map((cp, i) => (
                                <TableRow key={cp.id}>
                                    <TableCell className='text-center'>{ i + 1 }</TableCell>
                                    <TableCell className="font-medium">{cp?.transaction?.invoice ?? '-'}</TableCell>
                                    <TableCell>{cp?.transaction?.transaction_date}</TableCell>
                                    <TableCell className="capitalize">{cp?.transaction?.transaction_type ?? '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <sup>Rp</sup> {cp?.transaction?.grand_total ?? '-'}
                                    </TableCell>
                                    <TableCell className="text-right">{cp.point}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(cp.status)} className="capitalize">
                                            {cp.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openDialog(cp)}
                                            disabled={cp.status === 'expired' || cp.status == 'redeem'}
                                        >
                                            Update Status
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {totalRows === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground text-center">
                                        Belum ada data poin.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableCard>

                {/* Dialog Update Status Poin */}
                <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Status Poin</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Invoice</Label>
                                <div className="bg-muted/30 rounded-md border px-3 py-2">{selectedPoint?.transaction?.invoice ?? '-'}</div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="redeem">Redeem</SelectItem>
                                       <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={onClose}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Show.layout = (page: React.ReactNode) => <AppLayout children={page} breadcrumbs={breadcrumbs} />;
