import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import clsx from 'clsx';
import { LoaderCircle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan Pembelian', href: route('apps.reports.purchases') }];

type PurchaseRow = {
    tanggal: string;
    no_transaksi: string;
    jenis: 'Pembelian' | 'Pembayaran Pembelian';
    keterangan: string | null;
    metode_bayar: string;
    bank: string | null;
    jumlah: number;
    status_tempo: string;
    keterangan_tambahan: string | null;
};

type Totals = {
    total_pembelian: number;
    total_pembayaran: number;
    outstanding_all: number;
    outstanding_in_range: number;
};

export default function Purchase() {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [rows, setRows] = useState<PurchaseRow[]>([]);
    const [totals, setTotals] = useState<Totals | null>(null);
    const [loading, setLoading] = useState(false);

    const [paymentStatus, setPaymentStatus] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [bankName, setBankName] = useState<string>('');
    const [q, setQ] = useState<string>('');

    const fmtIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n ?? 0);

    const validRange = useMemo(() => {
        if (!startDate || !endDate) return false;
        return endDate >= startDate;
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            if (!startDate) return toast.warning('Silakan pilih tanggal awal terlebih dahulu');
            if (!endDate) return toast.warning('Silakan pilih tanggal akhir terlebih dahulu');
            if (!validRange) return toast.warning('Tanggal akhir tidak boleh lebih kecil dari tanggal awal');

            setLoading(true);
            const { data } = await axios.get(route('apps.reports.purchase-reports'), {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    payment_status: paymentStatus || undefined,
                    payment_method: paymentMethod || undefined,
                    bank_name: bankName || undefined,
                    q: q || undefined,
                },
            });

            if (data?.code === 200 && data?.data) {
                const serverRows = Array.isArray(data.data.rows?.data) ? data.data.rows.data : data.data.rows || [];
                setRows(serverRows as PurchaseRow[]);
                setTotals(data.data.totals as Totals);
                if (!serverRows.length) toast.info('Laporan kosong untuk rentang tanggal tersebut');
            } else {
                setRows([]);
                setTotals(null);
                toast.info('Laporan kosong untuk rentang tanggal tersebut');
            }
        } catch (e) {
            console.error(e);
            toast.error('Gagal mengambil data laporan');
        } finally {
            setLoading(false);
        }
    };

    const renderStatusTempo = (s: string) => {
        const lower = (s || '').toLowerCase();
        if (lower === '-' || lower === 'paid' || lower === 'lunas') {
            return <Badge variant="outline">Lunas</Badge>;
        }
        if (lower === 'unpaid' || lower.includes('belum')) {
            return <Badge variant="destructive">Belum bayar</Badge>;
        }
        if (lower === 'partial' || lower.includes('cicilan')) {
            return <Badge variant="secondary">Cicilan</Badge>;
        }
        return <Badge variant="outline">{s || '-'}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Pembelian" />
            <div className="p-6">
                <Heading
                    title="Laporan Pembelian"
                    description="Halaman ini digunakan untuk menampilkan data laporan pembelian dan pembayaran pembelian"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <DatePicker date={startDate} setDate={setStartDate} label="Tanggal Awal" />
                    <DatePicker date={endDate} setDate={setEndDate} label="Tanggal Akhir" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Cari transaksi, tipe, atau catatan"
                    />
                    <Input
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Nama bank (BCA/BRI/BNI/…)"
                    />
                    <Select value={paymentStatus} onValueChange={(e) => setPaymentStatus(e)}>
                        <SelectTrigger>
                        <SelectValue placeholder="Status Pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="paid">Lunas</SelectItem>
                            <SelectItem value="unpaid">Belum Bayar</SelectItem>
                            <SelectItem value="partial">Cicilan</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={paymentMethod} onValueChange={(e) => setPaymentMethod(e)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Metode Bayar" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">Semua Metode</SelectItem>
                        <SelectItem value="cash">Tunai</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex mt-4">
                    <Button variant="default" onClick={fetchData} disabled={loading}>
                        <Search className={clsx('mr-2 h-4 w-4', loading && 'animate-pulse')} />
                        {loading ? 'Memuat...' : 'Tampilkan'}
                    </Button>
                </div>
                {/* Loading dialog */}
                {loading ? (
                    <Dialog open={loading}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogDescription>
                                    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-4 rounded-lg p-6">
                                        <LoaderCircle className="text-primary h-10 w-10 animate-spin" />
                                        <div className="text-lg font-semibold">Sedang memproses data...</div>
                                        <p className="text-muted-foreground text-center text-sm">
                                            Mohon tunggu, penarikan data laporan sedang berlangsung.
                                        </p>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <>
                        {/* Summary cards */}
                        {totals && (
                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Total Nilai Pembelian (Dokumen)</p>
                                    <p className="text-xl font-semibold">{fmtIDR(totals.total_pembelian)}</p>
                                </div>
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Total Pembayaran (Arus Kas)</p>
                                    <p className="text-xl font-semibold text-red-600">{fmtIDR(totals.total_pembayaran)}</p>
                                </div>
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Outstanding</p>
                                    <p className={clsx('text-xl font-semibold', totals.outstanding_all > 0 ? 'text-amber-600' : 'text-emerald-600')}>
                                        {fmtIDR(totals.outstanding_all)}
                                    </p>
                                </div>
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Outstanding (Dalam Periode)</p>
                                    <p
                                        className={clsx(
                                            'text-xl font-semibold',
                                            totals.outstanding_in_range > 0 ? 'text-amber-600' : 'text-emerald-600',
                                        )}
                                    >
                                        {fmtIDR(totals.outstanding_in_range)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        {rows.length > 0 && (
                            <TableCard className="mt-5">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[10px]">No</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>No Transaksi</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead>Metode Pembayaran</TableHead>
                                            <TableHead>Bank</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                            <TableHead>Status Tempo</TableHead>
                                            <TableHead>Keterangan Tambahan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.length === 0 ? (
                                            <TableEmpty colSpan={10} message="data laporan pembelian" />
                                        ) : (
                                            rows.map((r, i) => (
                                                <TableRow key={`${r.no_transaksi}-${i}`}>
                                                    <TableCell>{i + 1}</TableCell>
                                                    <TableCell>{r.tanggal}</TableCell>
                                                    <TableCell className="font-medium">{r.no_transaksi}</TableCell>
                                                    <TableCell className="text-muted-foreground">{r.keterangan || '-'}</TableCell>
                                                    <TableCell className='capitalize'>{r.metode_bayar || '-'}</TableCell>
                                                    <TableCell className='uppercase'>{r.bank || '-'}</TableCell>
                                                    <TableCell
                                                        className={clsx(
                                                            'text-right font-medium',
                                                            r.jenis === 'Pembayaran Pembelian' ? 'text-red-600' : '',
                                                        )}
                                                    >
                                                        {fmtIDR(r.jumlah)}
                                                    </TableCell>
                                                    <TableCell className='text-center'>{renderStatusTempo(r.status_tempo)}</TableCell>
                                                    <TableCell className="text-muted-foreground">{r.keterangan_tambahan || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableCard>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
