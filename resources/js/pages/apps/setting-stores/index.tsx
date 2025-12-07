/* eslint-disable @typescript-eslint/no-explicit-any */
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BankAccount } from '@/types/bank';
import { CustomerPointSetting } from '@/types/customer-point-setting';
import { Setting } from '@/types/setting';
import { Shift } from '@/types/shift';
import hasAnyPermission from '@/utils/has-permissions';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, PlusCircle, Save, Trash, X } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan Toko',
        href: route('apps.setting-stores.index'),
    },
];

interface IndexProps {
    banks: BankAccount[];
    shifts: Shift[];
    settings: Setting[];
    customerPointSettings: CustomerPointSetting[];
    [key: string]: unknown;
}

export default function Index() {
    const { banks, shifts, settings, customerPointSettings } = usePage<IndexProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        banks: banks.map((bank) => {
            return {
                bank_name: bank.bank_name,
                account_number: bank.account_number,
                account_name: bank.account_name,
            };
        }) ?? [{ bank_name: '', account_number: '', account_name: '' }],
        shifts: shifts.map((shift) => {
            return {
                code: shift.code,
                name: shift.name,
                start_time: shift.start_time,
                end_time: shift.end_time,
            };
        }) ?? [{ code: '', name: '', start_time: '', end_time: '' }],
        settings: settings.map((setting) => {
            return {
                code: setting.code,
                name: setting.name,
                value: setting.value as unknown as string | File,
                is_active: setting.is_active == true ? '1' : '0',
            };
        }) ?? [{ code: '', name: '', value: '', is_active: '' }],
        loyalty: customerPointSettings.map((point) => {
            return {
                spend_amount: point.spend_amount,
                point_earned: point.point_earned,
                expired_in_days: point.expired_in_days,
                is_active: point.is_active == true ? '1' : '0',
            };
        }) ?? [{ spend_amount: '', point_earned: '', expired_in_days: '', is_active: '' }],
    });

    const [logoPreview, setLogoPreview] = React.useState<Record<number, string | null>>({});

    const setItemsData = (index: number, field: string, value: string | File, type: 'shifts' | 'banks' | 'settings' | 'loyalty') => {
        const updatedList = [...data[type]];

        updatedList[index] = {
            ...updatedList[index],
            [field]: value,
        };

        setData({
            ...data,
            [type]: updatedList,
        });
    };

    const addMoreColumn = (type: 'shifts' | 'banks' | 'settings' | 'loyalty') => {
        let newItem = {};

        switch (type) {
            case 'banks':
                newItem = { bank_name: '', account_number: '', account_name: '' };
                break;
            case 'shifts':
                newItem = { code: '', name: '', start_time: '', end_time: '' };
                break;
            case 'settings':
                newItem = { code: '', name: '', value: '', is_active: '' };
                break;
            case 'loyalty':
                newItem = { spend_amount: '', point_earned: '', expired_in_days: '', is_active: '' };
                break;
        }

        setData((prevData) => ({
            ...prevData,
            [type]: [...prevData[type], newItem],
        }));
    };

    const removeColumn = (index: number, type: 'shifts' | 'banks' | 'settings' | 'loyalty') => {
        const updatedList = [...data[type]];
        updatedList.splice(index, 1);

        setData({
            ...data,
            [type]: updatedList,
        });
    };

    const storeBank = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.setting-stores.store-banks'), {
            onSuccess: () => {
                toast('Data has been saved.');
            },
        });
    };

    const storeShift = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.setting-stores.store-shifts'), {
            onSuccess: () => {
                toast('Data has been saved.');
            },
        });
    };

    const storeSetting = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.setting-stores.store-settings'), {
            onSuccess: () => {
                toast('Data has been saved.');
            },
        });
    };

    const storeCustomerSetting = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.setting-stores.store-loyalty'), {
            onSuccess: () => {
                toast('Data has been saved.');
            },
        });
    };

    const onLogoChange = (rowIndex: number, file: File | undefined) => {
        if (!file) return;

        const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
        if (!allowed.includes(file.type)) {
            toast('Format logo tidak didukung. Gunakan PNG/JPG/SVG/WEBP.');
            return;
        }
        if (file.size > 1_000_000) { // 1MB
            toast('Ukuran logo maksimal 1 MB.');
            return;
        }
        setItemsData(rowIndex, 'value', file, 'settings'); // value diisi File
        setLogoPreview((p) => ({ ...p, [rowIndex]: URL.createObjectURL(file) }));
    };

    const clearLogo = (rowIndex: number) => {
        // kosongkan value; Anda bisa pakai '' agar backend menghapus logo bila perlu
        setItemsData(rowIndex, 'value', '', 'settings');
        setLogoPreview((p) => ({ ...p, [rowIndex]: null }));
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Toko" />
            <div className="p-6">
                <Heading title="Pengaturan Toko" description="Halaman ini digunakan untuk mengelola pengaturan toko" />
                <Tabs defaultValue="bank">
                    <TabsList className="rounded-none p-0">
                        {hasAnyPermission(['settings-bank']) && (
                            <TabsTrigger
                                className="rounded-none border-t-0 border-r-0 border-l-0 data-[state=active]:border-b-2 data-[state=active]:dark:border-b-white data-[state=active]:dark:bg-zinc-950"
                                value="bank"
                            >
                                Akun Bank
                            </TabsTrigger>
                        )}
                        {hasAnyPermission(['settings-shift']) && (
                            <TabsTrigger
                                className="rounded-none border-t-0 border-r-0 border-l-0 data-[state=active]:border-b-2 data-[state=active]:dark:border-b-white data-[state=active]:dark:bg-zinc-950"
                                value="shifts"
                            >
                                Jam Operasional
                            </TabsTrigger>
                        )}
                        {hasAnyPermission(['settings-setting']) && (
                            <TabsTrigger
                                className="rounded-none border-t-0 border-r-0 border-l-0 data-[state=active]:border-b-2 data-[state=active]:dark:border-b-white data-[state=active]:dark:bg-zinc-950"
                                value="setting"
                            >
                                Operasional Toko
                            </TabsTrigger>
                        )}
                        {hasAnyPermission(['settings-loyalty']) && (
                            <TabsTrigger
                                className="rounded-none border-t-0 border-r-0 border-l-0 data-[state=active]:border-b-2 data-[state=active]:dark:border-b-white data-[state=active]:dark:bg-zinc-950"
                                value="customer-point"
                            >
                                Program Loyalitas
                            </TabsTrigger>
                        )}
                    </TabsList>
                    {hasAnyPermission(['settings-bank']) && (
                        <TabsContent value="bank">
                            <form onSubmit={storeBank}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Akun Bank</CardTitle>
                                        <CardDescription>Form ini digunakan untuk mengelola data akun bank toko</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table className="border-t border-b">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[10px] text-center">Aksi</TableHead>
                                                    <TableHead>
                                                        Nama Bank<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Nomor Rekening<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Nama Pemilik Rekening<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.banks.map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>
                                                            <div className="flex items-start justify-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    onClick={() => removeColumn(i, 'banks')}
                                                                    disabled={i === 0}
                                                                >
                                                                    {i === 0 ? <X /> : <Trash />}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="text"
                                                                name="bank_name"
                                                                value={item.bank_name}
                                                                placeholder="Masukkan nama bank"
                                                                onChange={(e) => setItemsData(i, 'bank_name', e.target.value, 'banks')}
                                                            />
                                                            {(errors as any)[`banks.${i}.bank_name`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`banks.${i}.bank_name`]}
                                                                </span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="number"
                                                                name="account_number"
                                                                value={item.account_number}
                                                                onChange={(e) => setItemsData(i, 'account_number', e.target.value, 'banks')}
                                                            />
                                                            {(errors as any)[`banks.${i}.account_number`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`banks.${i}.account_number`]}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="text"
                                                                name="account_name"
                                                                value={item.account_name}
                                                                onChange={(e) => setItemsData(i, 'account_name', e.target.value, 'banks')}
                                                            />
                                                            {(errors as never)[`banks.${i}.account_name`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`banks.${i}.account_name`]}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="p-4">
                                            <Button type="button" onClick={() => addMoreColumn('banks')} variant="outline" size="sm">
                                                <PlusCircle /> Add Column
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="w-full overflow-x-auto border-t p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant={'secondary'} type="submit" disabled={processing}>
                                                {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </form>
                        </TabsContent>
                    )}
                    {hasAnyPermission(['settings-shift']) && (
                        <TabsContent value="shifts">
                            <form onSubmit={storeShift}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Jam Operasional</CardTitle>
                                        <CardDescription>Form ini digunakan untuk mengelola data shift jam operasional karyawan</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table className="border-t border-b">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[10px] text-center">Aksi</TableHead>
                                                    <TableHead>
                                                        Kode Shift<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Nama Shift<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Jam Awal<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Jam Akhir<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.shifts.map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>
                                                            <div className="flex items-start justify-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    onClick={() => removeColumn(i, 'shifts')}
                                                                    disabled={i === 0}
                                                                >
                                                                    {i === 0 ? <X /> : <Trash />}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="text"
                                                                value={item.code}
                                                                onChange={(e) => setItemsData(i, 'code', e.target.value, 'shifts')}
                                                            />
                                                            {(errors as any)[`shifts.${i}.code`] && (
                                                                <span className="text-xs text-red-500">{(errors as any)[`shifts.${i}.code`]}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => setItemsData(i, 'name', e.target.value, 'shifts')}
                                                            />
                                                            {(errors as any)[`shifts.${i}.name`] && (
                                                                <span className="text-xs text-red-500">{(errors as any)[`shifts.${i}.name`]}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="time"
                                                                value={item.start_time}
                                                                onChange={(e) => setItemsData(i, 'start_time', e.target.value, 'shifts')}
                                                            />
                                                            {(errors as never)[`shifts.${i}.start_time`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`shifts.${i}.start_time`]}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="time"
                                                                value={item.end_time}
                                                                onChange={(e) => setItemsData(i, 'end_time', e.target.value, 'shifts')}
                                                            />
                                                            {(errors as never)[`shifts.${i}.end_time`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`shifts.${i}.end_time`]}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="p-4">
                                            <Button type="button" onClick={() => addMoreColumn('shifts')} variant="outline" size="sm">
                                                <PlusCircle /> Add Column
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="w-full overflow-x-auto border-t p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant={'secondary'} type="submit" disabled={processing}>
                                                {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </form>
                        </TabsContent>
                    )}
                    {hasAnyPermission(['settings-setting']) && (
                        <TabsContent value="setting">
                            <form onSubmit={storeSetting}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Operasional Toko</CardTitle>
                                        <CardDescription>Form ini digunakan untuk mengelola data operasional toko</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="bg-muted/30 text-muted-foreground rounded-md p-3 text-xs leading-relaxed">
                                            <div className="text-foreground mb-1 font-semibold">Keterangan:</div>
                                            <ul className="list-disc space-y-1 pl-4">
                                                <li>
                                                    <b>NAME (Nama Toko)</b> → isi dengan nama toko Anda.
                                                    <br />
                                                    <span className="text-foreground italic">Contoh: TOKO WIOOS</span>
                                                </li>
                                                <li>
                                                    <b>ADDRESS (Alamat Toko)</b> → isi dengan alamat lengkap toko.
                                                    <br />
                                                    <span className="text-foreground italic">Contoh: Jl. Merdeka No. 10, Jakarta</span>
                                                </li>
                                                <li>
                                                    <b>PHONE (Kontak)</b> → isi dengan nomor telepon/HP toko.
                                                    <br />
                                                    <span className="text-foreground italic">Contoh: 0812-3456-7890</span>
                                                </li>
                                                <li>
                                                    <b>PJK (Pajak)</b> → masukkan persentase pajak yang berlaku.
                                                    <br />
                                                    <span className="text-foreground italic">Contoh: 10%</span> (untuk 10%)
                                                </li>
                                                <li>
                                                    <b>OLS (Online Shop)</b> → tuliskan marketplace atau link toko online.
                                                    <br />
                                                    <span className="text-foreground italic">Contoh: Shopee / Tokopedia</span>
                                                </li>
                                                <li>
                                                    <b>OPR (Biaya Layanan)</b> → isi dengan biaya tambahan/operasional.
                                                    <br />
                                                    <span className="text-foreground italic">Contoh: 2000</span> (Rp 2.000)
                                                </li>
                                                <li>
                                                    <b>PRNT (Printer)</b> → tuliskan nama printer yang digunakan didalam kolom value.
                                                    <br />
                                                    <span className="text-foreground italic">Contoh: POS-58</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <Table className="border-t border-b">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[10px] text-center">Aksi</TableHead>
                                                    <TableHead>
                                                        Kode<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Nama<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Value<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Aktif<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.settings.map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>
                                                            <div className="flex items-start justify-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    onClick={() => removeColumn(i, 'settings')}
                                                                    disabled={i === 0}
                                                                >
                                                                    {i === 0 ? <X /> : <Trash />}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Select value={item.code} onValueChange={(e) => setItemsData(i, 'code', e, 'settings')}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Kode setting" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="NAME">Nama</SelectItem>
                                                                    <SelectItem value="ADDRESS">Alamat</SelectItem>
                                                                    <SelectItem value="PHONE">Kontak</SelectItem>
                                                                    <SelectItem value="LOGO">Logo</SelectItem>
                                                                    <SelectItem value="PJK">Pajak</SelectItem>
                                                                    <SelectItem value="OLS">Online Shop</SelectItem>
                                                                    <SelectItem value="OPR">Biaya Layanan</SelectItem>
                                                                    <SelectItem value="PRNT">Printer</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            {(errors as any)[`settings.${i}.code`] && (
                                                                <span className="text-xs text-red-500">{(errors as any)[`settings.${i}.code`]}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => setItemsData(i, 'name', e.target.value, 'settings')}
                                                            />
                                                            {(errors as any)[`settings.${i}.name`] && (
                                                                <span className="text-xs text-red-500">{(errors as any)[`settings.${i}.name`]}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                        {item.code === 'LOGO' ? (
                                                            <div className="space-y-3">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-20 h-20 shrink-0 overflow-hidden rounded-md border bg-muted/30 flex items-center justify-center">
                                                                {logoPreview[i] ? (
                                                                    <img src={logoPreview[i] as string} alt="Preview Logo" className="h-full w-full object-contain" />
                                                                ) : typeof item.value === 'string' && item.value ? (
                                                                    <img src={item.value} alt="Logo" className="h-full w-full object-contain" />
                                                                ) : (
                                                                    <span className="text-[10px] text-muted-foreground px-1 text-center">Belum ada preview</span>
                                                                )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                <Input
                                                                    type="file"
                                                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                                                    onChange={(e) => onLogoChange(i, e.target.files?.[0])}
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <Button type="button" variant="outline" size="sm" onClick={() => clearLogo(i)}>
                                                                    <X /> Hapus
                                                                    </Button>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Disarankan 512×512 • Maks 1MB • PNG/JPG/SVG/WEBP
                                                                </p>
                                                                </div>
                                                            </div>

                                                            {(errors as any)[`settings.${i}.value`] && (
                                                                <span className="text-xs text-red-500">{(errors as any)[`settings.${i}.value`]}</span>
                                                            )}
                                                            </div>
                                                        ) : (
                                                            <Input
                                                            type="text"
                                                            value={typeof item.value === 'string' ? item.value : ''}
                                                            onChange={(e) => setItemsData(i, 'value', e.target.value, 'settings')}
                                                            />
                                                        )}
                                                        {(errors as any)[`settings.${i}.value`] && item.code !== 'LOGO' && (
                                                            <span className="text-xs text-red-500">{(errors as any)[`settings.${i}.value`]}</span>
                                                        )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Select
                                                                value={item.is_active}
                                                                onValueChange={(e) => setItemsData(i, 'is_active', e, 'settings')}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih Status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="1">Aktif</SelectItem>
                                                                    <SelectItem value="0">Tidak</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            {(errors as never)[`settings.${i}.is_active`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`settings.${i}.is_active`]}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="p-4">
                                            <Button type="button" onClick={() => addMoreColumn('settings')} variant="outline" size="sm">
                                                <PlusCircle /> Add Column
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="w-full overflow-x-auto border-t p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant={'secondary'} type="submit" disabled={processing}>
                                                {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </form>
                        </TabsContent>
                    )}
                    {hasAnyPermission(['settings-loyalty']) && (
                        <TabsContent value="customer-point">
                            <form onSubmit={storeCustomerSetting}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Program Loyalitas</CardTitle>
                                        <CardDescription>Form ini digunakan untuk mengelola data program loyalitas toko</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table className="border-t border-b">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[10px] text-center">Aksi</TableHead>
                                                    <TableHead>
                                                        Minimal Pembelian<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Poin Yang Diberikan<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Masa Berlaku Poin (Hari)<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                    <TableHead>
                                                        Aktif<span className="text-rose-500">*</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.loyalty.map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>
                                                            <div className="flex items-start justify-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    onClick={() => removeColumn(i, 'loyalty')}
                                                                    disabled={i === 0}
                                                                >
                                                                    {i === 0 ? <X /> : <Trash />}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="text"
                                                                value={item.spend_amount}
                                                                onChange={(e) => setItemsData(i, 'spend_amount', e.target.value, 'loyalty')}
                                                                placeholder="contoh : 100000"
                                                            />
                                                            {(errors as any)[`loyalty.${i}.spend_amount`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`loyalty.${i}.spend_amount`]}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="text"
                                                                value={item.point_earned}
                                                                onChange={(e) => setItemsData(i, 'point_earned', e.target.value, 'loyalty')}
                                                                placeholder="contoh: 1"
                                                            />
                                                            {(errors as any)[`loyalty.${i}.point_earned`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`loyalty.${i}.point_earned`]}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="text"
                                                                value={item.expired_in_days}
                                                                onChange={(e) => setItemsData(i, 'expired_in_days', e.target.value, 'loyalty')}
                                                                placeholder="contoh: 30"
                                                            />
                                                            {(errors as never)[`loyalty.${i}.expired_in_days`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`loyalty.${i}.expired_in_days`]}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Select
                                                                value={item.is_active}
                                                                onValueChange={(e) => setItemsData(i, 'is_active', e, 'loyalty')}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih Status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="1">Aktif</SelectItem>
                                                                    <SelectItem value="0">Tidak</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            {(errors as never)[`loyalty.${i}.is_active`] && (
                                                                <span className="text-xs text-red-500">
                                                                    {(errors as any)[`loyalty.${i}.is_active`]}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="p-4">
                                            <Button type="button" onClick={() => addMoreColumn('loyalty')} variant="outline" size="sm">
                                                <PlusCircle /> Add Column
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="w-full overflow-x-auto border-t p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant={'secondary'} type="submit" disabled={processing}>
                                                {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Simpan Data
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </form>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </AppLayout>
    );
}
