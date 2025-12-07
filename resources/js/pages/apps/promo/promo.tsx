import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard1',
    },
];



export default function PromoPage() {
    // Diskon Produk
    const [discountType, setDiscountType] = useState<'percent' | 'nominal'>('percent');

    // Diskon Paket
    const [produkPaket, setProdukPaket] = useState([
        { nama: 'Nasi', modal: 3000, jual: 5000, estimasi: 5000 },
        { nama: 'Ayam Goreng', modal: 8000, jual: 12000, estimasi: 12000 },
        { nama: 'Es Teh', modal: 2000, jual: 3000, estimasi: 3000 },
    ]);

    const updateEstimasiHarga = (index: number, value: number) => {
        const updated = [...produkPaket];
        updated[index].estimasi = value;
        setProdukPaket(updated);
    };

    const totalEstimasi = produkPaket.reduce((acc, item) => acc + item.estimasi, 0);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <div className="p-4 space-y-4">
                <h1 className="text-xl font-semibold">Manajemen Promo</h1>

                <Tabs defaultValue="produk">
                    <TabsList>
                        <TabsTrigger value="produk">Diskon Produk</TabsTrigger>
                        <TabsTrigger value="kupon">Diskon Kupon</TabsTrigger>
                        <TabsTrigger value="paket">Diskon Paket</TabsTrigger>
                        <TabsTrigger value="poin">Poin Pelanggan</TabsTrigger>
                    </TabsList>

                    {/* Diskon Produk */}
                    <TabsContent value="produk">
                        <Card>
                            <CardHeader>
                                <CardTitle>Diskon Produk</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Nama Promo</Label>
                                        <Input placeholder="Contoh: Promo Akhir Pekan" />
                                    </div>
                                    <div>
                                        <Label>Tipe Diskon</Label>
                                        <Select onValueChange={(val) => setDiscountType(val as 'percent' | 'nominal')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Tipe Diskon" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percent">Persentase (%)</SelectItem>
                                                <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Nilai Diskon</Label>
                                        <Input type="number" placeholder={discountType === 'percent' ? 'Contoh: 10' : 'Contoh: 10000'} />
                                    </div>
                                    <div>
    <Label>Minimal Quantity</Label>
    <Input type="number" placeholder="Contoh: 3" />
  </div>
                                    <div>
                                        <Label>Berlaku Untuk</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Produk atau Semua Produk" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="semua">Semua Produk</SelectItem>
                                                <SelectItem value="tertentu">Produk Tertentu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Berlaku Untuk Pelanggan</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Target Pelanggan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="semua">Semua Pelanggan</SelectItem>
                                                <SelectItem value="tertentu">Pelanggan Tertentu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button className="mt-4">Simpan Promo</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    {/* Diskon Kupon */}
                    <TabsContent value="kupon">
                        <Card>
                            <CardHeader>
                                <CardTitle>Diskon Kupon</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Kode Kupon</Label>
                                        <Input placeholder="Contoh: HEMAT50" />
                                    </div>
                                    <div>
                                        <Label>Tipe Diskon</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Tipe Diskon" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percent">Persentase (%)</SelectItem>
                                                <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Nilai Diskon</Label>
                                        <Input type="number" placeholder="Contoh: 5000 atau 10" />
                                    </div>
                                </div>
                                <Button className="mt-4">Simpan Kupon</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Diskon Paket */}
                    <TabsContent value="paket">
                        <Card>
                            <CardHeader>
                                <CardTitle>Diskon Paket Makanan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Nama Paket */}
                                <div>
                                    <Label>Nama Paket</Label>
                                    <Input placeholder="Contoh: Paket Hemat 1" />
                                </div>

                                {/* Input Tambah Produk */}
                                <div className="space-y-2">
                                    <Label>Tambah Produk ke Paket</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                                        <Input placeholder="Nama produk" />
                                    </div>
                                    <Button variant="outline">Tambah Produk</Button>
                                </div>

                                {/* Daftar Produk dalam Paket */}
                                <div className="space-y-2 pt-4">
                                    <Label>Daftar Produk dalam Paket</Label>
                                    <div className="overflow-auto border rounded-md">
                                        <table className="min-w-full text-sm text-left border-collapse">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="px-4 py-2 border-b">No</th>
                                                    <th className="px-4 py-2 border-b">Nama Produk</th>
                                                    <th className="px-4 py-2 border-b">Harga Modal</th>
                                                    <th className="px-4 py-2 border-b">Harga Jual</th>
                                                    <th className="px-4 py-2 border-b">Harga Estimasi</th>
                                                    <th className="px-4 py-2 border-b text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {produkPaket.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-2 border-b">{i + 1}</td>
                                                        <td className="px-4 py-2 border-b">{item.nama}</td>
                                                        <td className="px-4 py-2 border-b">
                                                            Rp {item.modal.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-2 border-b">
                                                            Rp {item.jual.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-2 border-b">
                                                            <Input
                                                                type="number"
                                                                className="w-24"
                                                                value={item.estimasi}
                                                                onChange={(e) => updateEstimasiHarga(i, parseInt(e.target.value) || 0)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 border-b text-center">
                                                            <Button size="sm" variant="ghost">Hapus</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Total Estimasi Harga Paket */}
                                <div className="flex justify-between font-semibold border-t pt-4 text-base">
                                    <span>Harga Paket</span>
                                    <span>Rp {totalEstimasi.toLocaleString()}</span>
                                </div>
                                <Button className="mt-4">Simpan Paket</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Poin Pelanggan */}
                    <TabsContent value="poin">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pengaturan Poin Pelanggan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Minimal Pembelian (Rp)</Label>
                                        <Input type="number" placeholder="Contoh: 10000" />
                                    </div>
                                    <div>
                                        <Label>Poin yang Diberikan</Label>
                                        <Input type="number" placeholder="Contoh: 1" />
                                    </div>
                                    <div>
                                        <Label>Masa Berlaku Poin (Hari)</Label>
                                        <Input type="number" placeholder="Contoh: 30" />
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Aktifkan atau Nonaktifkan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aktif">Aktif</SelectItem>
                                                <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button className="mt-4">Simpan Pengaturan Poin</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>


                </Tabs>
            </div>
        </AppLayout>

    );

}
