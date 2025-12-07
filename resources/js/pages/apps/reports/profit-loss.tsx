import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Table, TableBody, TableCard, TableCell, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import clsx from 'clsx';
import { LoaderCircle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan Laba Rugi', href: route('apps.reports.profit-loss') }];

type ProfitLoss = {
    periode: { start_date: string; end_date: string };
    pendapatan: {
        penjualan_gross: number;
        pendapatan_lain: number;
        retur_penjualan: number;
        pajak_keluaran: number;
        total: number;
    };
    hpp: {
        pembelian_terjual: number;
        retur_pembelian: number;
        total: number;
    };
    pajak: number;
    laba_kotor: number;
    biaya_operasional: {
        details: { name: string; amount: number }[];
        total: number;
    };
    laba_bersih: number;
};

const fmtIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n ?? 0);

const fmtDateID = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export default function ProfitLossReport() {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<ProfitLoss | null>(null);

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
            const { data } = await axios.get(route('apps.reports.profit-loss-reports'), {
                params: { start_date: startDate, end_date: endDate },
            });

            if (data?.code === 200 && data?.data) {
                setReport(data.data as ProfitLoss);
                if (!data.data) toast.info('Laporan kosong untuk rentang tanggal tersebut');
            } else {
                setReport(null);
                toast.info('Laporan kosong untuk rentang tanggal tersebut');
            }
        } catch (e) {
            console.error(e);
            toast.error('Gagal mengambil data laporan');
        } finally {
            setLoading(false);
        }
    };

    const periodLabel = report
        ? `${fmtDateID(report.periode.start_date)} - ${fmtDateID(report.periode.end_date)}`
        : `${fmtDateID(startDate)} - ${fmtDateID(endDate)}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Laba Rugi" />
            <div className="p-6">
                <Heading title="Laporan Laba Rugi" description="Ringkasan pendapatan, HPP, biaya, dan laba bersih" />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <DatePicker date={startDate} setDate={setStartDate} label="Tanggal Awal" />
                    <DatePicker date={endDate} setDate={setEndDate} label="Tanggal Akhir" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button variant="default" onClick={fetchData} disabled={loading}>
                        <Search className={clsx('mr-2 h-4 w-4', loading && 'animate-pulse')} />
                        {loading ? 'Memuat...' : 'Tampilkan'}
                    </Button>
                    <div className="text-muted-foreground text-sm">
                        Periode: <span className="text-foreground font-medium">{periodLabel}</span>
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
                                            Mohon tunggu, penarikan data laporan sedang berlangsung.
                                        </p>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                )}
                {report && !loading && (
                    <div className="mt-6 space-y-6">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <KpiCard label="Total Pendapatan" value={report.pendapatan.total} />
                            <KpiCard label="Total HPP" value={report.hpp.total} />
                            <KpiCard label="Laba Kotor" value={report.laba_kotor} />
                            <KpiCard label="Pajak" value={report.pajak} />
                            <KpiCard label="Laba Bersih" value={report.laba_bersih}/>
                        </div>
                        <TableCard>
                            <Table>
                                <TableBody>
                                    <SectionHeader title="Pendapatan" />
                                    <Row label="Penjualan (Subtotal)" value={report.pendapatan.penjualan_gross} />
                                    <Row
                                        label="Pendapatan Lainnya"
                                        value={report.pendapatan.pendapatan_lain}
                                        hint="Termasuk biaya layanan, pembulatan, pajak terjual, dsb."
                                    />
                                    <Row label="Retur Penjualan" value={-Math.abs(report.pendapatan.retur_penjualan)} negative />
                                    <TotalRow label="Total Pendapatan" value={report.pendapatan.total} />
                                    <SectionHeader title="Harga Pokok Penjualan (HPP)" />
                                    <Row label="HPP Penjualan" value={report.hpp.pembelian_terjual} />
                                    <Row label="Retur Pembelian" value={-Math.abs(report.hpp.retur_pembelian)} negative />
                                    <SubtotalRow label="Total HPP" value={report.hpp.total} />
                                    <GrandRow label="Laba Kotor" value={report.laba_kotor} />
                                    <SectionHeader title="Biaya Operasional" />
                                    {Array.isArray(report.biaya_operasional.details) && report.biaya_operasional.details.length > 0 ? (
                                        report.biaya_operasional.details.map((b, i) => <Row key={i} label={b.name} value={b.amount} />)
                                    ) : (
                                        <MutedNote text="Tidak ada biaya operasional pada periode ini." />
                                    )}
                                    <SubtotalRow label="Total Biaya Operasional" value={report.biaya_operasional.total} />
                                    <GrandRow label="Laba Bersih" value={report.laba_bersih} emphasize />
                                    <Notes />
                                </TableBody>
                            </Table>
                        </TableCard>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function KpiCard({ label, value, emphasize = false }: { label: string; value: number; emphasize?: boolean }) {
    const negative = value < 0;
    return (
        <div className={clsx('rounded border p-4 shadow-sm', emphasize && 'ring-primary/30 ring-1')}>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p
                className={clsx(
                    'mt-1 text-xl font-semibold',
                    negative ? 'text-red-600' : 'text-emerald-600',
                    !negative && !emphasize && 'text-emerald-700',
                )}
            >
                {fmtIDR(value)}
            </p>
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <TableRow>
            <TableCell colSpan={2} className="bg-muted/40 py-2 text-sm font-semibold">
                {title}
            </TableCell>
        </TableRow>
    );
}

function Row({ label, value, hint, negative }: { label: string; value: number; hint?: string; negative?: boolean }) {
    const v = negative ? -Math.abs(value) : value;
    return (
        <>
            <TableRow>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span>{label}</span>
                        {hint ? <span className="text-muted-foreground text-xs">({hint})</span> : null}
                    </div>
                </TableCell>
                <TableCell className={clsx('text-right', v < 0 ? 'text-red-600' : '')}>{fmtIDR(v)}</TableCell>
            </TableRow>
        </>
    );
}


function SubtotalRow({ label, value }: { label: string; value: number }) {
    return (
        <TableRow>
            <TableCell className="font-medium">{label}</TableCell>
            <TableCell className="text-right font-semibold">{fmtIDR(value)}</TableCell>
        </TableRow>
    );
}

function TotalRow({ label, value }: { label: string; value: number }) {
    return (
        <TableRow className="bg-secondary/40">
            <TableCell className="font-semibold">{label}</TableCell>
            <TableCell className="text-right font-semibold">{fmtIDR(value)}</TableCell>
        </TableRow>
    );
}

function GrandRow({ label, value, emphasize = false }: { label: string; value: number; emphasize?: boolean }) {
    return (
        <TableRow className={clsx('bg-secondary', emphasize && 'bg-secondary/70')}>
            <TableCell className="font-bold">{label}</TableCell>
            <TableCell className={clsx('text-right font-bold', value < 0 ? 'text-red-600' : 'text-emerald-600')}>{fmtIDR(value)}</TableCell>
        </TableRow>
    );
}

function MutedNote({ text }: { text: string }) {
    return (
        <TableRow>
            <TableCell colSpan={2} className="text-muted-foreground text-sm">
                {text}
            </TableCell>
        </TableRow>
    );
}

function Notes() {
    return (
        <TableRow>
            <TableCell colSpan={2} className="pt-6">
                <div className="bg-muted/30 text-muted-foreground rounded-md border p-3 text-xs leading-relaxed">
                    <div className="text-foreground font-semibold">Keterangan:</div>
                    <ul className="list-disc pl-4">
                        <li><b>Penjualan (Subtotal):</b> total harga jual sebelum ongkir/biaya/pajak.</li>
                        <li><b>Pendapatan Lainnya:</b> biaya admin/pajak/pembulatan; bisa negatif.</li>
                        <li><b>Total Pendapatan:</b> Grand Total - Retur Penjualan.</li>
                        <li><b>HPP Penjualan:</b> biaya pokok/unit x qty (snapshot/batch; default dari capital_price).</li>
                        <li><b>Retur Pembelian:</b> mengurangi HPP.</li>
                        <li><b>Biaya Operasional:</b> Expenses + Komisi Platform (OLS) + Biaya Admin (OPR).</li>
                        <li><b>Laba Kotor:</b> Total Pendapatan - Total HPP.</li>
                        <li><b>Laba Bersih:</b> Laba Kotor - Biaya Operasional.</li>
                    </ul>
                </div>
            </TableCell>
        </TableRow>
    );
}
