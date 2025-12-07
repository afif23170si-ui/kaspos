/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Order } from '@/types/order';
import { Head, usePage } from '@inertiajs/react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableCard } from '@/components/ui/table'
import { Phone, Mail, Calendar, Tag, NotebookPen, Truck, Building, ShoppingBag, ReceiptText, RefreshCcw, DownloadIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ProductVariantValue } from '@/types/product-variant-value';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pembelian',
        href: route('apps.orders.index'),
    },
    {
        title: 'Detail Pembelian',
        href: '#',
    },
];

interface ShowProps {
    order: Order;
    [key: string]: unknown;
}

export default function Show() {

    const { order } = usePage<ShowProps>().props;

    const statusPayment = (status: string): string => {
        switch (status) {
            case 'paid':
                return 'Lunas';
            case 'partial':
                return 'Belum Lunas';
            case 'unpaid':
                return 'Belum Dibayar';
            default:
                return 'Status Tidak Dikenal';
        }
    };

    const statusOrder = (status: string): string => {
        switch (status) {
            case 'confirmed':
                return 'Dipesan';
            case 'received':
                return 'Diterima';
            case 'pending':
                return 'Tertunda';
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
                                <h2 className="text-2xl font-bold tracking-tight">Inovice Pembelian</h2>
                                <p className="text-sm text-muted-foreground">
                                    Detail Transaksi Pembelian
                                </p>
                            </div>
                            <div className="text-end">
                                <div className="bg-primary/5 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground">Nomor Faktur Pembelian</p>
                                    <p className="text-2xl font-bold tracking-tight text-primary">
                                        {order.order_code}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button asChild variant="default">
                            <a href={route('apps.orders.invoices', order.id)}>
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
                                            <p className="text-sm text-muted-foreground">{order.supplier.code ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Nama Supplier</p>
                                            <p className="text-sm text-muted-foreground">{order.supplier.name ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Email Supplier</p>
                                            <p className="text-sm text-muted-foreground">{order.supplier.email ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Telp Supplier</p>
                                            <p className="text-sm text-muted-foreground">{order.supplier.phone ?? '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium">Alamat Supplier</p>
                                            <p className="text-sm text-muted-foreground">{order.supplier.address ?? '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Detail Pembelian</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Tanggal Pembelian</p>
                                            <p className="text-sm text-muted-foreground">{order.order_date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Jenis Pembelian</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {order.type == 'products' ? 'Produk' : 'Bahan Baku'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RefreshCcw className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Status Pembelian</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {statusOrder(order.order_status)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ReceiptText className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Status Pembayaran</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {statusPayment(order.payment_status)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="size-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Total Pembayaran</p>
                                            <sup>Rp</sup> {order.grand_total}
                                        </div>
                                    </div>
                                </div>
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
                                            <TableHead className='text-center'>Tanggal Expired</TableHead>
                                            <TableHead className="text-center">Kuantitas</TableHead>
                                            <TableHead className="text-start">Harga</TableHead>
                                            <TableHead className="text-start">Satuan</TableHead>
                                            <TableHead className="text-start">Total Harga</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.order_details.map((order_detail, index) => (
                                            <TableRow key={index} className='hover:bg-transparent'>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        if (order.type === 'products') {
                                                            const product = (order_detail.items as { product: { name: string; has_variant: number } }).product;

                                                            if (product.has_variant === 1) {
                                                                const variantList = (order_detail.items as { product_variant_values: ProductVariantValue[] }).product_variant_values
                                                                .map((variant: ProductVariantValue) =>
                                                                    `${variant.variant_value.variant_option.name}:${variant.variant_value.name}`
                                                                ).join(', ');

                                                                return `${product.name} [${variantList}]`;
                                                            } else {
                                                                return product.name;
                                                            }
                                                        } else {
                                                            return (order_detail.items as { name: string }).name;
                                                        }
                                                    })()}
                                                </TableCell>
                                                <TableCell className='text-center'>{order_detail.expired_at}</TableCell>
                                                <TableCell className="text-center">{order_detail.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    <sup>Rp</sup> {order_detail.price}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {(order_detail.items as { unit: { name: string } }).unit.name}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <sup>Rp</sup> {order_detail.total_price}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className='bg-muted/50 divide-muted/50'>
                                            <TableCell colSpan={6} className="text-right font-bold">Subtotal</TableCell>
                                            <TableCell className="text-right font-bold">
                                                <sup>Rp</sup> {order.subtotal}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className='bg-muted/50 divide-muted/50'>
                                            <TableCell colSpan={6} className="text-right font-bold">Diskon</TableCell>
                                            <TableCell className="text-right font-bold">
                                                {order.discount_type == 'rupiah' && <sup>Rp</sup>} {order.discount} {order.discount_type == 'percentage' ? '%' : ''}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className='bg-muted/50 divide-muted/50'>
                                            <TableCell colSpan={6} className="text-right font-bold">Grand Total</TableCell>
                                            <TableCell className="text-right font-bold">
                                                <sup>Rp</sup> {order.grand_total}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableCard>
                        </div>
                        {order.purchase_return &&
                            <div className='py-4'>
                                <div className='p-4 bg-secondary border border-b-none rounded-t-lg'>
                                    Retur #{order.purchase_return.return_code}
                                </div>
                                <TableCard className='rounded-t-none'>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50 divide-muted/50">
                                                <TableHead className="w-[50px] text-center">No</TableHead>
                                                <TableHead>Item</TableHead>
                                                <TableHead className='text-center'>Alasan Retur</TableHead>
                                                <TableHead className="text-center">Kuantitas</TableHead>
                                                <TableHead className="text-start">Harga</TableHead>
                                                <TableHead className="text-start">Satuan</TableHead>
                                                <TableHead className="text-start">Total Harga</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.purchase_return.details.map((detail, index) => (
                                                <TableRow key={index} className='hover:bg-transparent'>
                                                    <TableCell className="text-center">{index + 1}</TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            if (order.type === 'products') {
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
                                                    <TableCell className='text-center'>{detail.reason}</TableCell>
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
                                                <TableCell colSpan={6} className="text-right font-bold">Grand Total</TableCell>
                                                <TableCell className="text-right font-bold">
                                                    <sup>Rp</sup> {order.purchase_return.grand_total}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableCard>
                            </div>
                        }
                        <div className='py-4'>
                            <div className='p-4 bg-secondary border border-b-none rounded-t-lg'>Metode Pembayaran</div>
                            <TableCard className='rounded-t-none'>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 divide-muted/50">
                                            <TableHead className="w-[50px] text-center">No</TableHead>
                                            <TableHead>Tanggal Pembayaran</TableHead>
                                            <TableHead>Metode Pembayaran</TableHead>
                                            <TableHead>Akun Bank</TableHead>
                                            <TableHead className="text-start w-[10px]">Jumlah Bayar</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.order_payments.map((order_payment, index) => (
                                            <TableRow key={index} className='hover:bg-transparent'>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell>{order_payment.paid_at}</TableCell>
                                                <TableCell className='capitalize'>{order_payment.payment_method}</TableCell>
                                                <TableCell>
                                                    {order_payment.bank_account ?
                                                        <>
                                                            {order_payment.bank_account?.bank_name} - {order_payment.bank_account?.account_name} [{order_payment.bank_account?.account_number}]
                                                        </>
                                                        :
                                                        '-'
                                                    }
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    <sup>Rp</sup> {order_payment.amount}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className='bg-muted/50 divide-muted/50'>
                                            <TableCell colSpan={4} className="text-right font-bold">Total Bayar</TableCell>
                                            <TableCell className="text-right font-bold">
                                                <sup>Rp</sup> {order.total_payment}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className='bg-muted/50 divide-muted/50'>
                                            <TableCell colSpan={4} className="text-right font-bold">Sisa Bayar</TableCell>
                                            <TableCell className='text-right font-bold'>
                                               <span> <sup>Rp</sup> {order.remaining_payment}</span>
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
