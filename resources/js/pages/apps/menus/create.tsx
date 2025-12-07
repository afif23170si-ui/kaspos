/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { ArrowLeft, LoaderCircle, Save, Trash, X, PlusCircle, Info } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Category } from '@/types/category';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Combobox } from '@/components/ui/combobox';
import { Material } from '@/types/material';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from "@/components/ui/tooltip";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Menu',
        href: route('apps.menus.index'),
    },
    {
        title: 'Tambah Menu',
        href: '#',
    },
];

interface CreateProps {
    categories: Category[];
    ingredients: Material[];
    [key: string]: unknown;
}

export default function Create() {

    const { categories, ingredients } = usePage<CreateProps>().props;

    const { data, setData, errors, processing, post, reset } = useForm({
        image: null as File | null,
        name: '',
        category_id: '',
        items: [
            { ingredient: '', quantity: 0, price: 0, total_price: 0 }
        ],
        grand_price: 0,
        selling_price: 0,
        margin: 0
    });

    const setItemsData = async (key: number, e: React.ChangeEvent<HTMLInputElement> | string, fieldName?: string) => {
        let updatedItems = [...data.items];

        let value: string | any;
        let name: string;

        if (typeof e !== 'string') {
            value = e.target.value;
            name = e.target.name;
        } else {
            value = e;
            name = fieldName || 'ingredient';
        }

        if (name === 'quantity' || name === 'price') {
            value = parseFloat(value) || 0;
        }

        if (name === 'ingredient') {
            const selectedIngredient = ingredients.find(ing => ing.id.toString() === e);

            updatedItems[key] = {
                ...updatedItems[key],
                ingredient: value,
                price: selectedIngredient?.price || 0,
                total_price: (selectedIngredient?.price || 0) * updatedItems[key].quantity
            };
        } else {
            updatedItems[key] = {
                ...updatedItems[key],
                [name]: value,
            };

            if (name === 'quantity' || name === 'price') {
                updatedItems[key].total_price = updatedItems[key].quantity * updatedItems[key].price;
            }
        }

        const grandPrice = updatedItems.reduce((total, item) => total + (item.total_price || 0), 0);

        setData({
            ...data,
            items: updatedItems,
            grand_price: grandPrice
        });
    }

    const removeColumn = (key: number) => {
        const items = [...data.items];
        items.splice(key, 1);

        const grandPrice = items.reduce((total, item) => total + (item.total_price || 0), 0);
        const newMargin = grandPrice > 0
            ? ((data.selling_price - grandPrice) / grandPrice) * 100
            : 0;

        setData({
            ...data,
            items,
            grand_price: grandPrice,
            margin: parseFloat(newMargin.toFixed(2))
        });
    }

    const addMoreColumn = () => {
        let items = [...data.items, { ingredient: '', quantity: 0, price: 0, total_price: 0 }];

        setData('items', items);
    }

    const storeData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.menus.store'), {
            onSuccess: () => {
                toast('Data has been saved.')
                reset()
            },
        });
    }

    useEffect(() => {
        const newMargin = data.grand_price > 0
            ? ((data.selling_price - data.grand_price) / data.grand_price) * 100
            : 0;

        setData('margin', parseFloat(newMargin.toFixed(2)));
    }, [data.grand_price, data.selling_price]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Tambah Menu' />
            <div className='p-6'>
                <form onSubmit={storeData}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Menu</CardTitle>
                            <CardDescription>Form ini digunakan untuk menambahkan data menu</CardDescription>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <div className='p-6'>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Menu Image</Label>
                                    <Input type="file" onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('image', e.target.files[0]);
                                        }
                                    }}/>
                                    <p className="text-red-500 text-xs">{errors.image}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Menu Name<span className='text-rose-500'>*</span></Label>
                                    <Input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Input menu name" />
                                    <p className="text-red-500 text-xs">{errors.name}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Category Menu<span className='text-rose-500'>*</span></Label>
                                    <Select value={data.category_id} onValueChange={(e) => setData('category_id', e)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category menu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category, i) => (
                                                <SelectItem key={i} value={category.id.toString()}>{category.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-red-500 text-xs">{errors.category_id}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label className="flex items-center gap-1">Capital Price<span className='text-rose-500'>*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-pointer">
                                                    <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Capital Price (harga modal) dihasilkan secara otomatis berdasarkan data resep bahan baku (ingredients).
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Input type="text" value={data.grand_price} readOnly className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' />
                                    <p className="text-red-500 text-xs">{errors.grand_price}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Selling Price<span className='text-rose-500'>*</span></Label>
                                    <Input type="text" value={data.selling_price} onChange={(e) => setData('selling_price', parseInt(e.target.value))} />
                                    <p className="text-red-500 text-xs">{errors.selling_price}</p>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label className="flex items-center gap-1">Margin<span className='text-rose-500'>*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-pointer">
                                                    <Info size={16} className="text-muted-foreground hover:text-foreground" />
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Margin di sini adalah <strong>markup</strong> (dihitung dari modal), yang berguna untuk <strong>menentukan harga jual dari modal</strong>.<br />
                                                Contoh: Jika modal = 10.000 dan harga jual = 15.000,<br />
                                                Maka margin = ((15.000 - 10.000) / 10.000) × 100% = <strong>50%</strong>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Input type="text" value={data.margin} readOnly className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' />
                                    <p className="text-red-500 text-xs">{errors.margin}</p>
                                </div>
                            </div>
                            <Table className='border-t border-b'>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='text-center w-[10px]'>Action</TableHead>
                                        <TableHead className='w-xl'>Ingredients</TableHead>
                                        <TableHead className='w-40'>Quantity</TableHead>
                                        <TableHead className='w-40'>Price</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <div className='flex items-start justify-center'>
                                                    <Button type="button" variant="destructive" onClick={() => removeColumn(i)} disabled={i === 0}>
                                                        {i === 0 ? <X /> : <Trash />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className='align-top'>
                                                <Combobox
                                                    options={ingredients.map((ingredient) => ({
                                                        id: ingredient.id.toString(),
                                                        name: ingredient.name + ' [' + ingredient.unit.name + ']'
                                                    }))}
                                                    placeholder={"Select ingredients"}
                                                    message={'ingredient'}
                                                    value={item.ingredient}
                                                    setValue={(e) => setItemsData(i, e, 'ingredient')}
                                                />
                                                {(errors as any)[`items.${i}.ingredient`] && <div className="text-xs text-red-500">{(errors as any)[`items.${i}.ingredient`]}</div>}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Input type="text" name='quantity' value={item.quantity} onChange={(e) => setItemsData(i, e, 'quantity')} />
                                                {(errors as any)[`items.${i}.quantity`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.quantity`]}</span>}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Input type="text" name='price' readOnly className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' value={item.price} onChange={(e) => setItemsData(i, e, 'price')} />
                                                {(errors as any)[`items.${i}.price`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.price`]}</span>}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Input type="text" name='price' readOnly className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' value={item.total_price} onChange={(e) => setItemsData(i, e, 'total_price')} />
                                                {(errors as any)[`items.${i}.price`] && <span className="text-xs text-red-500">{(errors as any)[`items.${i}.price`]}</span>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className='dark:hover:bg-gray-950'>
                                        <TableCell colSpan={4} className="text-right font-semibold py-3">GrandTotal</TableCell>
                                        <TableCell>
                                            <Input type="text" readOnly value={data.grand_price} className='dark:bg-zinc-800 bg-gray-100 cursor-not-allowed' />
                                            <p className="text-red-500 text-xs">{errors.grand_price}</p>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <div className='p-4'>
                                <Button type="button" onClick={addMoreColumn} variant="outline" size="sm">
                                    <PlusCircle /> Add Column
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className='border-t p-4 w-full overflow-x-auto'>
                            <div className="flex justify-end items-center gap-2">
                                <Button variant="destructive" asChild>
                                    <Link href={route('apps.menus.index')}><ArrowLeft /> Go Back</Link>
                                </Button>
                                <Button variant="default" type="submit" disabled={processing}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : <Save />} Save Data
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    )
}
