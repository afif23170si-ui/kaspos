import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { ArrowLeft, LoaderCircle, Save, Info } from 'lucide-react'
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { Unit } from '@/types/unit';
import DatePicker from '@/components/ui/date-picker';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ingredients',
        href: route('apps.materials.index'),
    },
    {
        title: 'Create Ingredient',
        href: '#',
    },
];

interface CreateProps {
    units: Unit[];
    [key: string]: unknown;
}

export default function Create() {

    const { units } = usePage<CreateProps>().props;

    const { data, setData, errors, processing, post } = useForm({
        name: '',
        unit_id: '',
        initial_qty: 0,
        expired_at: '',
        minimum_qty: 0,
        price: 0,
        unit_2: 0,

    });

    const [totalUnit, setTotalUnit] = useState(0);
    const [perUnitVolume, setPerUnitVolume] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.materials.store'), {
            onSuccess: () => {
                toast('Data has been saved.')
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Create Ingredient' />
            <div className='p-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Create Ingredient</CardTitle>
                        <CardDescription>This form for create ingredient</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={storeData}>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Ingredient Name<span className='text-rose-500'>*</span></Label>
                                <Input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Input ingredient name" />
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label className="flex items-center gap-1">Ingredient Unit<span className='text-rose-500'>*</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-pointer">
                                                <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Masukkan satuan bahan seperti gram, ml, pcs, butir, pack, dan lainnya sesuai jenis bahan.
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Select value={data.unit_id} onValueChange={(e) => setData('unit_id', e)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ingredient unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-red-500 text-xs">{errors.unit_id}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label className="flex items-center gap-1">Initial Qty
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-pointer">
                                                <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Masukkan jumlah stok dalam satuan terkecil. Contoh: 1000 gram (bukan 1 kg), 1 pcs, 250 ml, dll.
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input type="number" value={data.initial_qty} onChange={(e) => setData('initial_qty', parseInt(e.target.value))} placeholder='Input ingredient initial qty' />
                                <p className="text-red-500 text-xs">{errors.initial_qty}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label className="flex items-center gap-1">Minimum Qty
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-pointer">
                                                <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Peringatan sisa stok: jika stok sudah mencapai batas minimum, sistem akan memberikan peringatan sebelum stok habis.
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input type="number" value={data.minimum_qty} onChange={(e) => setData('minimum_qty', parseInt(e.target.value))} placeholder='Input ingredient minimum qty' />
                                <p className="text-red-500 text-xs">{errors.minimum_qty}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Price</Label>
                                <Input type="number" value={data.price} onChange={(e) => setData('price', parseInt(e.target.value))} placeholder='Input ingredient price' />
                                <p className="text-red-500 text-xs">{errors.price}</p>
                            </div>
                            <div className="mb-4 flex flex-col gap-2">
                                <Label>Expired</Label>
                                <DatePicker date={data.expired_at} setDate={(e: string) => setData('expired_at', e)} label="Select Expired at" />
                                <p className="text-red-500 text-xs">{errors.price}</p>
                            </div>

                            {/* Kalkulator Total Qty dan Harga per Satuan Terkecil */}
                            <div className="mb-6 rounded-xl border bg-muted/40 p-4 shadow-sm">
                                <Label className="text-base font-semibold mb-3 block">🧮 Kalkulator Pembelian (Qty & Harga)</Label>

                                {/* Input Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Jumlah Unit 1 */}
                                    <div className="space-y-1">
                                        <Label className="flex gap-1 text-sm font-medium text-muted-foreground">
                                            Jumlah Unit 1
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="cursor-pointer">
                                                        <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[260px]">
                                                    <div>
                                                        Jumlah unit besar yang dibeli.
                                                        <br />
                                                        <strong>Contoh:</strong><br />
                                                        - Rokok: 2 Slop<br />
                                                        - Kecap: 1 Dus
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={totalUnit}
                                            onChange={(e) => setTotalUnit(Number(e.target.value))}
                                            placeholder="Contoh: 2"
                                            className="text-sm"
                                        />
                                    </div>

                                    {/* Isi Unit 1 */}
                                    <div className="space-y-1">
                                        <Label className="flex gap-1 text-sm font-medium text-muted-foreground">
                                            Isi Unit 1
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="cursor-pointer">
                                                        <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[260px]">
                                                    <div>
                                                        Jumlah isi dalam satu unit besar.
                                                        <br />
                                                        <strong>Contoh:</strong><br />
                                                        - Rokok: 1 Slop = 10 Bungkus<br />
                                                        - Kecap: 1 Dus = 24 Botol
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={perUnitVolume}
                                            onChange={(e) => setPerUnitVolume(Number(e.target.value))}
                                            placeholder="Contoh: 10"
                                            className="text-sm"
                                        />
                                    </div>

                                    {/* Isi Unit 2 */}
                                    <div className="space-y-1">
                                        <Label className="flex gap-1 text-sm font-medium text-muted-foreground">
                                            Isi Unit 2 (Opsional)
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="cursor-pointer">
                                                        <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[260px]">
                                                    <div>
                                                        Jumlah isi terkecil dalam unit kecil. Bisa diisi atau dikosongkan.
                                                        <br />
                                                        <strong>Contoh:</strong><br />
                                                        - Rokok: 1 Bungkus = 12 Batang<br />
                                                        - Kecap: 1 Botol = 135 ml
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={data.unit_2 ?? 0}
                                            onChange={(e) => setData('unit_2', Number(e.target.value))}
                                            placeholder="Contoh: 12"
                                            className="text-sm"
                                        />
                                    </div>

                                    {/* Harga Total */}
                                    <div className="space-y-1">
                                        <Label className="flex gap-1 text-sm font-medium text-muted-foreground">
                                            Harga Total
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="cursor-pointer">
                                                        <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[260px]">
                                                    <div>
                                                        Harga pembelian total dari unit besar.
                                                        <br />
                                                        <strong>Contoh:</strong><br />
                                                        - Rokok: 2 Slop = Rp 100.000<br />
                                                        - Kecap: 1 Dus = Rp 180.000
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={totalPrice}
                                            onChange={(e) => setTotalPrice(Number(e.target.value))}
                                            placeholder="Contoh: 100000"
                                            className="text-sm"
                                        />
                                    </div>
                                </div>


                                {/* Hasil dan Rumus (Side by side) */}
                                <div className="mt-6 flex flex-col md:flex-row gap-4">
                                    {/* Hasil */}
                                    <div className="flex-1 border rounded-lg bg-background p-4 text-sm">
                                        <h3 className="font-semibold mb-2">📦 Hasil Perhitungan</h3>
                                        {totalUnit > 0 && perUnitVolume > 0 && totalPrice > 0 ? (
                                            <>
                                                <div>Total Qty: <strong>{totalUnit * perUnitVolume * (data.unit_2 || 1)}</strong></div>
                                                <div>Harga per Qty: <strong>Rp {(
                                                    totalPrice /
                                                    (totalUnit * perUnitVolume * (data.unit_2 || 1))
                                                ).toFixed(2)}</strong></div>
                                            </>
                                        ) : (
                                            <div className="text-muted-foreground">- Belum ada hasil</div>
                                        )}
                                    </div>

                                    {/* Rumus */}
                                    <div className="flex-1 border rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                                        <h3 className="font-semibold mb-2">🔎 Rumus Perhitungan</h3>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Total Qty = Unit1 × Isi Unit1 × Isi Unit2 (jika ada)</li>
                                            <li>Harga per Qty = Harga Total ÷ Total Qty</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Tombol */}
                                <div className="mt-4 text-right">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-sm"
                                        onClick={() => {
                                            const unit2 = data.unit_2 || 1;
                                            const qty = totalUnit * perUnitVolume * unit2;
                                            const pricePerQty = totalPrice / qty;

                                            if (qty && pricePerQty) {
                                                setData('initial_qty', qty);
                                                setData('price', Math.round(pricePerQty));
                                                toast.success('Initial Qty dan Harga berhasil diisi otomatis.');
                                            } else {
                                                toast.error('Isi semua kolom kalkulator terlebih dahulu.');
                                            }
                                        }}
                                    >
                                        Gunakan Hasil ke Initial Qty & Price
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.materials.index')}><ArrowLeft /> Go Back</Link>
                                </Button>
                                <Button variant="default" type="submit" disabled={processing}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Save Data
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
