/* eslint-disable react-hooks/exhaustive-deps */
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Table } from '@/types/table';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownUp, Loader2, PackageCheck, RotateCcw, RotateCw, ShoppingCart, TrendingUp, Truck, Wallet, Warehouse } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Bar, BarChart, ComposedChart,
    Line, CartesianGrid, Pie, PieChart, XAxis
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard1',
    },
];

const chartConfigMonthly = {
    totalPenjualan: {
        label: 'Total Penjualan',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

const chartConfigKategori = {
    sold: {
        label: 'Jumlah Terjual',
    },
    Makanan: {
        label: 'Makanan',
        color: 'var(--chart-1)',
    },
    Minuman: {
        label: 'Minuman',
        color: 'var(--chart-2)',
    },
    Snack: {
        label: 'Snack',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

type minimum_stock = {
    id: number;
    name: string;
    on_hand: string;
}

type top_sellings = {
    id: number;
    name: string;
    net_sold_qty: number;
}

type transaction_pending = {
    id: number;
    tanggal: string;
    customer: string;
    total: string;
    sisa: string;
}

type order_pending = {
    id: number;
    tanggal: string;
    supplier: string;
    total: string;
    sisa: string;
}

type expense_pending = {
    id: number;
    tanggal: string;
    keterangan: string;
    total: string;
    sisa: string;
}

type chart_categories = {
    category: string;
    sold: string;
    fill: string;
}

type category_overall = {
    current_sold: number;
    previous_sold: number;
    diff: number;
    mom_pct: number;
}

type chart_data_monthly_sale = {
    bulan: string
    totalPenjualan: number;
}

type DailyPoint = {
    date: string;
    barangout: number;
    barangin: number;
    totalharga_out: number;
    totalharga_in: number;
};

interface DashboardProps {
    minimum_stocks: minimum_stock[];
    top_sellings: top_sellings[];
    transaction_pending: transaction_pending[];
    order_pending: order_pending[];
    expense_pending: expense_pending[];
    chart_categories: chart_categories[];
    category_overall: category_overall;
    yearOptions: [];
    chartYear: number;
    chartDataMonthlySale: chart_data_monthly_sale[];
    chartDataDaily: DailyPoint[];
    tables: Table[];
    [key: string]: unknown;
}

export default function Dashboard() {
    const {
        minimum_stocks, top_sellings, stockIn, stockOut, totalStock, sales, orders, expenses, purchaseReturns, transactionReturns, order_pending, expense_pending, transaction_pending, chart_categories, category_overall,
        chartDataMonthlySale, chartYear, yearOptions, chartDataDaily, tables
    } = usePage<DashboardProps>().props;

    const summaryStats = [
        { label: 'Penjualan', icon: ShoppingCart, value: sales },
        { label: 'Pembelian', icon: PackageCheck, value: orders },
        { label: 'Biaya', icon: Wallet, value: expenses },
        { label: 'Retur Penjualan', icon: RotateCw, value: purchaseReturns },
        { label: 'Retur Pembelian', icon: RotateCcw, value: transactionReturns },
        { label: 'Barang Masuk', icon: Truck, value: stockIn },
        { label: 'Barang Keluar', icon: ArrowDownUp, value: stockOut },
        { label: 'Sisa barang', icon: Warehouse, value: totalStock },
    ];

    const METRIC_KEYS = ['barangout', 'barangin', 'totalharga_out', 'totalharga_in'] as const;
    type MetricKey = typeof METRIC_KEYS[number];

    const chartConfig = {
        barangout: { label: 'Barang Out', color: 'var(--chart-2)' },
        barangin: { label: 'Barang In', color: 'var(--chart-1)' },
        totalharga_out: { label: 'Total Harga Barang Out', color: 'var(--chart-3)' },
        totalharga_in: { label: 'Total Harga Barang In', color: 'var(--chart-4)' },
    } satisfies Record<MetricKey, { label: string; color: string }>;

    const [selectedYear, setSelectedYear] = useState<number>(chartYear);
    const [loading, setLoading] = useState(false);

    useEffect(() => setSelectedYear(chartYear), [chartYear]);

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const y = Number(e.target.value);
        setSelectedYear(y);
        setLoading(true);

        router.get(route('apps.dashboard'), { year: y },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["chartDataMonthlySale", "chartYear"],
                onFinish: () => setLoading(false),
            }
        );
    };

    const [tab, setTab] = useState('penjualan');
    const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>('barangout');

    const chartData = chartDataDaily ?? [];

    const total = React.useMemo(() => ({
        barangout: chartData.reduce((acc, curr) => acc + (curr.barangout || 0), 0),
        barangin: chartData.reduce((acc, curr) => acc + (curr.barangin || 0), 0),
        totalharga_out: chartData.reduce((acc, curr) => acc + (curr.totalharga_out || 0), 0),
        totalharga_in: chartData.reduce((acc, curr) => acc + (curr.totalharga_in || 0), 0),
    } satisfies Record<MetricKey, number>), [chartData]);

    function formatNumber(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    const [movingAvgWindow, setMovingAvgWindow] = useState<number>(3);

    console.log(tables);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard POS" />
            <div className="flex flex-col gap-4 p-4">
                {/* Statistik Ringkas */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
                    {summaryStats.map(({ label, icon: Icon, value }) => (
                        <div key={label} className="border-border bg-muted relative overflow-hidden rounded-xl border py-4 pr-4 pl-6">
                            <Icon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-10 w-10 -translate-y-1/2 opacity-10" />
                            <div className="text-center">
                                <p className="text-muted-foreground text-sm font-medium">{label}</p>
                                <p className="text-foreground text-xl font-bold">{String(value)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grafik Penjualan Harian */}
                <Card className="py-0">
                    <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                            <CardTitle>Grafik Penjualan Harian</CardTitle>
                            <CardDescription>Data interaktif penjualan dan pembelian berdasarkan tanggal</CardDescription>
                        </div>
                        <div className="grid grid-cols-2 sm:flex">
                            {METRIC_KEYS.map((key) => {
                                const chart = key as keyof typeof chartConfig;
                                const value = total[key] ?? 0;

                                const formattedValue = key.startsWith('totalharga') ? 'Rp' + formatNumber(value) : value.toString();

                                return (
                                    <button
                                        key={chart}
                                        data-active={activeChart === chart}
                                        className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                        onClick={() => setActiveChart(chart)}
                                    >
                                        <span className="text-muted-foreground text-xs">{chartConfig[chart].label}</span>
                                        <span className="text-lg leading-none font-bold sm:text-3xl">{formattedValue}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 sm:p-6">
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                            <BarChart
                                accessibilityLayer
                                data={chartData}
                                margin={{
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        });
                                    }}
                                />
                                <ChartTooltip
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload || !payload.length) return null;

                                        const data = payload[0].payload;

                                        return (
                                            <div className="bg-background space-y-1 rounded-md border p-2 text-sm shadow-sm">
                                                <div className="font-medium">
                                                    {new Date(label).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                                <div>
                                                    {chartConfig[activeChart].label}:{' '}
                                                    <b>
                                                        {activeChart.startsWith('totalharga')
                                                            ? 'Rp' + formatNumber(data[activeChart])
                                                            : `${data[activeChart]} pcs`}
                                                    </b>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />

                                <Bar dataKey={activeChart} fill={chartConfig[activeChart].color} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Grafik Penjualan per tahun dan Statistik meja yang sedang aktif */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Grafik Penjualan Perbulan - lebih lebar */}
                    {/* <Card className="py-0 md:col-span-2">
                        <CardHeader className="flex flex-col items-center justify-between border-b px-6 py-4 sm:flex-row">
                            <div>
                                <CardTitle>Grafik Penjualan Per Bulan</CardTitle>
                                <CardDescription>Total penjualan berdasarkan Tahun</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="border-border bg-background rounded-md border px-3 py-1 text-sm"
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    disabled={loading}
                                >
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {loading && (
                                    <span className="text-xs opacity-70">memuat…</span>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="px-2 sm:p-6">
                            {loading ?
                                <div className='text-center flex flex-col gap-2 items-center justify-center h-[250px]'>
                                    <Loader2 className='animate-spin' />
                                    <div>Tunggu Sebentar...</div>
                                </div>
                                :
                                <ChartContainer config={chartConfigMonthly} className="aspect-auto h-[250px] w-full">
                                    <BarChart data={chartDataMonthlySale} margin={{ left: 12, right: 12 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="bulan" tickLine={false} axisLine={false} tickMargin={8} />
                                        <ChartTooltip
                                            content={({ active, payload, label }) => {
                                                if (!active || !payload || !payload.length) return null;
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-background space-y-1 rounded-md border p-2 text-sm shadow-sm">
                                                        <div className="font-medium">Bulan: {label}</div>
                                                        <div>
                                                            Total Penjualan: <b>Rp {formatNumber(data.totalPenjualan)}</b>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Bar dataKey="totalPenjualan" fill={chartConfigMonthly.totalPenjualan.color} />
                                    </BarChart>
                                </ChartContainer>
                            }

                        </CardContent>
                    </Card> */}

                    {/* Grafik Prediksi Penjualan (Moving Average + Linear Regression) */}
                    <Card className="py-0 md:col-span-2">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
                            {/* Judul dan deskripsi */}
                            <div>
                                <CardTitle className="text-base sm:text-lg">Grafik & Prediksi Penjualan</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Lihat total penjualan per bulan dan prediksi tren berikutnya.
                                </CardDescription>
                            </div>

                            {/* Filter */}
                            <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                                {/* Filter Tahun */}
                                <select
                                    className="border-border bg-background rounded-md border px-3 py-1 text-xs sm:text-sm"
                                    value={selectedYear || ""}
                                    onChange={handleYearChange}
                                    disabled={loading}
                                >
                                    <option value="">Pilih tahun...</option>
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>


                                {/* Filter Rata-rata Moving Average */}
                                <select
                                    className="border-border bg-background rounded-md border px-2 py-1 text-xs sm:text-sm"
                                    value={movingAvgWindow || ""}
                                    onChange={(e) => setMovingAvgWindow(Number(e.target.value))}
                                >
                                    <option value="">Pilih rata-rata...</option>
                                    {[1, 2, 3, 6, 12].map((val) => (
                                        <option key={val} value={val}>
                                            {val} Bulan
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>

                        <CardContent className="px-2 sm:p-6">
                            {loading ? (
                                <div className="text-center flex flex-col gap-2 items-center justify-center h-[250px]">
                                    <Loader2 className="animate-spin" />
                                    <div>Tunggu Sebentar...</div>
                                </div>
                            ) : chartDataMonthlySale.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Belum ada data penjualan
                                </div>
                            ) : (
                                <ChartContainer
                                    config={{
                                        actual: { label: "Penjualan Aktual", color: "var(--chart-3)" },
                                        movingAvg: { label: "Rata-rata", color: "var(--chart-2)" },
                                        regression: { label: "Prediksi", color: "var(--chart-4)" },
                                    }}
                                    className="aspect-auto h-[250px] w-full"
                                >
                                    <ComposedChart
                                        data={(() => {
                                            const data = [...chartDataMonthlySale];
                                            const windowSize = movingAvgWindow;

                                            // Moving Average
                                            const withMovingAvg = data.map((d, i) => {
                                                if (i < windowSize - 1) return { ...d, movingAvg: null };
                                                const avg =
                                                    data
                                                        .slice(i - windowSize + 1, i + 1)
                                                        .reduce((sum, item) => sum + item.totalPenjualan, 0) / windowSize;
                                                return { ...d, movingAvg: Math.round(avg) };
                                            });

                                            // Linear Regression
                                            const n = data.length;
                                            const x = data.map((_, i) => i + 1);
                                            const y = data.map((d) => d.totalPenjualan);
                                            const meanX = x.reduce((a, b) => a + b, 0) / n;
                                            const meanY = y.reduce((a, b) => a + b, 0) / n;

                                            const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
                                            const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
                                            const slope = numerator / denominator;
                                            const intercept = meanY - slope * meanX;

                                            const withRegression = withMovingAvg.map((d, i) => ({
                                                ...d,
                                                regression: Math.round(intercept + slope * (i + 1)),
                                            }));

                                            // Prediksi bulan berikutnya
                                            const nextPrediction = Math.round(intercept + slope * (n + 1));
                                            withRegression.push({
                                                bulan: "Prediksi",
                                                totalPenjualan: 0,
                                                movingAvg: null,
                                                regression: nextPrediction,
                                            });

                                            return withRegression;
                                        })()}
                                        margin={{ left: 12, right: 12 }}
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis dataKey="bulan" tickLine={false} axisLine={false} tickMargin={8} />

                                        <ChartTooltip
                                            content={({ active, payload, label }) => {
                                                if (!active || !payload?.length) return null;
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-background rounded-md border p-2 text-sm shadow-sm space-y-1">
                                                        <div className="font-medium">Bulan: {label}</div>
                                                        {data.totalPenjualan ? (
                                                            <div>
                                                                Penjualan Sebenarnya:{" "}
                                                                <b>Rp {formatNumber(data.totalPenjualan)}</b>
                                                            </div>
                                                        ) : null}
                                                        {data.movingAvg ? (
                                                            <div>
                                                                Rata-rata ({movingAvgWindow} Bulan):{" "}
                                                                <b>Rp {formatNumber(data.movingAvg)}</b>
                                                            </div>
                                                        ) : null}
                                                        {data.regression ? (
                                                            <div>
                                                                Prediksi: <b>Rp {formatNumber(data.regression)}</b>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            }}
                                        />

                                        <Bar dataKey="totalPenjualan" fill="var(--chart-3)" radius={[4, 4, 0, 0]} barSize={24} />
                                        <Line type="monotone" dataKey="movingAvg" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} />
                                        <Line type="linear" dataKey="regression" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                                    </ComposedChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistik meja yang sedang aktif */}
                    <div className="border-border relative flex min-h-[220px] flex-col rounded-xl border p-4">
                        <h2 className="mb-4 text-base font-semibold">Status Meja Saat Ini</h2>

                        <div className="overflow-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-border border-b">
                                        <th className="px-3 py-2 font-semibold">No Meja</th>
                                        <th className="px-3 py-2 font-semibold">Kapasitas</th>
                                        <th className="px-3 py-2 font-semibold">Customer</th>
                                        <th className="px-3 py-2 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tables.map((table, key) => (
                                        <tr key={key} className="border-border border-b last:border-none">
                                            <td className="px-3 py-2">{table.number}</td>
                                            <td className="px-3 py-2">{table.capacity} Orang</td>
                                            <td className="px-3 py-2">{table.transaction?.customer?.name ?? 'Umum'}</td>
                                            <td className="px-3 py-2">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${table.status === 'available'
                                                        ? 'bg-green-100 text-green-800'
                                                        : table.status === 'reserved'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {table.status === 'available' ? 'Tersedia' : table.status === 'reserved' ? 'Dibooking' : 'Tidak Tersedia'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* List Barang Stok Terendah & Produk Terlaris dan Kategori Terlaris */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* 10 Barang dengan Stok Terendah */}
                    <div className="border-border relative flex min-h-[220px] flex-col rounded-xl border p-4">
                        <h2 className="mb-4 text-base font-semibold">10 Barang dengan Stok Terendah</h2>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-border border-b">
                                        <th className="px-3 py-2 font-semibold">No.</th>
                                        <th className="px-3 py-2 font-semibold">Nama Barang</th>
                                        <th className="px-3 py-2 font-semibold">Stok</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {minimum_stocks.map((item, key) => (
                                        <tr key={key} className="border-border border-b last:border-none">
                                            <td className="px-3 py-2">{key + 1}</td>
                                            <td className="px-3 py-2">{item.name}</td>
                                            <td className="px-3 py-2">{item.on_hand}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Produk Terlaris */}
                    <div className="border-border relative flex min-h-[220px] flex-col rounded-xl border p-4">
                        <h2 className="mb-4 text-base font-semibold">Produk Terlaris</h2>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-border border-b">
                                        <th className="px-3 py-2 font-semibold">No.</th>
                                        <th className="px-3 py-2 font-semibold">Nama Produk</th>
                                        <th className="px-3 py-2 font-semibold">Jumlah Terjual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {top_sellings.map((item, key) => (
                                        <tr key={key} className="border-border border-b last:border-none">
                                            <td className="px-3 py-2">{key + 1}</td>
                                            <td className="px-3 py-2">{item.name}</td>
                                            <td className="px-3 py-2">{item.net_sold_qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Kategori Terlaris */}
                    <Card className="flex flex-col">
                        <CardHeader className="items-center pb-0">
                            <CardTitle>Kategori Terlaris</CardTitle>
                            <CardDescription>Penjualan kategori terbaru</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0">
                            <ChartContainer config={chartConfigKategori} className="mx-auto aspect-square max-h-[250px]">
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={chart_categories} dataKey="sold" nameKey="category" fill="#8884d8" outerRadius={100} label />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2 leading-none font-medium">
                                Trending up by {category_overall.mom_pct}% this month <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="text-muted-foreground leading-none">Data penjualan kategori bulan ini</div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Grafik Performa Bisnis */}
                <div className="border-border relative flex min-h-[300px] flex-col gap-4 rounded-xl border p-4">
                    {/* Header: Judul dan Tabs sejajar */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-base font-semibold">Transaksi Belum Lunas</h2>
                        <Tabs value={tab} onValueChange={setTab}>
                            <TabsList className="flex w-full justify-between sm:w-auto sm:justify-end">
                                <TabsTrigger value="penjualan" className="px-3 py-1 text-sm sm:text-base">Penjualan</TabsTrigger>
                                <TabsTrigger value="pembelian" className="px-3 py-1 text-sm sm:text-base">Pembelian</TabsTrigger>
                                <TabsTrigger value="pengeluaran" className="px-3 py-1 text-sm sm:text-base">Pengeluaran</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Konten Tab */}
                    <div>
                        <Tabs value={tab} onValueChange={setTab}>
                            {/* Penjualan */}
                            <TabsContent value="penjualan">
                                {transaction_pending.length > 0 ? (
                                    <div className="overflow-auto">
                                        <table className="w-full border-collapse text-left text-sm">
                                            <thead>
                                                <tr className="border-border bg-muted/50 border-b">
                                                    <th className="px-3 py-2 font-semibold">Tanggal</th>
                                                    <th className="px-3 py-2 font-semibold">ID</th>
                                                    <th className="px-3 py-2 font-semibold">Customer</th>
                                                    <th className="px-3 py-2 text-right font-semibold">Total</th>
                                                    <th className="px-3 py-2 text-right font-semibold">Sisa</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transaction_pending.map((item) => (
                                                    <tr key={item.id} className="border-border border-b last:border-none">
                                                        <td className="px-3 py-2">{item.tanggal}</td>
                                                        <td className="px-3 py-2">{item.id}</td>
                                                        <td className="px-3 py-2">{item.customer ?? 'Umum'}</td>
                                                        <td className="px-3 py-2 text-right">Rp {item.total.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            <Badge variant="destructive">Rp {item.sisa.toLocaleString()}</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Semua penjualan telah lunas.</p>
                                )}
                            </TabsContent>

                            {/* Pembelian */}
                            <TabsContent value="pembelian">
                                {order_pending.length > 0 ? (
                                    <div className="overflow-auto">
                                        <table className="w-full border-collapse text-left text-sm">
                                            <thead>
                                                <tr className="border-border bg-muted/50 border-b">
                                                    <th className="px-3 py-2 font-semibold">Tanggal</th>
                                                    <th className="px-3 py-2 font-semibold">ID</th>
                                                    <th className="px-3 py-2 font-semibold">Supplier</th>
                                                    <th className="px-3 py-2 text-right font-semibold">Total</th>
                                                    <th className="px-3 py-2 text-right font-semibold">Sisa</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order_pending.map((item) => (
                                                    <tr key={item.id} className="border-border border-b last:border-none">
                                                        <td className="px-3 py-2">{item.tanggal}</td>
                                                        <td className="px-3 py-2">{item.id}</td>
                                                        <td className="px-3 py-2">{item.supplier}</td>
                                                        <td className="px-3 py-2 text-right">Rp {item.total.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            <Badge variant="destructive">Rp {item.sisa.toLocaleString()}</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Semua pembelian telah lunas.</p>
                                )}
                            </TabsContent>

                            {/* Pengeluaran */}
                            <TabsContent value="pengeluaran">
                                {expense_pending.length > 0 ? (
                                    <div className="overflow-auto">
                                        <table className="w-full border-collapse text-left text-sm">
                                            <thead>
                                                <tr className="border-border bg-muted/50 border-b">
                                                    <th className="px-3 py-2 font-semibold">Tanggal</th>
                                                    <th className="px-3 py-2 font-semibold">ID</th>
                                                    <th className="px-3 py-2 font-semibold">Kategori</th>
                                                    <th className="px-3 py-2 text-right font-semibold">Total</th>
                                                    <th className="px-3 py-2 text-right font-semibold">Sisa</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expense_pending.map((item) => (
                                                    <tr key={item.id} className="border-border border-b last:border-none">
                                                        <td className="px-3 py-2">{item.tanggal}</td>
                                                        <td className="px-3 py-2">{item.id}</td>
                                                        <td className="px-3 py-2">{item.keterangan}</td>
                                                        <td className="px-3 py-2 text-right">Rp {item.total.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            <Badge variant="destructive">Rp {item.sisa.toLocaleString()}</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Semua pengeluaran telah lunas.</p>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
