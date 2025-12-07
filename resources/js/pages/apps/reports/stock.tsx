import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DatePicker from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCard, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import clsx from 'clsx';
import { LoaderCircle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan Sisa Stok', href: route('apps.reports.stocks') }];

type BatchRow = {
    stock_id: number;
    batch_code: string | null;
    expired_at: string | null;
    is_expired: boolean;
    opening_qty: number;
    in_qty: number;
    out_qty: number;
    closing_qty: number;
    status: string;
};

type ItemRow = {
    item_type: 'product_variant' | 'material' | 'unknown';
    item_id: number;
    item_label: string;
    unit_id: number | null;

    total_current: number;
    total_expired: number;
    sum_opening: number;
    sum_in: number;
    sum_out: number;
    sum_closing: number;

    minimum_qty: number;
    is_below_min: boolean;

    batches: BatchRow[];
};

type Totals = {
    grand_total_current: number;
    grand_total_expired: number;
    total_items: number;
};

type ApiResponse = {
    code: number;
    message: string;
    data: {
        rows: ItemRow[];
        totals: Totals;
        as_of: string;
    };
};

const fmtNum = (n: number) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n ?? 0);

export default function StockPerItemPage() {
    const [date, setDate] = useState<string>('');
    const [stockableType, setStockableType] = useState<string>('all');
    const [q, setQ] = useState<string>('');
    const [hideZero, setHideZero] = useState<boolean>(false);

    const [rows, setRows] = useState<ItemRow[]>([]);
    const [totals, setTotals] = useState<Totals | null>(null);
    const [loading, setLoading] = useState(false);

    const groups = useMemo(() => {
        const map = new Map<string, ItemRow[]>();
        for (const r of rows) {
            const k = r.item_type;
            if (!map.has(k)) map.set(k, []);
            map.get(k)!.push(r);
        }
        const order = ['product_variant', 'material', 'unknown'];
        return order
            .filter((k) => map.has(k))
            .map((k) => ({
                key: k,
                title: k === 'product_variant' ? 'PRODUCT VARIANT' : k === 'material' ? 'MATERIAL' : 'UNKNOWN',
                items: map
                    .get(k)!
                    .slice()
                    .sort((a, b) => (a.item_label || '').localeCompare(b.item_label || '')),
            }));
    }, [rows]);

    const fetchData = async () => {
        try {
            if (!date) return toast.warning('Silakan pilih tanggal snapshot terlebih dahulu');
            setLoading(true);
            const { data } = await axios.get<ApiResponse>(route('apps.reports.stock-reports'), {
                params: {
                    date,
                    stockable_type: stockableType !== 'all' ? stockableType : undefined,
                    q: q || undefined,
                    hide_zero: hideZero ? 1 : undefined,
                },
            });
            if (data?.code === 200 && data?.data) {
                setRows(data.data.rows || []);
                setTotals(data.data.totals);
                if (!data.data.rows?.length) toast.info('Tidak ada data untuk tanggal tersebut');
            } else {
                setRows([]);
                setTotals(null);
                toast.info('Tidak ada data untuk tanggal tersebut');
            }
        } catch (e) {
            console.error(e);
            toast.error('Gagal mengambil laporan stok');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Sisa Stok" />
            <div className="p-6">
                <Heading
                    title="Laporan Sisa Stok"
                    description="Menampilkan total stok saat ini per item (akumulasi batch aktif) dan rincian per batch pada tanggal yang dipilih."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <DatePicker date={date} setDate={setDate} label="Tanggal Snapshot" />
                    <Select value={stockableType} onValueChange={setStockableType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tipe Item" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            <SelectItem value="product_variant">Product Variant</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari batch/barcode/nama material" />
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            className="accent-primary h-4 w-4"
                            checked={hideZero}
                            onChange={(e) => setHideZero(e.target.checked)}
                        />
                        Sembunyikan item dengan stok 0
                    </label>
                </div>

                <div className="mt-4 flex">
                    <Button onClick={fetchData} disabled={loading}>
                        <Search className={clsx('mr-2 h-4 w-4', loading && 'animate-pulse')} />
                        {loading ? 'Memuat...' : 'Tampilkan'}
                    </Button>
                </div>
                {loading ? (
                    <Dialog open={loading}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogDescription>
                                    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-4 rounded-lg p-6">
                                        <LoaderCircle className="text-primary h-10 w-10 animate-spin" />
                                        <div className="text-lg font-semibold">Sedang memproses data…</div>
                                        <p className="text-muted-foreground text-center text-sm">
                                            Mohon tunggu, pengambilan laporan sedang berlangsung.
                                        </p>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <>
                        {totals && (
                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Total Current (aktif)</p>
                                    <p className="text-xl font-semibold">{fmtNum(totals.grand_total_current)}</p>
                                </div>
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Total Expired</p>
                                    <p className="text-xl font-semibold text-amber-600">{fmtNum(totals.grand_total_expired)}</p>
                                </div>
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Jumlah Item</p>
                                    <p className="text-xl font-semibold">{fmtNum(totals.total_items)}</p>
                                </div>
                            </div>
                        )}

                        {/* Items */}
                        <div className="mt-5 space-y-6">
                            {groups.map((g) => (
                                <div key={g.key} className="space-y-4">
                                    <div className="text-muted-foreground text-xs font-semibold">{g.title}</div>

                                    {g.items.length === 0 ? (
                                        <div className="text-muted-foreground rounded border p-4 text-sm">Tidak ada data</div>
                                    ) : (
                                        g.items.map((item) => {
                                            const nearMin =
                                                !item.is_below_min && item.minimum_qty > 0 && item.total_current <= item.minimum_qty * 1.2;

                                            return (
                                                <TableCard key={`${g.key}-${item.item_id}`}>
                                                    {/* Headline: item — total stok saat ini */}
                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                                                        <div className="text-base font-semibold">
                                                            {item.item_label}{' '}
                                                            <span className="text-muted-foreground font-normal">— total stok saat ini</span>{' '}
                                                            <span
                                                                className={clsx(
                                                                    'font-semibold',
                                                                    item.is_below_min
                                                                        ? 'text-red-600'
                                                                        : nearMin
                                                                          ? 'text-amber-600'
                                                                          : 'text-foreground',
                                                                )}
                                                            >
                                                                {fmtNum(item.total_current)}
                                                            </span>
                                                            {item.minimum_qty > 0 && (
                                                                <span className="text-muted-foreground ml-2 text-xs">
                                                                    (Min: {fmtNum(item.minimum_qty)})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {item.is_below_min ? (
                                                                <Badge variant="destructive">Di bawah minimum</Badge>
                                                            ) : nearMin ? (
                                                                <Badge variant="secondary">Mendekati minimum</Badge>
                                                            ) : (
                                                                <Badge variant="outline">Aman</Badge>
                                                            )}
                                                            {item.total_expired > 0 && (
                                                                <Badge variant="destructive" className="uppercase">
                                                                    Ada batch expired
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-[10px]">No</TableHead>
                                                                    <TableHead>Batch</TableHead>
                                                                    <TableHead>Kadaluarsa</TableHead>
                                                                    <TableHead className="text-right">Opening</TableHead>
                                                                    <TableHead className="text-right">IN</TableHead>
                                                                    <TableHead className="text-right">OUT</TableHead>
                                                                    <TableHead className="text-right">Closing</TableHead>
                                                                    <TableHead className="text-center">Status</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {item.batches.length === 0 ? (
                                                                    <TableRow>
                                                                        <TableCell colSpan={8} className="text-muted-foreground text-center text-sm">
                                                                            Tidak ada batch
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ) : (
                                                                    item.batches.map((b, i) => (
                                                                        <TableRow key={`${item.item_id}-${b.stock_id}`}>
                                                                            <TableCell className='text-center'>{i + 1}</TableCell>
                                                                            <TableCell className="font-medium">{b.batch_code || '-'}</TableCell>
                                                                            <TableCell className="text-muted-foreground uppercase">
                                                                                {b.expired_at || '-'}
                                                                            </TableCell>
                                                                            <TableCell className="text-right">{fmtNum(b.opening_qty)}</TableCell>
                                                                            <TableCell className="text-right">{fmtNum(b.in_qty)}</TableCell>
                                                                            <TableCell className="text-right text-red-600">
                                                                                {fmtNum(b.out_qty)}
                                                                            </TableCell>
                                                                            <TableCell className="text-right font-medium">
                                                                                {fmtNum(b.closing_qty)}
                                                                            </TableCell>
                                                                            <TableCell className="text-center capitalize">
                                                                                <Badge variant={b.status == 'out stock' ? 'secondary' : b.status == 'active' ? 'default' : 'destructive'}>{b.status}</Badge>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </TableCard>
                                            );
                                        })
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
