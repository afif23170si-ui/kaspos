/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableCard } from '@/components/ui/table'
import { Phone, Mail, Calendar, Tag, NotebookPen, Truck, Building, ShoppingBag, ReceiptText, RefreshCcw, DownloadIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ProductVariantValue } from '@/types/product-variant-value';
import { Button } from '@/components/ui/button';
import { PurchaseReturn } from '@/types/purchase-return';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Retur Pembelian',
        href: route('apps.orders.index'),
    },
    {
        title: 'Detail Retur Pembelian',
        href: '#',
    },
];

interface ShowProps {
    purchaseReturn: PurchaseReturn;
    [key: string]: unknown;
}

export default function Show() {

    const { purchaseReturn } = usePage<ShowProps>().props;

    const refundMethod = (status: string): string => {
        switch (status) {
            case 'debt_reduction':
                return 'Pengurangan Hutang';
            case 'refund':
                return 'Pengembalian Dana';
            case 'replacement':
                return 'Pergantian Barang';
            default:
                return 'Status Tidak Dikenal';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Detail Pembelian'/>
            <div className='p-6'>
                <Card className="shadow-lg">
                    <CardContent className="p-8">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight">Inovice Retur Pembelian</h2>
                                <p className="text-sm text-muted-foreground">
                                    Detail Transaksi Retur Pembelian
                                </p>
                            </div>
                            <div className="text-end">
                                <div className="bg-primary/5 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground">Nomor Retur Pembelian</p>
                                    <p className="text-2xl font-bold tracking-tight text-primary">
                                        {purchaseReturn.return_code}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button asChild variant="default">
                            <a href={route('apps.purchase-returns.invoices', purchaseReturn.id)}>
                                <DownloadIcon/> Download Invoice
                            </a>
                        </Button>
                        <Separator className="my-8" />
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Informasi Supplier</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <NotebookPen className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Kode Supplier</p>
                                            <p className="text-sm text-muted-foreground">{purchaseReturn.order.supplier.code ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Nama Supplier</p>
                                            <p className="text-sm text-muted-foreground">{purchaseReturn.order.supplier.name ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Email Supplier</p>
                                            <p className="text-sm text-muted-foreground">{purchaseReturn.order.supplier.email ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Telp Supplier</p>
                                            <p className="text-sm text-muted-foreground">{purchaseReturn.order.supplier.phone ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Alamat Supplier</p>
                                            <p className="text-sm text-muted-foreground">{purchaseReturn.order.supplier.address ?? '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Detail Retur Pembelian</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Tanggal Retur</p>
                                            <p className="text-sm text-muted-foreground">{purchaseReturn.return_date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Nomor Faktur Pembelian</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                               {purchaseReturn.order.order_code}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RefreshCcw className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Status Retur Pembelian</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {purchaseReturn.status == 'pending' ? 'Diajukan' : 'Diterima'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ReceiptText className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Jenus Retur</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {refundMethod(purchaseReturn.refund_method)}

                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Total Retur</p>
                                            <sup>Rp</sup> {purchaseReturn.grand_total}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Separator className="my-8" />
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Catatan</h3>
                                <div className='pl-4'>{purchaseReturn.notes}</div>
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
                                            <TableHead>Alasan Retur</TableHead>
                                            {purchaseReturn.refund_method == 'replacement' &&
                                                <TableHead className='text-center'>Tanggal Expired</TableHead>
                                            }
                                            <TableHead className="text-center">Kuantitas</TableHead>
                                            <TableHead className="text-start">Harga</TableHead>
                                            <TableHead className="text-start">Satuan</TableHead>
                                            <TableHead className="text-start">Total Harga</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchaseReturn.details.map((detail, index) => (
                                            <TableRow key={index} className='hover:bg-transparent'>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        if (detail.order_detail.order.type === 'products') {
                                                            const product = (detail.order_detail.items as { product: { name: string; has_variant: number } }).product;

                                                            if (product.has_variant === 1) {
                                                                const variantList = (detail.order_detail.items as { product_variant_values: ProductVariantValue[] }).product_variant_values
                                                                .map((variant: ProductVariantValue) =>
                                                                    `${variant.variant_value.variant_option.name}:${variant.variant_value.name}`
                                                                ).join(', ');

                                                                return `${product.name} [${variantList}]`;
                                                            } else {
                                                                return product.name;
                                                            }
                                                        } else {
                                                            return (detail.order_detail.items as { name: string }).name;
                                                        }
                                                    })()}
                                                </TableCell>
                                                <TableCell className="text-center">{detail.reason}</TableCell>
                                                {purchaseReturn.refund_method == 'replacement' &&
                                                    <TableCell className='text-center'>{detail.expired_at}</TableCell>
                                                }
                                                <TableCell className="text-center">{detail.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    <sup>Rp</sup> {detail.order_detail.price}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {(detail.order_detail.items as { unit: { name: string } }).unit.name}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <sup>Rp</sup> {detail.total_price}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className='bg-muted/50 divide-muted/50'>
                                            <TableCell colSpan={purchaseReturn.refund_method == 'replacement' ? 7 : 6} className="text-right font-bold">Grand Total</TableCell>
                                            <TableCell className="text-right font-bold">
                                                <sup>Rp</sup> {purchaseReturn.grand_total}
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
