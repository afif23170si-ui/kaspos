import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import { DialogHeader, Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import clsx from 'clsx';
import { LoaderCircle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan Arus Kas', href: route('apps.reports.cash-flows') }];

type ReportRow = {
    tanggal: string;
    no_transaksi: string;
    jenis_transaksi: string;
    keterangan: string | null;
    metode_bayar: string;
    bank: string | null;
    arah_kas: 'Masuk' | 'Keluar';
    jumlah: number;
    status_tempo: string;
    keterangan_tambahan: string | null;
};

type Totals = {
    total_masuk: number;
    total_keluar: number;
    saldo: number;
};

export default function CashFlow() {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [totals, setTotals] = useState<Totals | null>(null);
    const [loading, setLoading] = useState(false);

    const fmtIDR = (n: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(n ?? 0);

    const validRange = useMemo(() => {
        if (!startDate || !endDate) return false;
        return endDate >= startDate;
    }, [startDate, endDate]);

    const withBalance = useMemo(() => {
        let saldo = 0;
        return reports.map((r) => {
            saldo += r.arah_kas === 'Masuk' ? r.jumlah : -r.jumlah;
            return { ...r, _saldo: saldo };
        });
    }, [reports]);

    const fetchData = async () => {
        try {
            if (!startDate) return toast.warning('Silakan pilih tanggal awal terlebih dahulu');
            if (!endDate) return toast.warning('Silakan pilih tanggal akhir terlebih dahulu');
            if (!validRange) return toast.warning('Tanggal akhir tidak boleh lebih kecil dari tanggal awal');

            setLoading(true);
            const { data } = await axios.get(route('apps.reports.cash-flow-reports'), {
                params: { start_date: startDate, end_date: endDate },
            });

            if (data?.code === 200 && data?.data?.rows) {
                setReports(data.data.rows as ReportRow[]);
                setTotals(data.data.totals as Totals);
            } else {
                setReports([]);
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
        if (lower === 'unpaid' || lower.includes('belum') || lower === 'pending') {
            return <Badge variant="destructive">Belum bayar</Badge>;
        }
        if (lower === 'partial' || lower.includes('cicilan')) {
            return <Badge variant="secondary">Cicilan</Badge>;
        }
        return <Badge variant="outline">{s || '-'}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Arus Kas" />
            <div className="p-6">
                <Heading title="Laporan Arus Kas" description="Halaman ini digunakan untuk menampilkan data laporan arus kas" />
                <div className="flex flex-col gap-4 lg:flex-row">
                    <DatePicker date={startDate} setDate={setStartDate} label="Pilih Tanggal Awal" />
                    <DatePicker date={endDate} setDate={setEndDate} label="Pilih Tanggal Akhir" />
                    <Button variant="secondary" onClick={fetchData} disabled={loading}>
                        <Search className={clsx('mr-2', loading && 'animate-pulse')} />
                        {loading ? 'Memuat...' : 'Tampilkan Laporan'}
                    </Button>
                </div>
                {loading ?
                    <Dialog open={loading}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogDescription>
                                    <div className="rounded-lg p-6 flex flex-col items-center justify-center space-y-4 w-full max-w-md mx-auto">
                                        <LoaderCircle className="w-10 h-10 animate-spin text-primary" />
                                        <div className="text-lg font-semibold">Sedang memproses data...</div>
                                        <p className="text-muted-foreground text-sm text-center">
                                            Mohon tunggu, penarikan data laporan sedang berlangsung.
                                        </p>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                    :
                    <>
                        {totals && (
                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Total Masuk</p>
                                    <p className="text-xl font-semibold text-emerald-600">{fmtIDR(totals.total_masuk)}</p>
                                </div>
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Total Keluar</p>
                                    <p className="text-xl font-semibold text-red-600">{fmtIDR(totals.total_keluar)}</p>
                                </div>
                                <div className="rounded border p-4 shadow-sm">
                                    <p className="text-muted-foreground text-sm">Saldo</p>
                                    <p className={clsx('text-xl font-semibold', totals.saldo < 0 ? 'text-red-600' : 'text-emerald-600')}>
                                        {fmtIDR(totals.saldo)}
                                    </p>
                                </div>
                            </div>
                        )}
                        {reports.length > 0 &&
                            <TableCard className="mt-5">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[10px]">No</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>No Transaksi</TableHead>
                                            <TableHead>Jenis Transaksi</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead>Metode Pembayaran</TableHead>
                                            <TableHead>Bank</TableHead>
                                            <TableHead>Arah Kas</TableHead>
                                            <TableHead>Jumlah</TableHead>
                                            <TableHead>Status Tempo</TableHead>
                                            <TableHead>Keterangan Tambahan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {withBalance.length === 0 ? (
                                            <TableEmpty colSpan={11} message="data laporan arus kas" />
                                        ) : (
                                            withBalance.map((report, index) => (
                                                <TableRow key={`${report.no_transaksi}-${index}`}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{report.tanggal}</TableCell>
                                                    <TableCell className="font-medium">{report.no_transaksi}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={report.arah_kas === 'Masuk' ? 'default' : 'secondary'}>{report.jenis_transaksi}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground capitalize">{report.keterangan || '-'}</TableCell>
                                                    <TableCell className='capitalize'>{report.metode_bayar}</TableCell>
                                                    <TableCell className='uppercase'>{report.bank || '-'}</TableCell>
                                                    <TableCell className='text-center'>
                                                        <Badge variant={report.arah_kas === 'Masuk' ? 'default' : 'destructive'}>{report.arah_kas}</Badge>
                                                    </TableCell>
                                                    <TableCell className={clsx(report.arah_kas === 'Masuk' ? 'text-emerald-600' : 'text-red-600', 'font-medium')}>
                                                        {fmtIDR(report.jumlah)}
                                                    </TableCell>
                                                    <TableCell className='text-center'>{renderStatusTempo(report.status_tempo)}</TableCell>
                                                    <TableCell className="text-muted-foreground">{report.keterangan_tambahan || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableCard>
                        }
                    </>
                }
            </div>
        </AppLayout>
    );
}
