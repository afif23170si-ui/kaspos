/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { User, Utensils, ChevronDown, X, Minus, Plus } from "lucide-react";
import { Table } from '@/types/table';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

type Category = { id: number; name: string; image: string; };

type ItemBase = {
    type: 'product' | 'menu' | 'package';
    id: number;
    name: string;
    price: number;
    stock: number;
    image?: string | null;
};

type PackageItem = { qty: number; name: string; type: string };

type Item =
    | (ItemBase & { type: 'product' })
    | (ItemBase & { type: 'menu' })
    | (ItemBase & { type: 'package'; items: PackageItem[] });

type PaginatorLink = { url: string | null; label: string; active: boolean };
type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginatorLink[];
};
type Setting = {
    id: number;
    name: string;
    code: string;
    value: string;
    active?: number | boolean;
    is_active?: number | boolean;
    status?: number | boolean;
    enabled?: number | boolean;
};

type PageProps = SharedData & {
    items: Paginator<Item>;
    categories: Category[];
    filters: { search?: string | null; category?: number | null };
    perPage: number;
    table: Table | null;
    settings: Setting[]
};

export default function Welcome() {
    const { auth, items, categories, filters, table, settings } = usePage<PageProps>().props;

    const appName = settings?.find(setting => setting.code === 'NAME')?.value ?? 'Restoran';

    const [customerName, setCustomerName] = useState('');
    const tableNumber = table?.number ?? '';
    const [showCustomerDialog, setShowCustomerDialog] = useState(false);

    // Auto-show customer name dialog when scanning QR code (table exists but name is empty)
    useEffect(() => {
        if (table?.id && !customerName) {
            setShowCustomerDialog(true);
        }
    }, [table?.id]); // Only run when table changes (new QR scan)

    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [category, setCategory] = useState<number | ''>(filters.category ?? '');

    const submitFilter = (extra: Record<string, any> = {}) => {
        router.get(
            route('home'),
            {
                search: search || undefined,
                category: category || undefined,
                table: table?.id || undefined, // Preserve table in URL
                ...extra,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const serverItems = items.data;

    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');

    const closeModal = () => {
        setSelectedItem(null);
        setQuantity(1);
        setNote('');
    };

    type CartLine = {
        item: Item;
        quantity: number;
        note?: string;
    };

    const [cartItems, setCartItems] = useState<CartLine[]>([]);
    const [showCartDialog, setShowCartDialog] = useState(false);

    const updateCartQuantity = (index: number, newQty: number) => {
        setCartItems(prev => {
            const copy = [...prev];
            copy[index].quantity = Math.max(1, newQty);
            return copy;
        });
    };

    const removeCartItem = (index: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const subtotal = useMemo(
        () => cartItems.reduce((acc, l) => acc + l.quantity * (l.item.price ?? 0), 0),
        [cartItems]
    );

    const isActive = (s: Setting) =>
        s.active === 1 || s.active === true ||
        s.is_active === 1 || s.is_active === true ||
        s.status === 1 || s.status === true ||
        s.enabled === 1 || s.enabled === true;

    const operationalFees = useMemo(() => {
        const targetCodes = new Set(['PJK', 'OPR']);
        return settings
            .filter(s => targetCodes.has(s.code) && isActive(s))
            .map((s) => {
                const raw = (s.value ?? '').toString().trim();
                const isPercent = /%$/.test(raw);
                const rate = parseFloat(raw.replace('%', '').replace(',', '.')) || 0;
                const amount = isPercent ? Math.round(subtotal * (rate / 100)) : Math.round(rate);
                return {
                    id: s.id,
                    code: s.code,
                    name: s.name,
                    raw_value: raw,
                    is_percent: isPercent,
                    rate,
                    amount,
                };
            });
    }, [settings, subtotal]);

    const feesTotal = useMemo(
        () => operationalFees.reduce((sum, f) => sum + f.amount, 0),
        [operationalFees]
    );

    const grandTotal = useMemo(() => subtotal + feesTotal, [subtotal, feesTotal]);

    const goToPage = (url: string | null) => {
        if (!url) return;
        const u = new URL(url);
        const page = u.searchParams.get('page') ?? undefined;
        submitFilter({ page });
    };
    const resetAll = () => {
        setCustomerName('');
        setSearch('');
        setCategory('');
        setSelectedItem(null);
        setQuantity(1);
        setNote('');
        setCartItems([]);
        setShowCartDialog(false);
        setShowCustomerDialog(false);
    };

    const handleSubmitOrder = () => {
        if(customerName == null || customerName == '')
            return toast('Masukan nama anda terlebih dahulu');

        if(cartItems.length == 0)
            return toast('Silahkan pilih item terlebih dahulu');

        if(tableNumber == null || tableNumber == '')
            return toast('Silahkan scan barcode di meja terlebih dahulu');

        router.post(route('store'), {
            customer_name: customerName || null,
            table_id: table?.id ?? null,
            items: cartItems.map(l => ({
                type: l.item.type,
                price: l.item.price,
                id: l.item.id,
                qty: l.quantity,
                note: l.note || null,
            })),
            totals: {
                subtotal,
                fees: operationalFees.map(f => ({
                    code: f.code,
                    name: f.name,
                    raw_value: f.raw_value,
                    is_percent: f.is_percent,
                    rate: f.rate,
                    amount: f.amount,
                })),
                total: grandTotal,
            },
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                resetAll();
                toast.success('Pesanan berhasil dibuat');
            },
            onError: () => {
                toast.error('Gagal mengirim pesanan. Coba lagi ya');
            }
        });
    };

    return (
        <>
            <Toaster/>
            <Head title="Welcome" />
            <div className="min-h-screen bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
                {/* Header - Sticky & Full Width */}
                <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] shadow-sm">
                    <nav className="max-w-screen-2xl mx-auto flex justify-between items-center py-3 px-4 flex-wrap gap-2">
                        <div className="text-lg font-bold">{appName}</div>
                            <div className="flex items-center gap-4 flex-wrap justify-end">
                                <button
                                    onClick={() => setShowCustomerDialog(true)}
                                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                                >
                                    <div className="flex items-center gap-1">
                                        <User size={14} />
                                        <span className="font-medium">{customerName || 'Nama Customer'}</span>
                                    </div>
                                    <span className="text-gray-500">|</span>
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <Utensils size={14} />
                                        <span>Meja {tableNumber || '-'}</span>
                                    </div>
                                    <ChevronDown size={14} className="text-gray-400" />
                                </button>

                                {auth.user ? (
                                    <Link
                                        href={route('apps.dashboard')}
                                        className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-[#1b1b18] dark:text-[#EDEDEC]"
                                        >
                                            <User size={16} />
                                        </Link>
                                        {/* <Link
                                            href={route('register')}
                                            className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                                        >
                                            Register
                                        </Link> */}
                                    </>
                                )}
                            </div>
                        </nav>
                    </header>

                    {/* Main Content - Centered */}
                    <main className="w-full max-w-screen-2xl mx-auto px-4 mt-4">
                        <div className="text-center mb-6">
                            <h1 className="text-xl font-semibold">Selamat Datang!</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Silakan pilih produk yang ingin dipesan.</p>
                        </div>

                        {/* Kategori Pills */}
                        <div className="flex flex-wrap gap-2 mb-4 justify-center">
                            <button
                                onClick={() => { setCategory(''); submitFilter({ category: undefined, page: undefined }); }}
                                className={`flex items-center border rounded-full overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-800 ${!category ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : ''}`}
                            >
                                <img src="/NoImage.png" alt="Semua" className="w-7 h-7 object-cover" />
                                <span className="px-3 text-sm">Semua</span>
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setCategory(cat.id); submitFilter({ category: cat.id, page: undefined }); }}
                                    className={`flex items-center border rounded-full overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-800 ${category === cat.id ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : ''}`}
                                >
                                    <img src={cat.image ?? '/NoImage.png'} alt={cat.name} className="w-7 h-7 object-cover" />
                                    <span className="px-3 text-sm">{cat.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="mb-4 px-4 flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari produk/menu/paket..."
                                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring focus:border-blue-500 dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
                                onKeyDown={(e) => { if (e.key === 'Enter') submitFilter({ page: undefined }); }}
                            />
                            <button
                                onClick={() => submitFilter({ page: undefined })}
                                className="px-3 py-2 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cari
                            </button>
                        </div>

                        {/* Grid Items */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-0">
                            {serverItems.map((it) => (
                                <div
                                    key={`${it.type}-${it.id}`}
                                    onClick={() => {
                                        if (it.stock > 0) {
                                            setSelectedItem(it)
                                        }
                                    }}
                                    className={`relative rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition ${it.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <img
                                        src={it.image || '/NoImage.png'}
                                        alt={it.name}
                                        className="w-full h-40 object-cover"
                                    />
                                    {/* harga */}
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                                            Rp {Number(it.price || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    {/* nama */}
                                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white px-3 py-2">
                                        <p className="text-sm font-medium truncate">
                                            {it.name}{' '}
                                            {it.type === 'package' && <span className="opacity-80">(Paket)</span>}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination footer */}
                            <div className="col-span-full mt-6 flex flex-wrap justify-center gap-2 pb-36">
                                {items.links.map((l, i) => {
                                    const label = l.label.replace('&laquo;', '«').replace('&raquo;', '»');
                                    return (
                                        <button
                                            key={i}
                                            disabled={!l.url}
                                            onClick={() => goToPage(l.url)}
                                            className={`px-3 py-1 text-sm border rounded disabled:opacity-50 ${l.active ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tombol Keranjang */}
                        <div className="fixed bottom-4 inset-x-0 px-4">
                            <button
                                onClick={() => setShowCartDialog(true)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow-md"
                            >
                                Lihat Keranjang ({cartItems.length}) • Rp {grandTotal.toLocaleString()}
                            </button>
                        </div>
                    </main>

                    {/* Dialog Detail Item */}
                    <Dialog open={!!selectedItem} onOpenChange={closeModal}>
                        <DialogContent className="sm:max-w-sm">
                            {selectedItem && (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>{selectedItem.name}</DialogTitle>
                                        <DialogDescription>
                                            Harga: Rp {Number(selectedItem.price || 0).toLocaleString()}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-3 py-2">
                                        {selectedItem.type === 'package' && 'items' in selectedItem && (
                                            <div className="text-xs border rounded p-2 space-y-1">
                                                <p className="font-semibold mb-1">Isi Paket:</p>
                                                {selectedItem.items.map((pi, idx) => (
                                                    <div key={idx} className="flex justify-between">
                                                        <span>{pi.name}</span>
                                                        <span className="opacity-70">x{pi.qty}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Qty - Mobile Friendly with +/- buttons */}
                                        <div>
                                            <label className="text-sm block mb-2">Jumlah</label>
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
                                                >
                                                    <Minus size={20} />
                                                </button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                                                    className="w-20 text-center text-xl font-semibold rounded border px-2 py-2 dark:bg-[#2a2a2a] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Note */}
                                        <div>
                                            <label className="text-sm block mb-1">Catatan</label>
                                            <textarea
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                placeholder="Contoh: Tidak pedas"
                                                className="w-full rounded border px-3 py-2 dark:bg-[#2a2a2a]"
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <button
                                            onClick={closeModal}
                                            className="text-sm px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!selectedItem) return;
                                                setCartItems(prev => [...prev, { item: selectedItem, quantity, note }]);
                                                closeModal();
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded"
                                        >
                                            Tambahkan
                                        </button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Keranjang */}
                    <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader><DialogTitle>Pesanan Anda</DialogTitle></DialogHeader>
                            {cartItems.length === 0 ? (
                                <p className="text-sm text-gray-500">Keranjang masih kosong.</p>
                            ) : (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {cartItems.map((line, idx) => (
                                        <div key={idx} className="flex gap-3 border-b pb-3 items-start relative">
                                            <div className="relative w-14 h-14">
                                                <img src={line.item.image || '/NoImage.png'} alt={line.item.name} className="w-full h-full object-cover rounded" />
                                                <button
                                                    onClick={() => removeCartItem(idx)}
                                                    className="absolute inset-0 flex items-center justify-center bg-red-500/30 text-white rounded hover:bg-red-600/40 transition"
                                                    title="Hapus"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{line.item.name}</p>
                                                {line.note && <p className="text-xs text-gray-500">Catatan: {line.note}</p>}
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => updateCartQuantity(idx, line.quantity - 1)}
                                                        className="w-6 h-6 rounded-full border flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >-</button>
                                                    <span className="text-sm px-1">{line.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartQuantity(idx, line.quantity + 1)}
                                                        className="w-6 h-6 rounded-full border flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >+</button>
                                                </div>
                                                <p className="text-xs font-semibold">
                                                    Rp {(line.quantity * (line.item.price || 0)).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/*
                            {cartItems.length > 0 && (
                                <div className="mt-3 space-y-2 border-t pt-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>Rp {subtotal.toLocaleString()}</span>
                                    </div>

                                    {operationalFees.map(f => (
                                        <div key={f.code} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                            <span>{f.name} {f.is_percent ? `(${f.rate}%)` : ''}</span>
                                            <span>Rp {f.amount.toLocaleString()}</span>
                                        </div>
                                    ))}

                                    <div className="flex justify-between text-sm font-semibold border-t pt-2">
                                        <span>Total</span>
                                        <span>Rp {grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            )} */}
                            {cartItems.length > 0 && (
                                <div className="mt-3 space-y-2 pt-2">
                                    <div className="flex justify-between text-sm font-semibold border-t pt-2">
                                        <span>Total</span>
                                        <span>Rp {subtotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="mt-3">
                                <button
                                    onClick={handleSubmitOrder}
                                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-medium"
                                >
                                    Kirim ke Kasir & Dapur • Rp {subtotal.toLocaleString()}
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Customer */}
                    <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle className="text-center text-xl">
                                    👋 Selamat Datang!
                                </DialogTitle>
                                <DialogDescription className="text-center">
                                    {tableNumber 
                                        ? `Anda berada di Meja ${tableNumber}. Silakan masukkan nama Anda untuk melanjutkan pemesanan.`
                                        : 'Silakan masukkan nama Anda untuk melanjutkan.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <label className="text-sm font-medium block mb-2">Nama Anda</label>
                                    <input
                                        type="text"
                                        className="w-full border px-4 py-3 rounded-lg text-base bg-white dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Masukkan nama Anda"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <button
                                    onClick={() => {
                                        if (!customerName.trim()) {
                                            return; // Don't close if name is empty
                                        }
                                        setShowCustomerDialog(false);
                                    }}
                                    disabled={!customerName.trim()}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-base font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Mulai Pesan
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
            </div>
        </>
    );
}
