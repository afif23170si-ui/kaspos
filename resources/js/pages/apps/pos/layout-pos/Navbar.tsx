/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CalculatorDialog from "@/components/calculator-dialog";

import {
    User,
    Calculator,
    Timer,
    MonitorX,
    LogOut,
    LayoutDashboard,
    Utensils,
    Globe,
    ShoppingBag,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useCallback, useEffect, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Table } from "@/types/table";
import { useAppContext } from "@/contexts/app-context";
import { Setting } from "@/types/setting";
import { CashierShift } from "@/types/cashier-shift";
import { Transaction } from "@/types/transaction";
import axios from "axios";
import { toast } from "sonner";
import { BankAccount } from "@/types/bank";

interface NavbarProps {
    tables: Table[];
    settings: Setting[];
    cashierShift: CashierShift;
    pendingTransactionCount: number;
    banks: BankAccount[];
    isWaiter: boolean;
    [key: string]: unknown;
}

export default function Navbar() {
    const { tables, settings, cashierShift, pendingTransactionCount, banks, isWaiter } = usePage<NavbarProps>().props;
    const appName = settings?.find(setting => setting.code === 'NAME')?.value ?? 'Kasir';

    const {
        isOrderTypeOpen, setIsOrderTypeOpen, selectedOrderType, setSelectedOrderType,
        selectedTable, setSelectedTable, selectedPlatform, setSelectedPlatform, setTransaction
    } = useAppContext();

    const resetTransaction = () => {
        setSelectedOrderType('');
        setSelectedPlatform('');
        setSelectedTable('');
    }

    const saveTransaction = (type: 'dine_in' | 'platform' | 'takeaway') => {
        resetTransaction();

        if (type === 'dine_in' && selectedTable)
            setSelectedTable(selectedTable);

        if (type === 'platform' && selectedPlatform)
            setSelectedPlatform(selectedPlatform);

        setSelectedOrderType(type);
        setIsOrderTypeOpen(false);
    };

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
    const [isPendingOpen, setIsPendingOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isCloseCashierOpen, setIsCloseCashierOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [searchTransaction, setSearchTransaction] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
    });

    const { data, setData, post, processing, reset } = useForm({
        cashier_shift_id: cashierShift?.id ?? '',
        cashier_transactions: {
            total_transaction: 0,
            by_payment_method: {
                cash: { total: 0 },
                transfer: {} as { [key: string]: { total: number } }
            },
            total_return: 0
        },
        end_cash: 0
    });

    const dateTime = cashierShift?.opened_at;
    const dateOnly = dateTime ? dateTime.split(" ")[0] : '';

    const transactionType = (type: string, transaction: Transaction): string => {
        if (type === 'dine_in')
            return transaction.table?.number ? `Meja ${transaction.table.number}` : '';
        else if (type === 'platform')
            return transaction.platform ?? '';
        else
            return type ?? '';
    }

    const handleAddTransaction = (transaction: Transaction) => {
        setTransaction(transaction);
        setIsPendingOpen(false);
    }

    useEffect(() => {
        if (!isPendingOpen) return;

        const fetchPending = async () => {
            setLoading(true);
            try {
                const data = await axios.get(route('apps.pos.pending-transactions'), {
                    params: { search },
                });

                console.log(data);

                setPendingTransactions(data.data);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounce = setTimeout(() => {
            fetchPending();
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [search, isPendingOpen]);

    useEffect(() => {
        if (!isHistoryOpen) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('apps.pos.history-transactions'), {
                    params: {
                        search: searchTransaction,
                        page: page,
                    },
                });

                setTransactions(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                });
            } finally {
                setLoading(false);
            }
        };

        const delayDebounce = setTimeout(fetchData, 400);

        return () => clearTimeout(delayDebounce);
    }, [searchTransaction, page, isHistoryOpen]);

    useEffect(() => {
        setPage(1);
    }, [searchTransaction]);

    const TX_EVENT = 'pos:tx.changed';

    const fetchCashierSummary = useCallback(async () => {
    if (!cashierShift?.id) return;
    setLoading(true);
    try {
        const res = await axios.get(route('apps.pos.cashier-transactions'), {
        params: { cashier_shift_id: cashierShift.id, _ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache' },
        });

        setData(prev => ({
        ...prev,
        cashier_transactions: {
            ...prev.cashier_transactions,
            total_transaction: res.data.totalTransaction,
            by_payment_method: res.data.byPaymentMethod,
            total_return: res.data.totalReturn,
        },
        end_cash: res.data.total,
        }));
    } finally {
        setLoading(false);
    }
    }, [cashierShift?.id, setData]);

    useEffect(() => {
        if (!isCloseCashierOpen) return;
        fetchCashierSummary();
    }, [isCloseCashierOpen, fetchCashierSummary]);

    useEffect(() => {
    const onTxChanged = (e: Event) => {
        const ce = e as CustomEvent<{ cashier_shift_id?: string | number }>;
        if (ce.detail?.cashier_shift_id && cashierShift?.id && String(ce.detail.cashier_shift_id) !== String(cashierShift.id)) {
        return;
        }
        if (isCloseCashierOpen) fetchCashierSummary();
    };
    window.addEventListener(TX_EVENT, onTxChanged as EventListener);
    return () => window.removeEventListener(TX_EVENT, onTxChanged as EventListener);
    }, [isCloseCashierOpen, cashierShift?.id, fetchCashierSummary]);

    const saveData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.pos.close-cashier-shift'), {
            onSuccess: () => {
                reset();
                toast('Data berhasil disimpan');
                setIsCloseCashierOpen(false);
            }
        });
    }

    const formatRupiah = (num?: number | null) =>
        `Rp ${((num ?? 0) as number).toLocaleString('id-ID')}`;

    function buildCloseCashierPrintHtml(opts: {
        companyName?: string;
        outletName?: string;
        dateOnly: string;
        cashierShift: any;
        banks: Array<{ id: number | string; bank_name: string }>;
        data: {
            cashier_transactions: {
                total_transaction: number;
                total_return: number;
                by_payment_method: {
                    cash?: { total?: number };
                    transfer?: Record<string | number, { total?: number }>;
                };
            };
            end_cash: number;
        };
    }) {
        const { companyName = settings.find(s => s.code === 'NAME')?.value ?? '-', dateOnly, cashierShift, banks, data } = opts;

        const kasirName = cashierShift?.user?.name ?? '-';
        const shiftName = cashierShift ? `${cashierShift.shift?.name ?? '-'} (${cashierShift.shift?.start_time ?? '-'} - ${cashierShift.shift?.end_time ?? '-'})` : '-';
        const startingCash = cashierShift?.starting_cash ?? 0;

        const cashTotal = data.cashier_transactions.by_payment_method?.cash?.total ?? 0;
        const transferLines = banks.map(b => {
            const v = data.cashier_transactions.by_payment_method?.transfer?.[b.id]?.total ?? 0;
            return `<tr><td>Transfer ${String(b.bank_name).toUpperCase()}</td><td style="text-align:right">${formatRupiah(v)}</td></tr>`;
        }).join('');

        const html = `
            <!doctype html>
            <html>
            <head>
            <meta charset="utf-8" />
            <title>Laporan Tutup Kasir - ${dateOnly}</title>
            <style>
            * { box-sizing: border-box; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"; margin: 0; padding: 24px; }
            .paper { max-width: 720px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 16px; }
            .header h1 { font-size: 18px; margin: 0 0 4px; }
            .header div { font-size: 12px; color: #555; }
            hr { border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 12px; }
            .label { color: #6b7280; }
            .value { color: #111827; font-weight: 600; text-align: right; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            td { padding: 6px 0; }
            .muted { color: #6b7280; }
            .total { font-weight: 700; font-size: 14px; }
            .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 32px; }
            .sign .box { height: 80px; border-top: 1px solid #e5e7eb; padding-top: 8px; text-align: center; font-size: 12px; color: #374151; }
            @media print {
                body { padding: 0; }
                .paper { max-width: none; margin: 0; padding: 16px 24px; }
            }
            </style>
            </head>
            <body>
            <div class="paper">
                <div class="header">
                <h1>Laporan Tutup Kasir</h1>
                <div>${companyName}</div>
                <div>${dateOnly}</div>
                </div>

                <table>
                <tr><td class="muted">Nama Kasir</td><td style="text-align:right"><strong>${kasirName}</strong></td></tr>
                <tr><td class="muted">Shift</td><td style="text-align:right"><strong>${shiftName}</strong></td></tr>
                <tr><td class="muted">Saldo Awal</td><td style="text-align:right"><strong>${formatRupiah(startingCash)}</strong></td></tr>
                </table>

                <hr />

                <table>
                <tr><td class="muted">Total Penjualan</td><td style="text-align:right; color:#059669"><strong>${formatRupiah(data.cashier_transactions.total_transaction)}</strong></td></tr>
                </table>

                <table style="margin-top:8px">
                <tr><td class="muted">Rincian Pembayaran</td><td></td></tr>
                <tr><td>Tunai</td><td style="text-align:right">${formatRupiah(cashTotal)}</td></tr>
                ${transferLines}
                </table>

                <table style="margin-top:8px">
                <tr><td class="muted">Total Return Penjualan</td><td style="text-align:right; color:#dc2626"><strong>${formatRupiah(data.cashier_transactions.total_return)}</strong></td></tr>
                </table>

                <hr />

                <table>
                <tr><td class="total">Perkiraan Saldo Akhir</td><td class="total" style="text-align:right">${formatRupiah(data.end_cash)}</td></tr>
                </table>

                <div class="muted" style="margin-top:16px; font-size:11px">
                Dicetak: ${new Date().toLocaleString('id-ID')}
                </div>
            </div>
            <script>
                window.addEventListener('load', function() {
                window.print();
                setTimeout(() => window.close(), 200);
                });
            </script>
            </body>
            </html>
    `.trim();

        return html;
    }

    function handlePrintCloseCashier(params: {
        dateOnly: string;
        cashierShift: any;
        banks: Array<{ id: number | string; bank_name: string }>;
        data: any;
        companyName?: string;
        outletName?: string;
    }) {
        const html = buildCloseCashierPrintHtml(params);
        const printWindow = window.open('', '_blank', 'width=840,height=960');
        if (!printWindow) {
            alert('Popup diblokir. Izinkan popup untuk mencetak laporan.');
            return;
        }
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    }


    return (
        <nav className="bg-background px-4 py-3 shadow shrink-0 border-b border-border">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">{appName}</h1>
                <div className="flex items-center gap-2">
                    {/* Order Type Modal Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/80 bg-muted border border-border rounded-md"
                        onClick={() => setIsOrderTypeOpen(true)}
                        title="Jenis Pesanan"
                    >
                        <Utensils className="w-5 h-5" />
                    </Button>

                    {/* Calculator Modal Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/80 bg-muted border border-border rounded-md"
                        onClick={() => setIsCalculatorOpen(true)}
                    >
                        <Calculator className="w-5 h-5" />
                    </Button>

                    {/* Tutup Kasir Modal Button - Hidden for waiter */}
                    {!isWaiter && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="border border-border rounded-md"
                            onClick={() => setIsCloseCashierOpen(true)}
                            title="Tutup Kasir"
                        >
                            <MonitorX className="w-5 h-5" />
                        </Button>
                    )}

                    {/* History Modal Button */}
                    {/* <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/80 bg-muted border border-border rounded-md"
                        onClick={() => setIsHistoryOpen(true)}
                    >
                        <Clock className="w-5 h-5" />
                    </Button> */}

                    {/* Pending Order Modal Button */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative hover:bg-primary/80 bg-muted border border-border rounded-md"
                            onClick={() => setIsPendingOpen(true)}
                        >
                            <Timer className="w-5 h-5" />
                            {pendingTransactionCount > 0 && (
                                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-semibold min-w-[18px] h-5 px-1.5 rounded-full flex items-center justify-center leading-none">
                                    {pendingTransactionCount}
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-primary/80 bg-muted border border-border rounded-md"
                            >
                                <User className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link className="block w-full" method="post" href={route('logout')} as="button">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Order Type */}
            <Dialog open={isOrderTypeOpen} onOpenChange={(open) => {
                setIsOrderTypeOpen(open);
                if (!open) {
                    setSelectedOrderType('');
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Pilih Jenis Pesanan</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Silakan pilih tipe pesanan dari pelanggan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <Button
                            variant={selectedOrderType === "dinein" ? "default" : "outline"}
                            className="flex flex-col items-center justify-center h-24 rounded-xl text-sm"
                            onClick={() => {
                                setSelectedOrderType("dine_in");
                            }}
                        >
                            <Utensils className="w-6 h-6 mb-2" />
                            Dine In
                        </Button>
                        <Button
                            variant={selectedOrderType === "takeaway" ? "default" : "outline"}
                            className="flex flex-col items-center justify-center h-24 rounded-xl text-sm"
                            onClick={() => {
                                setSelectedOrderType("takeaway");
                                saveTransaction('takeaway');
                            }}
                        >
                            <ShoppingBag className="w-6 h-6 mb-2" />
                            Take Away
                        </Button>
                        <Button
                            variant={selectedOrderType === "platform" ? "default" : "outline"}
                            className="flex flex-col items-center justify-center h-24 rounded-xl text-sm"
                            onClick={() => {
                                setSelectedOrderType("platform");
                            }}
                        >
                            <Globe className="w-6 h-6 mb-2" />
                            Online
                        </Button>
                    </div>

                    {selectedOrderType === "dine_in" && (
                        <div className="mt-6">
                            <p className="text-sm font-medium mb-3 text-muted-foreground">Pilih Meja</p>
                            <div className="grid grid-cols-2 gap-3 overflow-y-auto h-60">
                                {tables.map((table) => {
                                    const isSelected = selectedTable === table.id;
                                    const isDisabled = table.status !== "available";

                                    const statusText = {
                                        available: "Tersedia",
                                        unavailable: "Tidak Tersedia",
                                        booked: "Di-booking",
                                        occupied: "Tidak Tersedia",
                                        reserved: "Di-booking",
                                    }[table.status] || "Tidak Diketahui";

                                    const statusColor = {
                                        available: "text-green-600",
                                        unavailable: "text-red-600",
                                        booked: "text-amber-600",
                                        occupied: "text-red-600",
                                        reserved: "text-amber-600",
                                    }[table.status] || "text-muted-foreground";

                                    return (
                                        <Button
                                            key={table.id}
                                            variant={isSelected ? "default" : "secondary"}
                                            className={`h-auto py-3 text-left text-sm flex flex-col items-start rounded-lg ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                            onClick={() => {
                                                if (!isDisabled) setSelectedTable(table.id);
                                            }}
                                            disabled={isDisabled}
                                        >
                                            <span className="font-medium">Meja {table.number}</span>
                                            <span className="text-xs text-muted-foreground">Kapasitas: {table.capacity} org</span>
                                            <span className={`text-xs mt-1 font-medium ${statusColor}`}>{statusText}</span>
                                        </Button>
                                    );
                                })}
                            </div>

                            {selectedTable && (
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={() => saveTransaction('dine_in')}>
                                        Lanjut
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedOrderType === "platform" && (
                        <div className="mt-6">
                            <p className="text-sm font-medium mb-3 text-muted-foreground">Pilih Platform</p>
                            <div className="grid grid-cols-3 gap-3">
                                {settings
                                    .filter((setting) => setting.code === 'OLS')
                                    .map((setting) => {
                                        const isSelected = selectedPlatform === setting.name;
                                        return (
                                            <Button
                                                key={setting.name}
                                                variant={isSelected ? "default" : "secondary"}
                                                className="h-auto py-3 text-sm flex flex-col items-center rounded-lg"
                                                onClick={() => setSelectedPlatform(setting.name)}
                                            >
                                                <span className="capitalize">{setting.name}</span>
                                                {setting.value && (
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {setting.value}
                                                    </span>
                                                )}
                                            </Button>
                                        );
                                    })}
                            </div>
                            {selectedPlatform && (
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={() => saveTransaction('platform')}>
                                        Lanjut
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Calculator Dialog */}
            <CalculatorDialog
                open={isCalculatorOpen}
                onOpenChange={setIsCalculatorOpen}
            />

            {/* Tutup kasir Dialog */}
            <Dialog open={isCloseCashierOpen} onOpenChange={setIsCloseCashierOpen}>
                <DialogContent className="w-full max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Tutup Kasir</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menutup kasir? Semua transaksi akan diselesaikan dan sesi akan ditutup.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Informasi Ringkasan Kasir */}
                    <div className="mt-2 border border-border rounded-lg p-4 text-sm bg-muted/30 space-y-2">
                        {/* Info Kasir */}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Nama Kasir</span>
                            <span className="font-medium text-foreground">{cashierShift?.user?.name ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shift</span>
                            {cashierShift?.shift ? (
                                <span className="font-medium text-foreground">
                                    {cashierShift.shift.name} ({cashierShift.shift.start_time} - {cashierShift.shift.end_time})
                                </span>
                            ) : (
                                <span>-</span>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tanggal</span>
                            <span className="font-medium text-foreground">{dateOnly}</span>
                        </div>

                        <div className="border-t border-border" />

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Saldo Awal</span>
                            <span className="font-medium text-foreground">Rp {cashierShift?.starting_cash?.toLocaleString() ?? 0}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Penjualan</span>
                            <span className="font-medium text-green-600">Rp {data.cashier_transactions.total_transaction.toLocaleString()}</span>
                        </div>

                        {/* Metode Pembayaran */}
                        <div className="pl-4 space-y-1 text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Tunai</span>
                                <span className="text-foreground">
                                    Rp {data.cashier_transactions.by_payment_method?.cash?.total?.toLocaleString() ?? 0}
                                </span>
                            </div>
                            {(banks || []).map((bank, i) => (
                                <div className="flex justify-between" key={i}>
                                    <span>Transfer <span className="uppercase">{bank.bank_name}</span></span>
                                    <span className="text-foreground">
                                        Rp {data.cashier_transactions.by_payment_method.transfer?.[bank.id]?.total?.toLocaleString() ?? 0}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Total Return Penjualan di bawah */}
                        <div className="flex justify-between pt-2">
                            <span className="text-muted-foreground">Total Return Penjualan</span>
                            <span className="font-medium text-red-600">Rp {data.cashier_transactions.total_return.toLocaleString()}</span>
                        </div>

                        <div className="border-t border-border" />

                        <div className="flex justify-between font-semibold text-base">
                            <span className="text-foreground">Perkiraan Saldo Akhir</span>
                            <span className="text-foreground">Rp {data.end_cash.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground mt-2">
                        Pastikan semua transaksi dan pengeluaran sudah dicatat sebelum menutup kasir.
                    </div>

                    <DialogFooter className="mt-4 flex justify-between items-center">
                        <Button
                            variant="secondary"
                            onClick={() =>
                                handlePrintCloseCashier({
                                    dateOnly,
                                    cashierShift,
                                    banks,
                                    data,
                                })
                            }
                        >
                        Cetak
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsCloseCashierOpen(false)}>
                                Batal
                            </Button>
                            <form onSubmit={saveData}>
                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={processing}
                                >
                                    Ya, Tutup Kasir
                                </Button>
                            </form>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Riwayat Transaksi</DialogTitle>
                    </DialogHeader>

                    <Input
                        type="text"
                        placeholder="Cari meja, order, atau customer..."
                        className="mb-2 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={searchTransaction}
                        onChange={(e) => setSearchTransaction(e.target.value)}
                    />

                    <div className="overflow-auto max-h-[400px]">
                        <table className="w-full text-sm border border-border rounded-md">
                            <thead className="bg-muted text-foreground sticky top-0 z-10">
                                <tr className="text-left">
                                    <th className="px-4 py-2 border-b border-border">No</th>
                                    <th className="px-4 py-2 border-b border-border">No. Pesanan</th>
                                    <th className="px-4 py-2 border-b border-border">Customer</th>
                                    <th className="px-4 py-2 border-b border-border">Total</th>
                                    <th className="px-4 py-2 border-b border-border">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-muted-foreground">
                                            Tidak ada riwayat transaksi.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction, key) => (
                                        <tr key={key} className="hover:bg-accent">
                                            <td className="px-4 py-2 border-b border-border whitespace-nowrap"> {++key}</td>
                                            <td className="px-4 py-2 border-b border-border whitespace-nowrap">{transaction.invoice}</td>
                                            <td className="px-4 py-2 border-b border-border whitespace-nowrap">{transaction.customer?.name ?? 'Umum'}</td>
                                            <td className="px-4 py-2 border-b border-border whitespace-nowrap">Rp {transaction.grand_total.toLocaleString()}</td>
                                            <td className="px-4 py-2 border-b border-border whitespace-nowrap">{transaction.transaction_date}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div className="pt-4 border-t mt-4">
                            <div className="flex justify-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    title="Halaman Sebelumnya"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                >
                                    «
                                </Button>

                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((pageNum) => (
                                    <Button
                                        key={pageNum}
                                        size="sm"
                                        variant={pageNum === pagination.current_page ? 'default' : 'outline'}
                                        onClick={() => setPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                ))}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    title="Halaman Berikutnya"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => setPage(prev => Math.min(prev + 1, pagination.last_page))}
                                >
                                    »
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Pending Dialog */}
            <Dialog open={isPendingOpen} onOpenChange={setIsPendingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pending Order</DialogTitle>
                        <DialogDescription>Daftar pesanan yang sedang menunggu penyelesaian.</DialogDescription>
                    </DialogHeader>

                    <Input
                        type="text"
                        placeholder="Cari meja, order, atau customer..."
                        className="mb-2 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <p className="text-muted-foreground text-sm text-center">Memuat data...</p>
                        ) : pendingTransactions.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center">Tidak ada pesanan pending.</p>
                        ) : (
                            pendingTransactions.map((order, index) => (
                                <button
                                    key={index}
                                    className="border border-border rounded-lg p-3 hover:bg-accent cursor-pointer transition w-full"
                                    onClick={() => handleAddTransaction(order)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-medium text-foreground capitalize">
                                            {transactionType(order.transaction_type, order)} - Order #{order.invoice}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{order.transaction_date}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground text-start">
                                        {order.customer?.name ?? 'Umum'} &nbsp;|&nbsp; {order.transaction_details.length} item{order.transaction_details.length > 1 ? 's' : ''} &bull; Rp {order.grand_total.toLocaleString()}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsPendingOpen(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </nav>
    );
}
