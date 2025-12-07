/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { Category } from '@/types/category';
import { TransactionKitchen } from '@/types/transaction-kitchen';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle, Clock, Loader2, RefreshCcw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { User, type BreadcrumbItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kitchen Display',
        href: route('apps.kitchen.index'),
    },
];

interface KitchenPageProps {
    orders: TransactionKitchen[];
    categories: Category[];
    waiters: User[];
    [key: string]: unknown;
}

export default function KitchenPage() {
    const { orders: initialOrders, waiters } = usePage<KitchenPageProps>().props;
    const [orders, setOrders] = useState<TransactionKitchen[]>(initialOrders ?? []);

    const idsRef = useRef<Set<number>>(new Set((initialOrders ?? []).map(o => o.id)));

    const playAddToKitchenSound = () => {
        const audio = new Audio('/sounds/kds.mp3');
        audio.currentTime = 0;
        audio.play().catch(() => { });
    };

    useEffect(() => {
        idsRef.current = new Set(orders.map(o => o.id));
    }, [orders]);

    useEffect(() => {
        if (!initialOrders?.length) return;
        const added = initialOrders.filter(o => !idsRef.current.has(o.id));
        if (added.length > 0) {
            playAddToKitchenSound();
        }
        setOrders(initialOrders ?? []);
    }, [initialOrders]);

    // Pindahkan fungsi groupItemsByCategory ke luar komponen atau gunakan useMemo
    // agar tidak dibuat ulang setiap render
    function groupItemsByCategory(order: TransactionKitchen) {
        type Group = { id: string | null; name: string; items: typeof order.transaction_kitchen_items };
        const groups = new Map<string, Group>();

        // Pastikan items tidak null/undefined
        const items = order.transaction_kitchen_items || [];

        for (const it of items) {
            const idStr = it.item_category_id == null ? null : String(it.item_category_id);
            const key = idStr ?? 'null';
            const name = (it.item_category_name ?? 'Tanpa Kategori') as string;

            if (!groups.has(key)) {
                groups.set(key, { id: idStr, name, items: [] });
            }
            groups.get(key)!.items.push(it);
        }
        return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name, 'id'));
    }


    const maxIdRef = useRef<number>(orders.length ? Math.max(...orders.map((o) => o.id)) : 0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [processing, setProcessing] = useState(false);

    type ReadyMap = Record<number, Record<number, boolean>>;
    const [readyMap, setReadyMap] = useState<ReadyMap>({});

    const isChecked = (orderId: number, item: { id: number; is_done?: boolean }) =>
        Boolean(readyMap[orderId]?.[item.id] ?? item.is_done);

    const isLocked = (order: TransactionKitchen, item: { is_done?: boolean }) =>
        Boolean(order.status === 'success');

    const handleReadyChange =
        (orderId: number, item: { id?: number; is_done?: boolean }) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!item.id) return;
                const currentOrder = orders.find(o => o.id === orderId);
                if (currentOrder && isLocked(currentOrder, item)) return;

                const checked = e.target.checked;
                setReadyMap(prev => ({
                    ...prev,
                    [orderId]: { ...(prev[orderId] ?? {}), [item.id!]: checked },
                }));
            };

    const isOrderFullyReady = (order: TransactionKitchen) => {
        const items = order.transaction_kitchen_items ?? [];
        return items.length > 0 && items.every(it => isChecked(order.id, it as any));
    };

    const updateStatus = (id: number, status: 'pending' | 'onprogress' | 'success', order?: TransactionKitchen) => {
        if (status === 'success' && order && !isOrderFullyReady(order)) {
            alert('Checklist semua item ready dulu ya.');
            return;
        }

        const readyItems = Object.entries(readyMap[id] ?? {})
            .filter(([, v]) => v)
            .map(([k]) => Number(k));

        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        setProcessing(true);

        router.put(
            route('apps.kitchen.update', id),
            { status, ready_items: readyItems },
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['orders'] }),
                onError: () => setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'onprogress' } : o))),
                onFinish: () => setProcessing(false),
            },
        );
    };

    type WaiterMap = Record<number, User['id'] | null>;
    const [waiterMap, setWaiterMap] = useState<WaiterMap>({});

    useEffect(() => {
        const map: WaiterMap = {};
        for (const o of initialOrders ?? []) {
            map[o.id] = (o.transaction?.waiter_id ?? null) as User['id'] | null;
        }
        setWaiterMap(map);
    }, [initialOrders]);

    const changeWaiter = (orderId: number, value: string) => {
        const newWaiterId: User['id'] | null = value === '' ? null : (Number(value) as User['id'] | any);

        setWaiterMap(prev => ({ ...prev, [orderId]: newWaiterId }));

        router.put(
            route('apps.kitchen.update', orderId),
            { waiter_id: newWaiterId },
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['orders'] }),
                onError: () => {
                    const current = orders.find(o => o.id === orderId);
                    setWaiterMap(prev => ({ ...prev, [orderId]: (current?.transaction?.waiter_id ?? null) as User['id'] | null }));
                },
            }
        );
    };

    const getLabelPesanan = (order: TransactionKitchen) => {
        if (order.transaction.transaction_type === 'dine_in') return `Makan di Tempat - Meja ${order.transaction.table.number}`;
        if (order.transaction.transaction_type === 'takeaway') return 'Take Away';
        if (order.transaction.transaction_type === 'online') return `Online - ${order.transaction.platform || '-'}`;
        return '';
    };

    const getHeaderBgColor = (tipe: TransactionKitchen) => {
        switch (tipe.transaction.transaction_type) {
            case 'dine_in':
                return 'bg-blue-100 dark:bg-blue-900';
            case 'takeaway':
                return 'bg-yellow-100 dark:bg-yellow-900';
            case 'platform':
                return 'bg-purple-100 dark:bg-purple-900';
            default:
                return '';
        }
    };

    const fetchDelta = async () => {
        try {
            const res = await axios.get(route('apps.kitchen.list-orders'), {
                params: { since_id: maxIdRef.current || 0 },
            });
            const { orders: newOrders, max_id } = res.data as { orders: TransactionKitchen[]; max_id: number };

            if (Array.isArray(newOrders) && newOrders.length) {
                const reallyNew = newOrders.filter(o => !idsRef.current.has(o.id));
                if (reallyNew.length > 0) {
                    playAddToKitchenSound();
                }

                setOrders((prev) => {
                    const map = new Map<number, TransactionKitchen>();
                    [...newOrders, ...prev].forEach((o) => map.set(o.id, o));
                    const merged = Array.from(map.values()).sort((a, b) => b.id - a.id).slice(0, 120);
                    return merged;
                });

                if (typeof max_id === 'number') {
                    maxIdRef.current = Math.max(maxIdRef.current, max_id);
                }
            }
        } catch (e) {
            console.error('poll error', e);
        }
    };

    const startPolling = () => {
        if (timerRef.current) return;
        fetchDelta();
        timerRef.current = setInterval(fetchDelta, 30000);
    };

    const stopPolling = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        if (orders.length) {
            maxIdRef.current = Math.max(...orders.map((o) => o.id));
        }
    }, []);

    useEffect(() => {
        const handleVis = () => {
            if (document.visibilityState === 'visible') startPolling();
            else stopPolling();
        };
        handleVis();
        document.addEventListener('visibilitychange', handleVis);
        return () => {
            document.removeEventListener('visibilitychange', handleVis);
            stopPolling();
        };
    }, []);

    console.log(orders);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Kitchen Display' />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kitchen Display</h1>
                    <Button size="sm" variant="outline" onClick={fetchDelta}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {orders.map((order) => {
                        const currentWaiterId = (waiterMap[order.id] ?? order.transaction?.waiter_id ?? null) as User['id'] | null;
                        return (
                            <Card key={order.id} className="rounded-2xl border shadow-sm">
                                <CardHeader className={`rounded-t-2xl px-4 pt-4 pb-3 ${getHeaderBgColor(order)}`}>
                                    <div className="flex flex-wrap items-start justify-between gap-y-1">
                                        <div className="text-base font-bold">{getLabelPesanan(order)}</div>
                                        <Badge
                                            className="flex items-center gap-1 rounded px-2 py-1 text-xs"
                                            variant={order.status === 'pending' ? 'destructive' : order.status === 'onprogress' ? 'secondary' : 'default'}
                                        >
                                            {order.status === 'pending' && (
                                                <>
                                                    <Clock className="h-3 w-3 text-gray-500" />
                                                    Menunggu
                                                </>
                                            )}
                                            {order.status === 'onprogress' && (
                                                <>
                                                    <Loader2 className="h-3 w-3 animate-spin text-yellow-600" />
                                                    Proses
                                                </>
                                            )}
                                            {order.status === 'success' && (
                                                <>
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                    Selesai
                                                </>
                                            )}
                                        </Badge>
                                    </div>
                                    <div className="text-muted-foreground mt-2 text-xs">
                                        <div className="mb-1">
                                            <span className="font-medium">{order.transaction.invoice}</span>
                                        </div>

                                        <div className="flex flex-wrap justify-between gap-x-3">
                                            <div>
                                                <div>
                                                    <span className="font-medium">{order.transaction.customer?.name ?? 'Umum'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                Waktu: <span className="font-medium">{order.transaction_date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-0">
                                    <div className='mt-2'>
                                        <div className='flex flex-col gap-2'>
                                            <span className="text-muted-foreground text-sm font-semibold">Pelayan</span>
                                            <Select
                                                value={currentWaiterId !== null ? String(currentWaiterId) : ''}
                                                onValueChange={(v) => changeWaiter(order.id, v)}
                                                disabled={order.status === 'success'}
                                            >
                                                <SelectTrigger id={`pelayan-${order.id}`} className="bg-secondary">
                                                    <SelectValue placeholder="Pilih pelayan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {waiters.map((w: User) => (
                                                        <SelectItem key={w.id} value={String(w.id)}>
                                                            {w.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {groupItemsByCategory(order).map((category, index) => (
                                        <div key={index} className="border-t pt-3">
                                            <p className="text-muted-foreground text-capitalize mb-2 text-sm font-semibold">{category.name}</p>
                                            <ul className="space-y-2">
                                                {category.items.map((item, idx) => (
                                                    <li key={item.id ?? idx} className="bg-muted/40 flex items-start gap-3 rounded-lg p-2">
                                                        <Checkbox
                                                            className="mt-1 h-4 w-4"
                                                            checked={isChecked(order.id, { ...item, id: Number(item.id) })}
                                                            disabled={isLocked(order, item)}
                                                            onChange={(e) => handleReadyChange(order.id, { ...item, id: Number(item.id) })(e)}
                                                        />
                                                        <div className={`text-sm leading-tight ${isLocked(order, item) ? 'opacity-70' : ''}`}>
                                                            <span className="font-medium">{String(item.item_name)}</span>{' '}
                                                            <span className="text-muted-foreground text-xs">
                                                                x{String(item.transaction_detail.quantity)}
                                                            </span>
                                                            {item.transaction_detail.note != null && (
                                                                <div className="mt-0.5 text-xs text-yellow-600 italic">
                                                                    Catatan: {String(item.transaction_detail.note)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                    <div className="flex flex-wrap gap-2 border-t pt-4">
                                        {order.status === 'pending' && (
                                            <Button type="button" size="sm" onClick={() => updateStatus(order.id, 'onprogress')} disabled={processing}>
                                                Mulai
                                            </Button>
                                        )}
                                        {order.status === 'onprogress' && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => updateStatus(order.id, 'success', order)}
                                                disabled={processing || !isOrderFullyReady(order)}
                                                title={!isOrderFullyReady(order) ? 'Checklist semua item dulu' : undefined}
                                            >
                                                Selesai
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
