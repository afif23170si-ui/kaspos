/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Material } from '@/types/material';
import { ProductVariant } from '@/types/product-variant';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import clsx from 'clsx';
import { Check, ChevronsUpDown, LoaderCircle, Package2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type Item = {
    type: 'product_variant' | 'material';
    id: number;
    name: string;
    image?: string | null;
};

type DayRow = {
    date: string;
    in: number;
    out: number;
    balance: number;
    is_expired: boolean;
    status: string;
};

type BatchCard = {
    stock_id: number;
    batch_code: string;
    expired_at: string | null;
    is_expired_now: boolean;
    opening_qty: number;
    daily: DayRow[];
    totals: { in: number; out: number; closing: number };
    status?: 'all_sales' | 'expired' | 'active';
};

type ApiResponse = {
    code: number;
    message: string;
    data: {
        item: {
            type: 'product_variant' | 'material';
            id: number;
            label: string;
            unit_name: string | null;
            category_id: number | null;
            image: string | null;
        } | null;
        period: { first_date: string; last_date: string; days: string[] };
        batches: BatchCard[];
        grand_totals: { opening: number; in: number; out: number; closing: number };
    } | null;
};

type cardStockProps = {
    items: ProductVariant | Material;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan Kartu Stok', href: route('apps.reports.card-stocks') }];

const monthNames = [
    { v: '01', t: 'Januari' },
    { v: '02', t: 'Februari' },
    { v: '03', t: 'Maret' },
    { v: '04', t: 'April' },
    { v: '05', t: 'Mei' },
    { v: '06', t: 'Juni' },
    { v: '07', t: 'Juli' },
    { v: '08', t: 'Agustus' },
    { v: '09', t: 'September' },
    { v: '10', t: 'Oktober' },
    { v: '11', t: 'November' },
    { v: '12', t: 'Desember' },
];
const thisYear = new Date().getFullYear();
const years = Array.from({ length: 7 }, (_, i) => `${thisYear - 3 + i}`);

const fmtNum = (n: number) => (n ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 3 });

const normStatus = (s?: string) => (s ? s.toLowerCase().replace(/\s+/g, '_') : '');
const statusLabel = (s?: string) => {
    const k = normStatus(s);
    if (k === 'all_sales' || k === 'out_stock' || k === 'out_of_stock') return 'Out Stock';
    if (k === 'expired') return 'Expired';
    return 'Active';
};
const statusVariant = (s?: string) => {
    const k = normStatus(s);
    if (k === 'all_sales' || k === 'out_stock' || k === 'out_of_stock') return 'secondary';
    if (k === 'expired') return 'destructive';
    return 'default';
};

export default function StockPage() {
    const { items } = usePage<cardStockProps>().props;
    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

    const [openPicker, setOpenPicker] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState<{ first_date: string; last_date: string; days: string[] } | null>(null);
    const [batches, setBatches] = useState<BatchCard[]>([]);
    const [grand, setGrand] = useState<{ opening: number; in: number; out: number; closing: number } | null>(null);
    const [itemInfo, setItemInfo] = useState<{
        type: 'product_variant' | 'material';
        id: number;
        label: string;
        unit_name: string | null;
        category_id: number | null;
        image: string | null;
    } | null>(null);

    const indexLabel = useMemo(() => {
        if (!selectedItem) return 'Pilih item…';
        return `${selectedItem.name} ${selectedItem.type === 'material' ? '(Material)' : ''}`;
    }, [selectedItem]);

    const fetchData = async () => {
        try {
            if (!selectedItem) return toast.warning('Silakan pilih item terlebih dahulu');
            setLoading(true);
            const { data } = await axios.get<ApiResponse>(route('apps.reports.card-stock-reports'), {
                params: {
                    selectedMonth,
                    selectedYear,
                    stockable_type: selectedItem.type,
                    stockable_id: selectedItem.id,
                },
            });
            if (data?.code === 200 && data?.data) {
                setItemInfo(data.data.item);
                setPeriod(data.data.period);
                setBatches(data.data.batches || []);
                setGrand(data.data.grand_totals || null);
                if (!data.data.batches?.length) toast.info('Tidak ada batch untuk item tersebut.');
            } else {
                setItemInfo(null);
                setPeriod(null);
                setBatches([]);
                setGrand(null);
                toast.info(data?.message || 'Data kosong.');
            }
        } catch (e) {
            console.error(e);
            toast.error('Gagal memuat kartu stok.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Kartu Stok" />
            <div className="p-6">
                <Heading title="Laporan Kartu Stok" description="Pilih item (produk variant / material), lalu lihat pergerakan stok per batch." />
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthNames.map((m) => (
                                <SelectItem key={m.v} value={m.v}>
                                    {m.t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={y}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Popover open={openPicker} onOpenChange={setOpenPicker}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={openPicker} className="justify-between">
                                <div className="flex items-center gap-2 truncate">
                                    <Package2 className="h-4 w-4" />
                                    <span className="max-w-[220px] truncate">{indexLabel}</span>
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[420px] p-0">
                            <Command>
                                <CommandInput placeholder="Cari nama item..." />
                                <CommandEmpty>Tidak ada item.</CommandEmpty>
                                <CommandList>
                                    <CommandGroup heading="Item">
                                        {(Array.isArray(items) ? items : []).map((it: any) => {
                                            const selected = selectedItem?.id === it.id && selectedItem?.type === it.type;
                                            return (
                                                <CommandItem
                                                    key={`${it.type}-${it.id}`}
                                                    value={`${it.name} ${it.type}`}
                                                    onSelect={() => {
                                                        setSelectedItem(it);
                                                        setOpenPicker(false);
                                                    }}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="truncate">{it.name}</span>
                                                        <Badge variant={it.type === 'material' ? 'secondary' : 'destructive'}>
                                                            {it.type === 'material' ? 'Material' : 'Produk'}
                                                        </Badge>
                                                    </div>
                                                    {selected ? <Check className="h-4 w-4" /> : null}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <div className="lg:col-span-1">
                        <Button variant="default" onClick={fetchData} disabled={loading || !selectedItem}>
                            {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Tampilkan
                        </Button>
                    </div>
                </div>

                {loading && (
                    <Dialog open={loading}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogDescription>
                                    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-4 rounded-lg p-6">
                                        <LoaderCircle className="text-primary h-10 w-10 animate-spin" />
                                        <div className="text-lg font-semibold">Sedang memproses data...</div>
                                        <p className="text-muted-foreground text-center text-sm">
                                            Mohon tunggu, penarikan data kartu stok sedang berlangsung.
                                        </p>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                )}

                {!loading && grand && (
                    <>
                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="rounded border p-4 shadow-sm md:col-span-2">
                                <p className="text-muted-foreground text-sm">Item</p>
                                <div className="mt-1 flex items-center gap-3">
                                    <div>
                                        <p className="text-lg font-semibold">{itemInfo?.label}</p>
                                        <p className="text-muted-foreground text-xs">
                                            Tipe: {itemInfo?.type === 'product_variant' ? 'Produk' : 'Material'}
                                            {itemInfo?.unit_name ? ` • Satuan: ${itemInfo.unit_name}` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded border p-4 shadow-sm">
                                <p className="text-muted-foreground text-sm">Opening</p>
                                <p className="text-xl font-semibold">{fmtNum(grand.opening)}</p>
                            </div>
                            <div className="rounded border p-4 shadow-sm">
                                <p className="text-muted-foreground text-sm">Closing</p>
                                <p className={clsx('text-xl font-semibold', grand.closing < 0 ? 'text-red-600' : 'text-emerald-600')}>
                                    {fmtNum(grand.closing)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            {!batches || batches.length === 0 ? (
                                <TableCard>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Batch</TableHead>
                                                <TableHead className="text-right">Opening</TableHead>
                                                <TableHead className="text-right">In</TableHead>
                                                <TableHead className="text-right">Out</TableHead>
                                                <TableHead className="text-right">Closing</TableHead>
                                                <TableHead>Kadaluarsa</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableEmpty colSpan={7} message="kartu stok" />
                                        </TableBody>
                                    </Table>
                                </TableCard>
                            ) : (
                                batches.map((b) => <BatchPanel key={b.stock_id} batch={b} />)
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function BatchPanel({ batch }: { batch: BatchCard }) {
    const [open, setOpen] = useState(false);
    const expiredBadge = batch.is_expired_now || (batch.expired_at ? new Date(batch.expired_at) < new Date() : false);

    return (
        <div className="rounded-lg border shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
                            {open ? <ChevronsUpDown className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4 rotate-90" />}
                        </Button>

                        <div className="flex min-w-0 items-center gap-2">
                            <span className="font-semibold">Batch:</span>
                            <span className="font-bold">{batch.batch_code}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Status batch (Active / Out Stock / Expired) */}
                        <Badge variant={statusVariant(batch.status)} className="capitalize">
                            {statusLabel(batch.status)}
                        </Badge>

                        {/* Expiry tag */}
                        {batch.expired_at ? (
                            <Badge variant={expiredBadge ? 'destructive' : 'secondary'} className="ml-1">
                                Exp {batch.expired_at}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="ml-1">
                                No Exp
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="grid w-full grid-cols-2 justify-center gap-4 text-center lg:grid-cols-4">
                    <div className="min-w-[100px]">
                        <p className="text-muted-foreground text-xs">Opening</p>
                        <p className="font-semibold">{fmtNum(batch.opening_qty)}</p>
                    </div>
                    <div className="min-w-[100px]">
                        <p className="text-muted-foreground text-xs">In</p>
                        <p className="font-semibold">{fmtNum(batch.totals.in)}</p>
                    </div>
                    <div className="min-w-[100px]">
                        <p className="text-muted-foreground text-xs">Out</p>
                        <p className="font-semibold">{fmtNum(batch.totals.out)}</p>
                    </div>
                    <div className="min-w-[100px]">
                        <p className="text-muted-foreground text-xs">Closing</p>
                        <p className={clsx('font-semibold', batch.totals.closing < 0 ? 'text-red-600' : 'text-emerald-700')}>
                            {fmtNum(batch.totals.closing)}
                        </p>
                    </div>
                </div>
            </div>

            {open && (
                <div className="px-4 pb-4">
                    <TableCard>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px] text-center">Tgl</TableHead>
                                    <TableHead className="text-right">In</TableHead>
                                    <TableHead className="text-right">Out</TableHead>
                                    <TableHead className="text-right">Saldo</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batch.daily.length === 0 ? (
                                    <TableEmpty colSpan={5} message="detail harian" />
                                ) : (
                                    batch.daily.map((d) => {
                                        const dayNum = String(new Date(d.date).getDate()).padStart(2, '0');
                                        return (
                                            <TableRow key={`${batch.stock_id}-${d.date}`}>
                                                <TableCell className="text-center">{dayNum}</TableCell>
                                                <TableCell className="text-right">{fmtNum(d.in)}</TableCell>
                                                <TableCell className="text-right">{fmtNum(d.out)}</TableCell>
                                                <TableCell className={clsx('text-right font-medium', d.balance < 0 ? 'text-red-600' : '')}>
                                                    {fmtNum(d.balance)}
                                                </TableCell>
                                                <TableCell className="text-center capitalize">
                                                    <Badge variant={statusVariant(d.status)}>{statusLabel(d.status)}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableCard>
                </div>
            )}
        </div>
    );
}
