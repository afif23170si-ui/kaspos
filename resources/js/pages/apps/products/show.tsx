import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Head, usePage } from "@inertiajs/react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Product } from '@/types/product';
import { VariantOption } from '@/types/variant-option';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk',
        href: route('apps.products.index'),
    },
    {
        title: 'Detail Produk',
        href: '#',
    }
];

interface ShowProps {
    product: Product;
    variantOptions: VariantOption[]
    [key: string]: unknown;
}

export default function Show() {

    const { product, variantOptions } = usePage<ShowProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Detail Produk'/>
            <div className='p-6'>
                <Tabs defaultValue="product">
                    <TabsList>
                        <TabsTrigger value="product">Detail Produk</TabsTrigger>
                        <TabsTrigger value="variant">Varian Produk</TabsTrigger>
                    </TabsList>
                    <TabsContent value="product">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Produk</CardTitle>
                                <CardDescription>
                                    Tabel ini digunakan untuk menampilkan detail data produk
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="px-6 w-10 font-bold dark:text-white">Gambar Produk</TableCell>
                                            <TableCell className="px-6">
                                                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="px-6 w-10 font-bold dark:text-white">SKU</TableCell>
                                            <TableCell className="px-6">{product.sku}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="px-6 w-10 font-bold dark:text-white">Nama Produk</TableCell>
                                            <TableCell className="px-6">{product.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="px-6 w-10 font-bold dark:text-white">Kategori</TableCell>
                                            <TableCell className="px-6">{product.category.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="px-6 w-10 font-bold dark:text-white">Deskripsi</TableCell>
                                            <TableCell className="px-6 whitespace-normal">{product.description}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="variant" className="w-full">
                        <Card>
                            <CardHeader>
                                <CardTitle>Varian Produk</CardTitle>
                                <CardDescription>
                                    Tabel ini digunakan untuk menampilkan variant data produk
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-6 font-bold dark:text-white">Barcode</TableHead>
                                            {variantOptions.map((option, i) => (
                                                <TableHead className="px-6 font-bold dark:text-white" key={i}>
                                                    {option.name}
                                                </TableHead>
                                            ))}
                                            {product.has_stock == true &&
                                                <TableHead className='px-6 font-bold dark:text-white'>Stok Awal</TableHead>
                                            }
                                            <TableHead className='px-6 font-bold dark:text-white'>Satuan</TableHead>
                                            <TableHead className="px-6 font-bold dark:text-white">Harga Jual</TableHead>
                                            <TableHead className="px-6 font-bold dark:text-white">Harga Beli</TableHead>
                                            <TableHead className="px-6 font-bold dark:text-white">Kuantitas Minimum</TableHead>
                                            {product.has_stock == true &&
                                                <TableHead className="px-6 font-bold dark:text-white">Expired</TableHead>
                                            }
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {product.variants.map((variant, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="px-6">{variant.barcode}</TableCell>
                                                {variant.product_variant_values.map((variantValue, x) => (
                                                    <TableCell className='px-6' key={x}>{variantValue.variant_value.name}</TableCell>
                                                ))}
                                                {product.has_stock == true &&
                                                    <TableCell className="px-6">
                                                        {variant.initial_stock.quantity}
                                                    </TableCell>
                                                }
                                                <TableCell className="px-6">{variant.unit.name}</TableCell>
                                                <TableCell className="px-6">
                                                    <sup>Rp</sup> {variant.price}
                                                </TableCell>
                                                <TableCell className="px-6">
                                                    <sup>Rp</sup> {variant.capital_price}
                                                </TableCell>
                                                <TableCell className="px-6">
                                                    {variant.minimum_quantity}
                                                </TableCell>
                                                {product.has_stock == true &&
                                                    <TableCell className="px-6">
                                                        {variant.initial_stock.expired_at}
                                                    </TableCell>
                                                }
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
