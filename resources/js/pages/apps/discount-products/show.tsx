/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import {
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Head, usePage } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscountProduct } from '@/types/discount-product';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Percent, Wallet, Users,Boxes, Tag } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Diskon Produk', href: route('apps.discount-packages.index') },
  { title: 'Detail Diskon Produk', href: '#' }
];

interface ShowProps {
    discountProduct: DiscountProduct;
    [key: string]: unknown;
}

function formatCurrencyIDR(value: number | string | null | undefined) {
    const n = Number(value ?? 0) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl border bg-card shadow-sm">
            <div className="rounded-xl p-2 bg-muted/60">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold leading-tight">{value}</p>
            </div>
        </div>
    );
}

function Pill({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'success' | 'danger' }) {
    const tones: Record<string, string> = {
        default: 'bg-muted text-foreground/90',
        success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>
            {children}
        </span>
    );
}

export default function Show() {
    const { discountProduct } = usePage<ShowProps>().props;

    const isNominal = discountProduct.discount_type === 'nominal';
    const showAllProducts = Boolean(discountProduct.all_products);
    const showAllCustomers = Boolean(discountProduct.all_customers);

    const discountValue = isNominal
        ? formatCurrencyIDR(discountProduct.discount_value)
        : `${Number(discountProduct.discount_value ?? 0)}%`;

    const productCount = showAllProducts ? 'Semua produk' : `${discountProduct.discount_product_items?.length ?? 0} produk`;
    const customerCount = showAllCustomers ? 'Semua pelanggan' : `${discountProduct.discount_product_customers?.length ?? 0} pelanggan`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
        <Head title='Detail Diskon Produk' />

        <div className="p-6">
            <Card className="overflow-hidden">
                <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                {discountProduct.discount_name}
                            </CardTitle>
                            <CardDescription>
                                Diskon {isNominal ? 'Nominal' : 'Persentase'} • Minimal beli {Number(discountProduct.discount_quantity ?? 0)}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {discountProduct.is_active ? (
                                <Pill tone="success"><CheckCircle2 className="h-4 w-4"/> Aktif</Pill>
                            ) : (
                                <Pill tone="danger"><XCircle className="h-4 w-4"/> Nonaktif</Pill>
                            )}
                                <Pill>{isNominal ? 'Nominal' : 'Persentase'}</Pill>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Stats */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Stat icon={Wallet} label="Jumlah Diskon" value={discountValue} />
                        <Stat icon={Percent} label="Minimal Pembelian" value={Number(discountProduct.discount_quantity ?? 0)} />
                        <Stat icon={Boxes} label="Cakupan Produk" value={productCount} />
                        <Stat icon={Users} label="Cakupan Pelanggan" value={customerCount} />
                    </div>

                    <Separator />

                    {!showAllProducts && (
                    <Card className="border-none shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Daftar Produk</CardTitle>
                            <CardDescription>Produk yang termasuk dalam diskon ini.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(discountProduct.discount_product_items?.length ?? 0) > 0 ? (
                                <TableCard>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/60">
                                                <TableHead className="w-[56px] text-center">No</TableHead>
                                                <TableHead>Nama Produk</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {discountProduct.discount_product_items.map((item: any, index: number) => (
                                                <TableRow key={index} className="hover:bg-muted/20">
                                                    <TableCell className="text-center">{index + 1}</TableCell>
                                                    <TableCell className="font-medium">{String(item.name)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableCard>
                            ) : (
                                <div className="text-sm text-muted-foreground">Belum ada produk yang dipilih.</div>
                            )}
                        </CardContent>
                    </Card>
                    )}

                    {!showAllCustomers && (
                    <Card className="border-none shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Daftar Pelanggan</CardTitle>
                            <CardDescription>Pelanggan yang mendapatkan diskon ini.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(discountProduct.discount_product_customers?.length ?? 0) > 0 ? (
                                <TableCard>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/60">
                                                <TableHead className="w-[56px] text-center">No</TableHead>
                                                <TableHead>Nomor HP</TableHead>
                                                <TableHead>Nama Pelanggan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {discountProduct.discount_product_customers.map((item: any, index: number) => (
                                                <TableRow key={index} className="hover:bg-muted/20">
                                                    <TableCell className="text-center">{index + 1}</TableCell>
                                                    <TableCell className="font-medium">{String(item.customer.phone)}</TableCell>
                                                    <TableCell>{String(item.customer.name)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableCard>
                            ) : (
                                <div className="text-sm text-muted-foreground">Belum ada pelanggan yang dipilih.</div>
                            )}
                        </CardContent>
                    </Card>
                    )}

                    {showAllProducts || showAllCustomers &&
                        <Separator />
                    }
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 rounded-2xl border bg-muted/30">
                            <p className="text-sm text-muted-foreground">Berlaku untuk semua produk</p>
                            <div className="mt-1">{showAllProducts ? <Pill tone="success">Ya</Pill> : <Pill tone="danger">Tidak</Pill>}</div>
                        </div>
                        <div className="p-4 rounded-2xl border bg-muted/30">
                            <p className="text-sm text-muted-foreground">Berlaku untuk semua pelanggan</p>
                            <div className="mt-1">{showAllCustomers ? <Pill tone="success">Ya</Pill> : <Pill tone="danger">Tidak</Pill>}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        </AppLayout>
    );
}
