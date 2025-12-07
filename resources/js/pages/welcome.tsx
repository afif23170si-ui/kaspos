import { useState } from 'react';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { User, Utensils, ChevronDown, X } from "lucide-react";

// Tambahkan tipe untuk variasi
interface Variant {
    label: string;
    options: string[];
}

// Product bisa memiliki atau tidak memiliki variants
interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    variants?: Variant[];
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    //produk
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<{ [label: string]: string }>({});
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');

    const products: Product[] = [
        {
            id: 1,
            name: 'Nasi Goreng',
            price: 18000,
            description: 'Nasi goreng spesial dengan ayam, telur, dan sayur.',
            variants: [
                {
                    label: 'Rasa',
                    options: ['Original', 'Pedas', 'Super Pedas'],
                },
            ],
        },
        {
            id: 2,
            name: 'Ayam Geprek',
            price: 22000,
            description: 'Ayam goreng tepung dengan sambal geprek khas.',
            variants: [
                {
                    label: 'Level Pedas',
                    options: ['0', '1', '2', '3', '4', '5'],
                },
            ],
        },
        {
            id: 3,
            name: 'Es Teh Manis',
            price: 5000,
            description: 'Es teh manis segar disajikan dingin.',
        },
        {
            id: 4,
            name: 'Jus Alpukat',
            price: 12000,
            description: 'Jus alpukat kental dan manis, bisa tambah coklat.',
            variants: [
                {
                    label: 'Topping',
                    options: ['Tanpa Coklat', 'Tambah Coklat'],
                },
            ],
        },
        {
            id: 5,
            name: 'Tempe Goreng',
            price: 4000,
            description: 'Tempe goreng gurih, cocok untuk lauk tambahan.',
        },
    ];

    const closeModal = () => {
        setSelectedProduct(null);
        setQuantity(1);
        setNote('');
        setSelectedVariants({});
    };

    // Input Search
    const [searchQuery, setSearchQuery] = useState('');
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Input Customer & Table
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [showCustomerDialog, setShowCustomerDialog] = useState(false);

    // Fix input value cannot be null
    const safeSearchQuery = searchQuery || '';
    const safeCustomerName = customerName || '';
    const safeTableNumber = tableNumber || '';

    // Pagination
    const [page, setPage] = useState(1);
    const perPage = 3;
    const totalPages = Math.ceil(filteredProducts.length / perPage);

    const paginatedProducts = filteredProducts.slice(
        (page - 1) * perPage,
        page * perPage
    );

    const handleNextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));


    //keranjang
    const [showCartDialog, setShowCartDialog] = useState(false);

    const [cartItems, setCartItems] = useState<
        {
            product: Product;
            quantity: number;
            note?: string;
            variants?: { [label: string]: string };
        }[]
    >([]);

    const updateCartQuantity = (index: number, newQty: number) => {
        setCartItems((prev) => {
            const updated = [...prev];
            updated[index].quantity = newQty;
            return updated;
        });
    };

    function removeCartItem(index: number) {
        const updated = [...cartItems];
        updated.splice(index, 1);
        setCartItems(updated);
    }

    //customer dan meja
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [showCustomerDialog, setShowCustomerDialog] = useState(false);

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-white text-black dark:bg-[#0a0a0a] dark:text-white px-4">
                <div className="w-full max-w-screen-2xl mx-auto flex flex-col">

                    {/* Header */}
                    <header className="mb-4 w-full border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex justify-between items-center py-3 px-2 flex-wrap gap-2">
                            {/* Kiri: Nama Restoran */}
                            <div className="text-lg font-bold">Wioos</div>

                            {/* Kanan: Customer Info + Auth Link */}
                            <div className="flex items-center gap-4 flex-wrap justify-end">
                                {/* Customer Info Button */}
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

                                {/* Auth Links */}
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
                                        <Link
                                            href={route('register')}
                                            className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </header>

                    {/* Main Content */}
                    <main className="w-full">
                        <div className="text-center mb-6">
                            <h1 className="text-xl font-semibold">Selamat Datang!</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Silakan pilih produk yang ingin dipesan.
                            </p>
                        </div>

                        {/* Kategori */}
                        <div className="flex flex-wrap gap-2 mb-4 justify-center">
                            {['Makanan', 'Minuman', 'Snack', 'Paket'].map((kategori) => (
                                <button
                                    key={kategori}
                                    className="flex items-center border rounded-full overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <img
                                        src="/NoImage.png"
                                        alt={kategori}
                                        className="w-7 h-7 object-cover" // gambar lebih besar sedikit biar pas
                                    />
                                    <span className="px-3 text-sm">{kategori}</span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="mb-4 px-4">
                            <input
                                type="text"
                                value={safeSearchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari produk..."
                                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring focus:border-blue-500 dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Produk */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4">
                            {paginatedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className="cursor-pointer relative rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition"
                                >
                                    <img
                                        src="/NoImage.png"
                                        alt={product.name}
                                        className="w-full h-40 object-cover"
                                    />

                                    {/* Badge Harga di kanan atas */}
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                                            Rp {product.price.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Overlay Nama di bawah */}
                                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white px-3 py-2">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Footer Produk: Pagination */}
                            <div className="col-span-full mt-6 flex justify-center gap-2 pb-28">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page === 1}
                                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                >
                                    &laquo; Prev
                                </button>
                                <span className="text-sm py-1 px-2">Halaman {page}</span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page >= totalPages}
                                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                >
                                    Next &raquo;
                                </button>
                            </div>
                        </div>

                        {/* Tombol Keranjang */}
                        <div className="fixed bottom-4 inset-x-0 px-4">
                            <button
                                onClick={() => setShowCartDialog(true)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow-md"
                            >
                                Lihat Keranjang ({cartItems.length})
                            </button>
                        </div>
                    </main>

                    {/* Dialog Detail Produk */}
                    <Dialog open={!!selectedProduct} onOpenChange={closeModal}>
                        <DialogContent className="sm:max-w-sm">
                            {selectedProduct && (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>{selectedProduct.name}</DialogTitle>
                                        <DialogDescription>
                                            Harga: Rp {selectedProduct.price.toLocaleString()}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-3 py-2">
                                        {/* Deskripsi Produk */}
                                        {selectedProduct.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedProduct.description}
                                            </p>
                                        )}

                                        {/* Variasi Produk */}
                                        {selectedProduct?.variants?.map((variantGroup) => (
                                            <div key={variantGroup.label}>
                                                <label className="text-sm block mb-1">{variantGroup.label}</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {variantGroup.options.map((option) => {
                                                        const isSelected = selectedVariants[variantGroup.label] === option;

                                                        return (
                                                            <button
                                                                key={option}
                                                                onClick={() =>
                                                                    setSelectedVariants((prev) => ({
                                                                        ...prev,
                                                                        [variantGroup.label]: option,
                                                                    }))
                                                                }
                                                                className={`px-3 py-1 rounded border text-sm ${isSelected
                                                                    ? 'bg-green-600 text-white border-green-600'
                                                                    : 'border-gray-300 dark:border-gray-600'
                                                                    }`}
                                                            >
                                                                {option}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Jumlah */}
                                        <div>
                                            <label className="text-sm block mb-1">Jumlah</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                                className="w-full rounded border px-3 py-2 dark:bg-[#2a2a2a]"
                                            />
                                        </div>

                                        {/* Catatan */}
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
                                                if (!selectedProduct) return;

                                                setCartItems((prev) => [
                                                    ...prev,
                                                    {
                                                        product: selectedProduct,
                                                        quantity,
                                                        note,
                                                        variants: selectedVariants,
                                                    },
                                                ]);

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
                            <DialogHeader>
                                <DialogTitle>Pesanan Anda</DialogTitle>
                            </DialogHeader>

                            {cartItems.length === 0 ? (
                                <p className="text-sm text-gray-500">Keranjang masih kosong.</p>
                            ) : (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 border-b pb-3 items-start relative">
                                            {/* Gambar Produk + Tombol Hapus */}
                                            <div className="relative w-14 h-14">
                                                <img
                                                    src="/NoImage.png"
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                                <button
                                                    onClick={() => removeCartItem(idx)}
                                                    className="absolute inset-0 flex items-center justify-center bg-red-500/30 text-white rounded hover:bg-red-600/40 transition"
                                                    title="Hapus"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            {/* Info Produk */}
                                            <div className="flex-1">
                                                <p className="font-medium">{item.product.name}</p>

                                                {item.variants &&
                                                    Object.entries(item.variants).map(([label, val]) => (
                                                        <p key={label} className="text-xs text-gray-500">
                                                            {label}: {val}
                                                        </p>
                                                    ))}

                                                {item.note && (
                                                    <p className="text-xs text-gray-500">Catatan: {item.note}</p>
                                                )}
                                            </div>

                                            {/* Kuantitas & Subtotal */}
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => updateCartQuantity(idx, item.quantity > 1 ? item.quantity - 1 : 1)}
                                                        className="w-6 h-6 rounded-full border flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-sm px-1">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                                                        className="w-6 h-6 rounded-full border flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <p className="text-xs font-semibold">
                                                    Rp {(item.quantity * item.product.price).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Total Keseluruhan */}
                            {cartItems.length > 0 && (
                                <>
                                    <div className="mt-1">
                                        <textarea
                                            className="w-full text-xs border rounded-md p-1 resize-none focus:outline-none focus:ring focus:ring-green-200 dark:focus:ring-green-700"
                                            rows={2}
                                            placeholder="Catatan: Tidak pedas, tambah sambal, dll."
                                        />
                                    </div>

                                    <div className="border-t mt-1 pt-1 flex justify-between text-sm font-semibold">
                                        <span>Total</span>
                                        <span>
                                            Rp{" "}
                                            {cartItems
                                                .reduce((acc, item) => acc + item.quantity * item.product.price, 0)
                                                .toLocaleString()}
                                        </span>
                                    </div>
                                </>
                            )}

                            <DialogFooter className="mt-3">
                                <button
                                    onClick={() => setShowCartDialog(false)}
                                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-medium"
                                >
                                    Kirim ke Kasir & Dapur
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Customer dan Meja */}
                    <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Edit Pelanggan</DialogTitle>
                                <DialogDescription>
                                    Masukkan nama pelanggan dan nomor meja.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm block mb-1">Nama</label>
                                    <input
                                        type="text"
                                        className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-gray-900 dark:border-gray-700"
                                        value={safeCustomerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Contoh: Budi"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm block mb-1">No Meja</label>
                                    <input
                                        type="text"
                                        className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-gray-900 dark:border-gray-700"
                                        value={safeTableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        placeholder="Contoh: A12"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="mt-4">
                                <button
                                    onClick={() => setShowCustomerDialog(false)}
                                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-medium"
                                >
                                    Simpan
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
        </>
    );
}
