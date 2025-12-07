/* eslint-disable react-hooks/rules-of-hooks */
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableCard } from '@/components/ui/table'
import { CheckingStock } from '@/types/checking-stock';
import { ProductVariantValue } from '@/types/product-variant-value';
import { Calendar, CheckCircle, FileText, User, Warehouse } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stok Opname',
        href: route('apps.checking-stocks.index'),
    },
    {
        title: 'Detail Stok Opname',
        href: '#',
    },
];

interface ShowProps {
    checkingStock: CheckingStock;
    [key: string]: unknown;
}

export default function show() {

    const { checkingStock } = usePage<ShowProps>().props;

    const status = (status: string): string => {
        switch (status) {
            case 'draft':
                return 'Draft';
            case 'cancel':
                return 'Batal';
            case 'done':
                return 'Selesai';
            default:
                return 'Status Tidak Dikenal';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Detail Stok Opname'/>
            <div className='p-6'>
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gray-50 dark:bg-black/40 backdrop-blur-sm rounded-xl p-6 mb-6 border dark:border-white/10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                            <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Warehouse className="w-6 h-6 text-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold dark:text-white">Stok Opname</h1>
                                <p className="dark:text-gray-300 text-gray-500">Detail Stok Opname</p>
                            </div>
                            </div>
                            <div className="text-right">
                            <p className="text-sm text-gray-400">Nomor Referensi</p>
                            <p className="text-xl font-bold dark:text-white">{checkingStock.no_ref}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-white/5 rounded-lg p-4 border dark:border-white/10">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm text-gray-400">Tanggal Stok Opname</span>
                                </div>
                                <p className="text-lg font-semibold dark:text-white">{checkingStock.due_date}</p>
                            </div>
                            <div className="bg-white dark:bg-white/5 rounded-lg p-4 border dark:border-white/10">
                                <div className="flex items-center space-x-3 mb-2">
                                    <FileText className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm text-gray-400">Jenis Stok Opname</span>
                                </div>
                                <p className="text-lg font-semibold dark:text-white">{checkingStock.type == 'products' ? 'Produk' : 'Bahan Baku'}</p>
                            </div>
                            <div className="bg-white dark:bg-white/5 rounded-lg p-4 border dark:border-white/10">
                                <div className="flex items-center space-x-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    <span className="text-sm text-gray-400">Status Stok Opname</span>
                                </div>
                                <p className="text-lg font-semibold dark:text-white">{status(checkingStock.status)}</p>
                            </div>
                            <div className="bg-white dark:bg-white/5 rounded-lg p-4 border dark:border-white/10">
                                <div className="flex items-center space-x-3 mb-2">
                                    <User className="w-5 h-5 text-amber-400" />
                                    <span className="text-sm text-gray-400">Petugas</span>
                                </div>
                                <p className="text-lg font-semibold dark:text-white">{checkingStock.user.name}</p>
                            </div>
                        </div>
                        <TableCard className='my-8'>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 divide-muted/50">
                                        <TableHead className="w-[50px] text-center">No</TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead className='text-center'>Satuan</TableHead>
                                        <TableHead className="text-start">Harga Modal</TableHead>
                                        <TableHead className="text-center">Stok Sistem</TableHead>
                                        <TableHead className="text-center">Stok Fisik</TableHead>
                                        <TableHead className="text-start">Catatan</TableHead>
                                        <TableHead className="text-center">Selisih</TableHead>
                                        <TableHead className="text-start">Nilai Selisih</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {checkingStock.details.map((detail, index) => (
                                        <TableRow key={index} className='hover:bg-transparent'>
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell>
                                                {(() => {
                                                    if (detail.checking_stock.type === 'products') {
                                                        const product = detail.items.product as { name: string; has_variant: number };

                                                        if (product.has_variant === 1) {
                                                            const variantList = ((detail.items as unknown) as { product_variant_values: ProductVariantValue[] }).product_variant_values
                                                            .map((variant: ProductVariantValue) =>
                                                                `${variant.variant_value.variant_option.name}:${variant.variant_value.name}`
                                                            ).join(', ');

                                                            return `${product.name} [${variantList}]`;
                                                        } else {
                                                            return product.name;
                                                        }
                                                    } else {
                                                        return (detail.items as { name: string }).name;
                                                    }
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(detail.items as { unit: { name: string } }).unit.name}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <sup>Rp</sup> {detail.price}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {detail.stock}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {detail.quantity}
                                            </TableCell>
                                            <TableCell>
                                                {detail.note ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {detail.diffrence}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <sup>Rp</sup> {detail.diffrence_price}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell className='text-right font-bold' colSpan={7}>
                                            Total
                                        </TableCell>
                                        <TableCell className='text-center font-bold'>
                                            {checkingStock.diffrence}
                                        </TableCell>
                                        <TableCell className='text-end font-bold'>
                                            <sup>Rp</sup> {checkingStock.diffrence_price}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableCard>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Ringkasan Audit</h3>
                                <Table>
                                    <TableBody>
                                        <TableRow className='divide-x-0 border-b-0 hover:bg-transparent'>
                                            <TableCell className="px-6 w-10 font-bold dark:text-gray-300">Total Item dicek</TableCell>
                                            <TableCell className="px-6">{checkingStock.summary.total_checked}</TableCell>
                                        </TableRow>
                                        <TableRow className='divide-x-0 divide-y-0 border-b-0 hover:bg-transparent'>
                                            <TableCell className="px-6 w-10 font-bold dark:text-gray-300">Item Dengan Selisih</TableCell>
                                            <TableCell className="px-6">{checkingStock.summary.item_with_difference}</TableCell>
                                        </TableRow>
                                        <TableRow className='divide-x-0 divide-y-0 border-b-0 hover:bg-transparent'>
                                            <TableCell className="px-6 w-10 font-bold dark:text-gray-300">Potensi Rugi</TableCell>
                                            <TableCell className="px-6">
                                                <sup>Rp</sup> {checkingStock.summary.potential_loss}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className='divide-x-0 divide-y-0 border-b-0 hover:bg-transparent'>
                                            <TableCell className="px-6 w-10 font-bold dark:text-gray-300">Potensi Lebih</TableCell>
                                            <TableCell className="px-6">
                                                <sup>Rp</sup> {checkingStock.summary.potential_gain}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className='divide-x-0 divide-y-0 border-b-0 hover:bg-transparent'>
                                            <TableCell className="px-6 w-10 font-bold dark:text-gray-300">Nilai Total Selisih</TableCell>
                                            <TableCell className="px-6">
                                                <sup>Rp</sup> {checkingStock.diffrence_price}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                            <div>
                                <Label>Catatan</Label>
                                <Textarea className='bg-secondary cursor-not-allowed' readOnly rows={10} value={checkingStock.note}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
