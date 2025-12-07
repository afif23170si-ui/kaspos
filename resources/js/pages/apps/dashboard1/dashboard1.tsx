import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import React, { useState } from "react"
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart } from "recharts"
import {
    ShoppingCart,
    PackageCheck,
    Wallet,
    RotateCcw,
    RotateCw,
    Truck,
    ArrowDownUp,
    Warehouse,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardFooter,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard1',
    },
];

// Data Statistik dengan ikon
const summaryStats = [
    { label: "Penjualan", icon: ShoppingCart },
    { label: "Pembelian", icon: PackageCheck },
    { label: "Biaya", icon: Wallet },
    { label: "Retur Penjualan", icon: RotateCw },
    { label: "Retur Pembelian", icon: RotateCcw },
    { label: "Barang Masuk", icon: Truck },
    { label: "Barang Keluar", icon: ArrowDownUp },
    { label: "Sisa barang", icon: Warehouse },
];

// Contoh data penjualan harian (dummy)
const chartData = [
    { date: "2024-04-01", barangout: 222, barangin: 150, totalharga_out: 2000000, totalharga_in: 1200000 },
    { date: "2024-04-02", barangout: 97, barangin: 180, totalharga_out: 1500000, totalharga_in: 2200000 },
    { date: "2024-04-03", barangout: 167, barangin: 120, totalharga_out: 3400000, totalharga_in: 3200000 },
    { date: "2024-04-04", barangout: 145, barangin: 200, totalharga_out: 2800000, totalharga_in: 3100000 },
    { date: "2024-04-05", barangout: 190, barangin: 160, totalharga_out: 3600000, totalharga_in: 2500000 },
    { date: "2024-04-06", barangout: 88, barangin: 140, totalharga_out: 1300000, totalharga_in: 1800000 },
];

// data penjualan bulanan (dummy)
const chartDataMonthly = [
    { bulan: "Jan", totalPenjualan: 15000000 },
    { bulan: "Feb", totalPenjualan: 12000000 },
    { bulan: "Mar", totalPenjualan: 18000000 },
    { bulan: "Apr", totalPenjualan: 22000000 },
    { bulan: "Mei", totalPenjualan: 20000000 },
];

// data kategori terlaris untuk POS
const chartDataKategori = [
    { category: "Makanan", sold: 350, fill: "var(--chart-1)" },
    { category: "Minuman", sold: 200, fill: "var(--chart-2)" },
    { category: "Snack", sold: 150, fill: "var(--chart-3)" },
]

// data transaksi penjualan belum lunas
const dummyPenjualan = [
    { id: "INV001", customer: "Budi", total: 120000, sisa: 20000, tanggal: "2025-06-01" },
    { id: "INV002", customer: "Siti", total: 80000, sisa: 80000, tanggal: "2025-06-02" },
    { id: "INV003", customer: "Andi", total: 200000, sisa: 50000, tanggal: "2025-06-03" },
    { id: "INV004", customer: "Dewi", total: 150000, sisa: 10000, tanggal: "2025-06-04" },
    { id: "INV005", customer: "Rina", total: 90000, sisa: 45000, tanggal: "2025-06-05" },
];

// data transaksi pembelian belum lunas
const dummyPembelian = [
    { id: "PB001", supplier: "PT Sumber Maju", total: 150000, sisa: 50000, tanggal: "2025-06-01" },
    { id: "PB002", supplier: "CV Pangan Sejahtera", total: 100000, sisa: 100000, tanggal: "2025-06-02" },
    { id: "PB003", supplier: "PT Makmur Sentosa", total: 180000, sisa: 60000, tanggal: "2025-06-03" },
    { id: "PB004", supplier: "CV Sejahtera", total: 220000, sisa: 110000, tanggal: "2025-06-04" },
    { id: "PB005", supplier: "PT Abadi", total: 130000, sisa: 70000, tanggal: "2025-06-05" },
];

