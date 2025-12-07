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
import { DiscountPackage } from '@/types/discount-package';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Diskon Paket',
        href: route('apps.discount-packages.index'),
    },
    {
        title: 'Detail Diskon Paket',
        href: '#',
    }
];

interface ShowProps {
    discountPackage: DiscountPackage;
    [key: string]: unknown;
}

export default function Show() {

    const { discountPackage } = usePage<ShowProps>().props;

    const mapType = (modelClass: string): 'menu' | 'product' | undefined => {
        if (modelClass === 'App\\Models\\Menu') return 'menu';
        if (modelClass === 'App\\Models\\ProductVariant') return 'product';
        return undefined;
    };

    const getVariantValues = (item: any): string => {
        if (!item?.items?.product_variant_values) return '';

        return item.items.product_variant_values
            .map((pv: any) => pv.variant_value?.name)
            .filter(Boolean)
            .join(' ');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Detail Diskon Paket'/>
            <div className='p-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>{discountPackage.name}</CardTitle>
                        <CardDescription>
                            <sup>Rp</sup> {discountPackage.total_price.toLocaleString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <TableCard>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 divide-muted/50">
                                    <TableHead className="w-[50px] text-center">No</TableHead>
                                    <TableHead>Nama Produk</TableHead>
                                    <TableHead className='text-center'>Harga Modal</TableHead>
                                    <TableHead className="text-center">Harga Jual</TableHead>
                                    <TableHead className="text-start">Harga Estimasi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discountPackage.discount_package_items.map((item, index) => (
                                    <TableRow key={index} className='hover:bg-transparent'>
                                        <TableCell className="text-center">{index + 1}</TableCell>
                                        <TableCell>{mapType(item.items_type) === 'menu' ? (item.items as any).name : `${(item.items as any).product.name} ${getVariantValues(item)}` }</TableCell>
                                        <TableCell className='text-right'><sup>Rp</sup> {(item.items as any).capital_price.toLocaleString()}</TableCell>
                                        <TableCell className='text-right'>
                                            <sup>Rp</sup> {mapType(item.items_type) === 'menu' ? (item.items as any).selling_price.toLocaleString() : (item.items as any).price.toLocaleString()}
                                        </TableCell>
                                        <TableCell className='text-right'><sup>Rp</sup> {item.estimate_price.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className='bg-muted/50 divide-muted/50'>
                                    <TableCell colSpan={4} className="text-right font-bold">Grand Total</TableCell>
                                    <TableCell className="text-right font-bold">
                                        <sup>Rp</sup> {discountPackage.total_price.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableCard>
                </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
