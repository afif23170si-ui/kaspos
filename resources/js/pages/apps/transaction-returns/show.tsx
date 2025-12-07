/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableCard } from '@/components/ui/table'
import { Phone, Mail, Calendar, Tag, Building, ShoppingBag, ReceiptText, RefreshCcw, DownloadIcon, User } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ProductVariantValue } from '@/types/product-variant-value';
import { Button } from '@/components/ui/button';
import { TransactionReturn } from '@/types/transaction-return';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Retur Penjualan',
        href: route('apps.transaction-returns.index'),
    },
    {
        title: 'Detail Retur Penjualan',
        href: '#',
    },
];

interface ShowProps {
    transactionReturn: TransactionReturn;
    [key: string]: unknown;
}

export default function Show() {

    const { transactionReturn } = usePage<ShowProps>().props;

    const refundMethod = (status: string): string => {
        switch (status) {
            case 'refund':
                return 'Pengembalian Dana';
            case 'replacement':
                return 'Pergantian Barang';
            default:
                return 'Status Tidak Dikenal';
        }
    };

    const productName = (type: string, detail: any) => {
        switch (type) {
            case 'App\\Models\\ProductVariant':
                return detail.items.product.has_variant
                    ? `${detail.items.product.name} [${detail.items.product_variant_values
                        .map((variant: ProductVariantValue) =>
                        `${variant.variant_value.variant_option.name}: ${variant.variant_value.name}`
                        )
                        .join(', ')}]`
                    : detail.items.product.name;

            case 'App\\Models\\DiscountPackage':
                return detail.items.name;
            case 'App\\Models\\Menu':
                return detail.items.name;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Detail Retur Penjualan'/>
            <div className='p-6'>
                <Card className="shadow-lg">
                    <CardContent className="p-8">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight">Inovice Retur Penjualan</h2>
                                <p className="text-sm text-muted-foreground">
                                    Detail Transaksi Retur Penjualan
                                </p>
                            </div>
                            <div className="text-end">
                                <div className="bg-primary/5 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground">Nomor Retur Penjualan</p>
                                    <p className="text-2xl font-bold tracking-tight text-primary">
                                        {transactionReturn.return_code}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button asChild variant="default">
                            <a href={route('apps.transaction-returns.invoices', transactionReturn.id)}>
                                <DownloadIcon/> Download Invoice
                            </a>
                        </Button>
                        <Separator className="my-8" />
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Informasi Customer</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Nama Customer</p>
                                            <p className="text-sm text-muted-foreground">{transactionReturn.transaction?.customer?.name ?? 'Umum'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Email Customer</p>
                                            <p className="text-sm text-muted-foreground">{transactionReturn.transaction?.customer?.email ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Telp Customer</p>
                                            <p className="text-sm text-muted-foreground">{transactionReturn.transaction?.customer?.phone ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Alamat Customer</p>
                                            <p className="text-sm text-muted-foreground">{transactionReturn.transaction?.customer?.address ?? '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Detail Retur Penjualan</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Tanggal Retur</p>
                                            <p className="text-sm text-muted-foreground">{transactionReturn.return_date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Nomor Faktur Penjualan</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                               {transactionReturn.transaction.invoice}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RefreshCcw className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Status Retur Penjualan</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {transactionReturn.status == 'pending' ? 'Diajukan' : 'Diterima'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ReceiptText className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Jenus Retur</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {refundMethod(transactionReturn.refund_method)}

                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Total Retur</p>
                                            <sup>Rp</sup> {transactionReturn.grand_total}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Separator className="my-8" />
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Catatan</h3>
                                <div className='pl-4'>{transactionReturn.notes}</div>
                            </div>
                        </div>
                        <Separator className="my-8" />
                        <div className='py-4'>
                            <TableCard>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 divide-muted/50">
                                            <TableHead className="w-[50px] text-center">No</TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-start">Alasan Retur</TableHead>
                                            <TableHead className="text-center">Kuantitas</TableHead>
                                            <TableHead className="text-start">Harga</TableHead>
                                            <TableHead className="text-start">Total Harga</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactionReturn.details.map((detail, index) => (
                                            <TableRow key={index} className='hover:bg-transparent'>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell>
                                                   {productName(detail.transaction_detail.items_type as string, detail.transaction_detail)}
                                                </TableCell>
                                                <TableCell>
                                                    {detail.reason}
                                                </TableCell>
                                                <TableCell className="text-center">{detail.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    <sup>Rp</sup> {String(detail.transaction_detail.price)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <sup>Rp</sup> {String(detail.total_price)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className='bg-muted/50 divide-muted/50'>
                                            <TableCell colSpan={5} className="text-right font-bold">Grand Total</TableCell>
                                            <TableCell className="text-right font-bold">
                                                <sup>Rp</sup> {transactionReturn.grand_total}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableCard>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