// data transaksi pengeluaran belum lunas
const dummyPengeluaran = [
    { id: "EX001", keterangan: "Biaya Listrik", total: 50000, sisa: 20000, tanggal: "2025-06-01" },
    { id: "EX002", keterangan: "Biaya Air", total: 30000, sisa: 10000, tanggal: "2025-06-02" },
    { id: "EX003", keterangan: "Gaji Karyawan Harian", total: 400000, sisa: 100000, tanggal: "2025-06-03" },
    { id: "EX004", keterangan: "Beli Gas", total: 150000, sisa: 50000, tanggal: "2025-06-04" },
    { id: "EX005", keterangan: "Maintenance AC", total: 80000, sisa: 30000, tanggal: "2025-06-05" },
];



const chartConfig = {
    barangout: {
        label: "Barang Out",
        color: "var(--chart-2)",
    },
    barangin: {
        label: "Barang In",
        color: "var(--chart-1)",
    },
    totalharga_out: {
        label: "Total Harga Barang Out",
        color: "var(--chart-3)",
    },
    totalharga_in: {
        label: "Total Harga Barang In",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

const chartConfigMonthly = {
    totalPenjualan: {
        label: "Total Penjualan",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

const chartConfigKategori = {
    sold: {
        label: "Jumlah Terjual",
    },
    Makanan: {
        label: "Makanan",
        color: "var(--chart-1)",
    },
    Minuman: {
        label: "Minuman",
        color: "var(--chart-2)",
    },
    Snack: {
        label: "Snack",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

export default function Dashboard1() {
    const [tab, setTab] = useState("penjualan")

    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("barangout")
    const total = React.useMemo(
        () => ({
            barangout: chartData.reduce((acc, curr) => acc + curr.barangout, 0),
            barangin: chartData.reduce((acc, curr) => acc + curr.barangin, 0),
            totalharga_out: chartData.reduce(
                (acc, curr) => acc + (curr.totalharga_out || 0),
                0
            ),
            totalharga_in: chartData.reduce(
                (acc, curr) => acc + (curr.totalharga_in || 0),
                0
            ),
        }),
        []
    )

    function formatNumber(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }




    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard POS" />
            <div className="flex flex-col gap-4 p-4">
                {/* Statistik Ringkas */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {summaryStats.map(({ label, icon: Icon }) => (
                        <div key={label} className="relative border border-border rounded-xl pl-6 pr-4 py-4 bg-muted overflow-hidden">
                            {/* Icon transparan di kiri */}
                            <Icon className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 text-muted-foreground opacity-10 pointer-events-none" />


                            <div className="text-center">
                                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                                <p className="text-xl font-bold text-foreground">0</p>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Grafik Penjualan Harian */}
                <Card className="py-0">
                    <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                            <CardTitle>Grafik Penjualan Harian</CardTitle>
                            <CardDescription>
                                Data interaktif penjualan dan pembelian berdasarkan tanggal
                            </CardDescription>
                        </div>
                        <div className="flex">
                            {["barangout", "barangin", "totalharga_out", "totalharga_in"].map((key) => {
                                const chart = key as keyof typeof chartConfig;
                                const value = total[key] ?? 0;

                                const formattedValue = key.startsWith("totalharga")
                                    ? "Rp" + formatNumber(value)
                                    : value.toString();

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
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-auto h-[250px] w-full"
                        >
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
                                        const date = new Date(value)
                                        return date.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                />
                                <ChartTooltip
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload || !payload.length) return null;

                                        const data = payload[0].payload;

                                        return (
                                            <div className="rounded-md border bg-background p-2 shadow-sm text-sm space-y-1">
                                                <div className="font-medium">
                                                    {new Date(label).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                                <div>
                                                    {chartConfig[activeChart].label}:{" "}
                                                    <b>
                                                        {activeChart.startsWith("totalharga")
                                                            ? "Rp" + formatNumber(data[activeChart])
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Grafik Penjualan Perbulan - lebih lebar */}
                    <Card className="md:col-span-2 py-0">
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between border-b py-4 px-6">
                            <div>
                                <CardTitle>Grafik Penjualan Per Bulan</CardTitle>
                                <CardDescription>
                                    Total penjualan berdasarkan Tahun
                                </CardDescription>
                            </div>
                            <div>
                                <select
                                    className="rounded-md border border-border bg-background px-3 py-1 text-sm"
                                    defaultValue="2024"
                                >
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
                                    <option value="2022">2022</option>
                                    <option value="2021">2021</option>
                                </select>
                            </div>
                        </CardHeader>

                        <CardContent className="px-2 sm:p-6">
                            <ChartContainer
                                config={chartConfigMonthly}
                                className="aspect-auto h-[250px] w-full"
                            >
                                <BarChart
                                    data={chartDataMonthly}
                                    margin={{ left: 12, right: 12 }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="bulan"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload || !payload.length) return null;
                                            const data = payload[0].payload;

                                            return (
                                                <div className="rounded-md border bg-background p-2 shadow-sm text-sm space-y-1">
                                                    <div className="font-medium">
                                                        Bulan: {label}
                                                    </div>
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
                        </CardContent>
                    </Card>


                    {/* Statistik meja yang sedang aktif */}
                    <div className="border border-border rounded-xl p-4 relative min-h-[220px] flex flex-col">
                        <h2 className="text-base font-semibold mb-4">Status Meja Saat Ini</h2>

                        <div className="overflow-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-2 px-3 font-semibold">No Meja</th>
                                        <th className="py-2 px-3 font-semibold">Kapasitas</th>
                                        <th className="py-2 px-3 font-semibold">Customer</th>
                                        <th className="py-2 px-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { no: 1, name: "Meja 1", status: "Tersedia", customers: 4, customerName: "Budi" },
                                        { no: 2, name: "Meja 2", status: "Tidak Tersedia", customers: 0, customerName: "-" },
                                        { no: 3, name: "Meja 5", status: "Dibooking", customers: 2, customerName: "Siti" },
                                        { no: 4, name: "Meja VIP", status: "Tersedia", customers: 6, customerName: "Andi" },
                                    ].map(({ no, name, status, customers, customerName }) => (
                                        <tr key={no} className="border-b border-border last:border-none">
                                            <td className="py-2 px-3">{name}</td>
                                            <td className="py-2 px-3">{customers}</td>
                                            <td className="py-2 px-3">{customerName}</td>
                                            <td className="py-2 px-3">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${status === "Tersedia"
                                                        ? "bg-green-100 text-green-800"
                                                        : status === "Dibooking"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {status}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 10 Barang dengan Stok Terendah */}
                    <div className="border border-border rounded-xl p-4 relative min-h-[220px] flex flex-col">
                        <h2 className="text-base font-semibold mb-4">10 Barang dengan Stok Terendah</h2>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-2 px-3 font-semibold">No.</th>
                                        <th className="py-2 px-3 font-semibold">Nama Barang</th>
                                        <th className="py-2 px-3 font-semibold">Stok</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[ // contoh data stok terendah
                                        { no: 1, name: "Gula Pasir", stok: 5 },
                                        { no: 2, name: "Kopi Bubuk", stok: 7 },
                                        { no: 3, name: "Teh Celup", stok: 8 },
                                        { no: 4, name: "Susu UHT", stok: 10 },
                                        { no: 5, name: "Roti Tawar", stok: 12 },
                                        { no: 6, name: "Minyak Goreng", stok: 15 },
                                        { no: 7, name: "Telur Ayam", stok: 18 },
                                        { no: 8, name: "Daging Ayam", stok: 20 },
                                        { no: 9, name: "Sayur Bayam", stok: 22 },
                                        { no: 10, name: "Keju", stok: 25 },
                                    ].map(({ no, name, stok }) => (
                                        <tr key={no} className="border-b border-border last:border-none">
                                            <td className="py-2 px-3">{no}</td>
                                            <td className="py-2 px-3">{name}</td>
                                            <td className="py-2 px-3">{stok}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Produk Terlaris */}
                    <div className="border border-border rounded-xl p-4 relative min-h-[220px] flex flex-col">
                        <h2 className="text-base font-semibold mb-4">Produk Terlaris</h2>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-2 px-3 font-semibold">No.</th>
                                        <th className="py-2 px-3 font-semibold">Nama Produk</th>
                                        <th className="py-2 px-3 font-semibold">Jumlah Terjual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[ // contoh data produk terlaris
                                        { no: 1, name: "Nasi Goreng", sold: 120 },
                                        { no: 2, name: "Es Teh Manis", sold: 95 },
                                        { no: 3, name: "Ayam Bakar", sold: 80 },
                                        { no: 4, name: "Kopi Hitam", sold: 75 },
                                        { no: 5, name: "Mie Goreng", sold: 60 },
                                    ].map(({ no, name, sold }) => (
                                        <tr key={no} className="border-b border-border last:border-none">
                                            <td className="py-2 px-3">{no}</td>
                                            <td className="py-2 px-3">{name}</td>
                                            <td className="py-2 px-3">{sold}</td>
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
                            <ChartContainer
                                config={chartConfigKategori}
                                className="mx-auto aspect-square max-h-[250px]"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={chartDataKategori}
                                        dataKey="sold"
                                        nameKey="category"
                                        fill="#8884d8"
                                        outerRadius={100}
                                        label
                                    />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2 leading-none font-medium">
                                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="text-muted-foreground leading-none">
                                Data penjualan kategori bulan ini
                            </div>
                        </CardFooter>
                    </Card>
                </div>


                {/* Grafik Performa Bisnis */}
               <div className="border border-border rounded-xl p-4 relative min-h-[300px] flex flex-col gap-4">
  {/* Header: Judul dan Tabs sejajar */}
  <div className="flex items-center justify-between">
    <h2 className="text-base font-semibold">Transaksi Belum Lunas</h2>
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="penjualan">Penjualan</TabsTrigger>
        <TabsTrigger value="pembelian">Pembelian</TabsTrigger>
        <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>

  {/* Konten Tab */}
  <div>
    <Tabs value={tab} onValueChange={setTab}>
      {/* Penjualan */}
      <TabsContent value="penjualan">
        {dummyPenjualan.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-2 px-3 font-semibold">Tanggal</th>
                  <th className="py-2 px-3 font-semibold">ID</th>
                  <th className="py-2 px-3 font-semibold">Customer</th>
                  <th className="py-2 px-3 font-semibold text-right">Total</th>
                  <th className="py-2 px-3 font-semibold text-right">Sisa</th>
                </tr>
              </thead>
              <tbody>
                {dummyPenjualan.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-none">
                    <td className="py-2 px-3">{item.tanggal}</td>
                    <td className="py-2 px-3">{item.id}</td>
                    <td className="py-2 px-3">{item.customer}</td>
                    <td className="py-2 px-3 text-right">Rp {item.total.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">
                      <Badge variant="destructive">Rp {item.sisa.toLocaleString()}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Semua penjualan telah lunas.</p>
        )}
      </TabsContent>

      {/* Pembelian */}
      <TabsContent value="pembelian">
        {dummyPembelian.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-2 px-3 font-semibold">Tanggal</th>
                  <th className="py-2 px-3 font-semibold">ID</th>
                  <th className="py-2 px-3 font-semibold">Supplier</th>
                  <th className="py-2 px-3 font-semibold text-right">Total</th>
                  <th className="py-2 px-3 font-semibold text-right">Sisa</th>
                </tr>
              </thead>
              <tbody>
                {dummyPembelian.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-none">
                    <td className="py-2 px-3">{item.tanggal}</td>
                    <td className="py-2 px-3">{item.id}</td>
                    <td className="py-2 px-3">{item.supplier}</td>
                    <td className="py-2 px-3 text-right">Rp {item.total.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">
                      <Badge variant="destructive">Rp {item.sisa.toLocaleString()}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Semua pembelian telah lunas.</p>
        )}
      </TabsContent>

      {/* Pengeluaran */}
      <TabsContent value="pengeluaran">
        {dummyPengeluaran.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-2 px-3 font-semibold">Tanggal</th>
                  <th className="py-2 px-3 font-semibold">ID</th>
                  <th className="py-2 px-3 font-semibold">Kategori</th>
                  <th className="py-2 px-3 font-semibold text-right">Total</th>
                  <th className="py-2 px-3 font-semibold text-right">Sisa</th>
                </tr>
              </thead>
              <tbody>
                {dummyPengeluaran.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-none">
                    <td className="py-2 px-3">{item.tanggal}</td>
                    <td className="py-2 px-3">{item.id}</td>
                    <td className="py-2 px-3">{item.keterangan}</td>
                    <td className="py-2 px-3 text-right">Rp {item.total.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">
                      <Badge variant="destructive">Rp {item.sisa.toLocaleString()}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Semua pengeluaran telah lunas.</p>
        )}
      </TabsContent>
    </Tabs>
  </div>
</div>




            </div>
        </AppLayout>
    );
}
