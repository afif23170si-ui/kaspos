/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User as Cashier } from '@/types';
import { Category } from '@/types/category';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Save, Search, StickyNote, TicketPercent, Trash2, Truck, User, UserCircle, ScanBarcodeIcon, CheckCircle2, Printer, Check, Minus, Eraser, } from 'lucide-react';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import PosLayout from './layout-pos/PosLayout';
import { Product, ProductLink } from '@/types/product';
import { Menu, MenuLink } from '@/types/menu';
import { Table } from '@/types/table';
import { toast } from 'sonner';
import { BankAccount } from '@/types/bank';
import { useAppContext } from '@/contexts/app-context';
import { Setting } from '@/types/setting';
import axios from 'axios';
import { debounce } from 'lodash';
import { DiscountPackage } from '@/types/discount-package';
import { Shift } from '@/types/shift';
import BarcodeScannerHtml5 from '@/components/barcode-scanner-html5';
import { Card, CardContent } from '@/components/ui/card';
import PrintBluetoothButton from '@/components/PrintBluetoothButton';
import PrintKitchenBluetoothButton, { printKitchenBluetooth } from '@/components/PrintKitchenBluetoothButton';

interface IndexProps {
    cashiers: Cashier[];
    categories: Category[];
    tables: Table[];
    banks: BankAccount[];
    settings: Setting[];
    shifts: Shift[];
    isWaiter: boolean;
    filters: {
        search?: string;
        category?: string;
    };
    items: {
        data: Product[] | Menu[];
        links: ProductLink[] | MenuLink[];
    };
    [key: string]: unknown;
}

interface Item {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    discount_type: string;
    discount: string;
    note: string;
    type: string;
    total_price: number;
    stock: number;
    [key: string]: unknown;
}

interface CartItems {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    discount_type: string;
    discount: string;
    note: string;
    total_price: number;
    type: string;
    stock: number;
    [key: string]: any;
}


export default function Index() {
    const { cashierShift, shifts, cashiers, categories, items, filters, banks, settings, isWaiter } = usePage<IndexProps>().props;

    const {
        selectedOrderType,
        setSelectedOrderType,
        selectedPlatform,
        setSelectedPlatform,
        selectedTable,
        setSelectedTable,
        transaction,
        setTransaction
    } = useAppContext();

    const lastInputTime = useRef<number>(0);
    const barcodeBuffer = useRef<string>('');
    const [scanBarcode, setScanBarcode] = useState('');
    const scanInputRef = useRef<HTMLInputElement>(null);
    const scanTimer = useRef<NodeJS.Timeout | null>(null);
    const [activeInput, setActiveInput] = useState<'search' | 'barcode' | null>('search');
    const [showCamera, setShowCamera] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        items: [] as any[],
        cashierId: '',
        note: '',
        selectedOrderType: '',
        selectedTable: '',
        selectedPlatform: '',
        filters: {
            search: filters.search,
            category: filters.category,
        },
        carts: [] as CartItems[],
        modalProduct: false as boolean,
        modalCashier: false as boolean,
        modalItem: false as boolean,
        modalDiscount: false as boolean,
        modalCustomer: false as boolean,
        newModalCustomer: false as boolean,
        modalShiftCashier: false as boolean,
        modalPayment: false as boolean,
        modalNote: false as boolean,
        modalDelivery: false as boolean,
        cashierShift: {
            shift_id: '',
            cash: 0,
        },
        newCust: {
            name: '',
            email: '',
            phone: '',
            address: '',
        },
        customers: [] as any[],
        searchCustomer: '',
        selectedCustomer: {
            id: '',
            name: '',
        },
        selectedItem: {
            name: '', quantity: 0, price: 0, discount_type: '', discount: '', note: '', type: '', stock: 0, total_price: 0,
        },
        selectedPaymentMethod: '',
        selectedBank: '',
        discounts: {
            code: '',
            discount_type: '',
            discount_amount: 0,
        },
        delivery: {
            name: '',
            no_resi: '',
            address: '',
            note: '',
            status: '',
        },
        notes: {
            no_ref: '',
            transaction_source: '',
            note: '',
        },
        pay: 0,
        remains: 0,
        return: 0,
        discount: 0,
        subTotal: 0,
        other: 0,
        ppn: 0,
        grandTotal: 0,
        isPendingOrder: false as boolean,
        invoice: '',
        modalTransaction: false as boolean,
        transactionPrint: {},
        lastTransaction: {
            invoice: '',
            transaction_type: '',
            pay: '',
            return: ''
        },
        transaction_taxs: [] as { code: string; name: string; value: number }[],
    });

    function fqcnKey(item: any) {
        const map: Record<string, string> = {
            product: 'App\\Models\\ProductVariant',
            menu: 'App\\Models\\Menu',
            package: 'App\\Models\\DiscountPackage',
        };
        const cls = map[item.type];
        return cls ? `${cls}:${item.id}` : '';
    }

    async function recomputeLineDiscounts(nextCarts: any[], selectedCustomer?: { id: number | string } | null) {
        try {
            const resp = await axios.post(route('apps.pos.dicount-per-items'), {
                customer_id: selectedCustomer?.id ?? null,
                carts: nextCarts.map(ci => ({
                    id: ci.id,
                    type: ci.type,
                    price: Number(ci.price),
                    quantity: Number(ci.quantity),
                })),
            });
            return resp.data?.lines ?? {};
        } catch (e) {
            console.error(e);
            return {};
        }
    }

    function clampManual(unitPrice: number, type: '' | 'nominal' | 'percentage', val: number) {
        if (type === 'percentage') return Math.max(0, Math.min(100, val || 0));
        if (type === 'nominal') return Math.max(0, Math.min(unitPrice, val || 0));
        return 0;
    }

    function calcLineTotal(price: number, qty: number, type: '' | 'nominal' | 'percentage', val: number) {
        const unitPrice = Number(price);
        const v = Number(val) || 0;
        let unitDisc = 0;
        if (type === 'nominal') unitDisc = Math.min(v, unitPrice);
        if (type === 'percentage') unitDisc = (unitPrice * v) / 100;
        return (unitPrice - unitDisc) * Number(qty);
    }

    function buildTransactionTaxRows(settings: Setting[], subTotal: number, discount: number) {
        const base = Math.max(Number(subTotal) - Number(discount), 0);

        // Add safe check for settings
        const safeSettings = Array.isArray(settings) ? settings : [];
        const actives = safeSettings.filter(s => s.code === 'PJK' || s.code === 'OPR');

        const rows = actives.map(s => {
            const raw = String(s.value ?? '').trim();
            const amount = raw.endsWith('%')
                ? (base * (parseFloat(raw.replace('%', '')) || 0)) / 100
                : (parseFloat(raw) || 0);

            return {
                code: s.code as 'PJK' | 'OPR',
                name: s.name,
                value: Number((amount || 0).toFixed(2))
            };
        });

        const sumBy = (code: 'PJK' | 'OPR') =>
            actives.reduce((acc, s) => {
                const raw = String(s.value ?? '').trim();
                const amt = raw.endsWith('%')
                    ? (base * (parseFloat(raw.replace('%', '')) || 0)) / 100
                    : (parseFloat(raw) || 0);
                return acc + (amt || 0);
            }, 0);

        const ppnAmount = Number(sumBy('PJK').toFixed(2));
        const oprAmount = Number(sumBy('OPR').toFixed(2));

        return { rows, ppnAmount, oprAmount };
    }

    const recalculateTotals = (carts: Item[], discount: number, settings: any[]) => {
        const subTotal = carts.reduce((sum, item) => sum + item.total_price, 0);
        const taxableBase = Math.max(subTotal - discount, 0);

        // Add safe check for settings
        const safeSettings = Array.isArray(settings) ? settings : [];

        const activePpns = safeSettings.filter((s) => s.code === 'PJK' && s.is_active);
        const ppnAmount = activePpns.reduce((total, s) => {
            if (s.value.endsWith('%')) {
                const percent = parseFloat(s.value) || 0;
                return total + (taxableBase * percent) / 100;
            } else {
                return total + (parseInt(s.value) || 0);
            }
        }, 0);

        const activeOprs = safeSettings.filter((s) => s.code === 'OPR' && s.is_active);
        const oprAmount = activeOprs.reduce((total, s) => {
            if (s.value.endsWith('%')) {
                const percent = parseFloat(s.value) || 0;
                return total + (taxableBase * percent) / 100;
            } else {
                return total + (parseInt(s.value) || 0);
            }
        }, 0);

        const grandTotal = subTotal > 0 ? subTotal + ppnAmount + oprAmount - discount : 0;

        return { subTotal, ppnAmount, oprAmount, grandTotal };
    };


    useEffect(() => {
        if (!transaction || !Array.isArray(transaction.transaction_details)) {
            return;
        }

        const carts = transaction.transaction_details.map((detail: any) => {
            const price = Number(detail.price);
            const discountType = detail.discount_type == 'rupiah' ? 'nominal' : detail.discount_type;

            let discountPrice = 0;
            if (detail.discount && discountType) {
                if (discountType === 'nominal')
                    discountPrice = detail.discount * detail.quantity;
                else
                    discountPrice = ((price * detail.discount) / 100) * detail.quantity;
            }
            const totalPrice = price * detail.quantity - discountPrice;

            return {
                id: String(detail.items_id),
                name: detail.name,
                price,
                quantity: Number(detail.quantity),
                type: detail.type,
                discount_type: detail.discount_type == 'rupiah' ? 'nominal' : 'percentage',
                discount: detail.discount,
                note: detail.note,
                total_price: totalPrice < 0 ? 0 : totalPrice,
                stock: detail.stock,
                ...(detail.type === 'package' && { details: detail.discount_package_items ?? [] })
            };
        });

        const { subTotal, ppnAmount, oprAmount, grandTotal } = recalculateTotals(carts, 0, settings || []);
        const { rows } = buildTransactionTaxRows(settings || [], subTotal, 0);

        setData((prevData) => ({
            ...prevData,
            selectedOrderType: transaction.transaction_type,
            selectedTable: transaction.transaction_type === 'dine_in' ? transaction.table_id : '',
            selectedPlatform: '',
            selectedCustomer: {
                id: transaction.customer?.id ?? '',
                name: transaction.customer?.name ?? '',
            },
            carts,
            subTotal,
            ppn: ppnAmount,
            other: oprAmount,
            grandTotal,
            transaction_taxs: rows,
            isPendingOrder: true,
            invoice: transaction.invoice
        }));
    }, [transaction, settings]);


    const priceItem = (item: Product | Menu | DiscountPackage) => {
        switch (item.type) {
            case 'menu':
                return item.selling_price;
            case 'package':
                return item.total_price;
            default:
                return item.price;
        }
    }

    const fetchCoupon = async () => {
        try {
            const response = await axios(route('apps.options.get-coupons'), {
                params: {
                    code: data.discounts.code,
                }
            })

            if (response.data.code === 200)
                setData(prevData => ({
                    ...prevData,
                    discounts: {
                        code: response.data.data.code,
                        discount_type: response.data.data.type == 'percentage' ? 'persen' : 'nominal',
                        discount_amount: response.data.data.value,
                    }
                }));
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        if (data.discounts.code != '')
            fetchCoupon();
    }, [data.discounts.code]);

    useEffect(() => {
        setData('items', items.data);
    }, [items.data]);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            selectedTable: selectedTable,
            selectedOrderType: selectedOrderType,
            selectedPlatform: selectedPlatform,
        }));

        // Safe check for settings
        const safeSettings = Array.isArray(settings) ? settings : [];
        const platformSetting = safeSettings.find(setting => setting.name === selectedPlatform);

        if (!platformSetting || !platformSetting.value) {
            setData('items', items.data);
            return;
        }

        const value = platformSetting.value.trim();

        const updatedItems = items.data.map(item => {
            const originalPrice: any = priceItem(item);

            if (value.endsWith('%')) {
                const percentage = parseFloat(value.replace('%', '')) || 0;
                const multiplier = 1 + (percentage / 100);
                if (item.type === 'menu')
                    return {
                        ...item,
                        selling_price: Math.round(originalPrice * multiplier),
                    };
                else if (item.type === 'product')
                    return {
                        ...item,
                        price: Math.round(originalPrice * multiplier),
                    };
                else
                    return {
                        ...item,
                        total_price: Math.round(originalPrice * multiplier),

                    }
            } else {
                const addition = parseInt(value) || 0;
                if (item.type === 'menu')
                    return {
                        ...item,
                        selling_price: originalPrice + addition,
                    };
                else if (item.type === 'product')
                    return {
                        ...item,
                        price: originalPrice + addition,
                    };
                else
                    return {
                        ...item,
                        total_price: originalPrice + addition,
                    }
            }
        });

        setData('items', updatedItems);
    }, [selectedPlatform, items.data, selectedOrderType, selectedTable]);

    useEffect(() => {
        const pay = Number(data.pay) || 0
        const total = Number(data.grandTotal) || 0

        if (pay >= total) {
            setData(prev => ({
                ...prev,
                return: pay - total,
                remains: 0,
            }))
        } else {
            setData(prev => ({
                ...prev,
                return: 0,
                remains: total - pay,
            }))
        }
    }, [data.pay])

    useEffect(() => {
        const taxableBase = Math.max(data.subTotal - data.discount, 0);

        const safeSettings = Array.isArray(settings) ? settings : [];

        const activePpns = safeSettings.filter((setting) => setting.code === 'PJK' && setting.is_active);
        const ppnAmount = activePpns.reduce((total, setting) => {
            if (setting.value.endsWith('%')) {
                const percent = parseFloat(setting.value.replace('%', '')) || 0;
                return total + (taxableBase * percent) / 100;
            } else {
                return total + (parseInt(setting.value) || 0);
            }
        }, 0);

        setData((prev) => ({
            ...prev,
            ppn: ppnAmount,
            grandTotal: prev.subTotal > 0 ? prev.subTotal + ppnAmount + prev.other - prev.discount : 0,
        }));
    }, [data.subTotal, data.discount, settings]);

    useEffect(() => {
        const taxableBase = Math.max(data.subTotal - data.discount, 0);

        const safeSettings = Array.isArray(settings) ? settings : [];

        const activeOprs = safeSettings.filter((setting) => setting.code === 'OPR' && setting.is_active);
        const oprAmount = activeOprs.reduce((total, setting) => {
            if (setting.value.endsWith('%')) {
                const percent = parseFloat(setting.value.replace('%', '')) || 0;
                return total + (taxableBase * percent) / 100;
            } else {
                return total + (parseInt(setting.value) || 0);
            }
        }, 0);

        setData((prev) => ({
            ...prev,
            other: oprAmount,
            grandTotal: prev.subTotal > 0 ? prev.subTotal + prev.ppn + oprAmount - prev.discount : 0,
        }));
    }, [data.subTotal, data.discount, data.ppn, settings]);

    // mark the current category as active
    const activeCategory = filters.category;

    // filter menu by category
    const handleCategoryChange = useCallback((categoryId: string | null) => {
        const isActive = filters.category === categoryId;

        const params: { search?: string; category?: string | null } = {
            search: filters.search,
            category: isActive ? undefined : categoryId,
        };

        router.get(route('apps.pos.index'), params, {
            preserveState: true,
            replace: true,
        });
    }, [filters]);

    // add item to carts
    const addToCart = async (item: any) => {
        const cartsArray = Array.isArray(data.carts) ? data.carts : [];
        const price = Number(priceItem(item));

        let updatedCarts;
        const existing = cartsArray.find(
            (cartItem: any) =>
                String(cartItem.id) === String(item.id) &&
                String(cartItem.type) === String(item.type)
        );

        if (existing) {
            const newQty = Number(existing.quantity) + 1;
            if (newQty > item.stock)
                return toast('Stok tidak mencukupi, sisa stok ' + item.stock);

            updatedCarts = cartsArray.map((cartItem: any) => {
                if (
                    String(cartItem.id) === String(item.id) &&
                    String(cartItem.type) === String(item.type)
                ) {
                    return {
                        ...cartItem,
                        quantity: newQty,
                        price,
                    };
                }
                return cartItem;
            });
        } else {
            updatedCarts = [
                ...cartsArray,
                {
                    id: String(item.id),
                    name: item.name,
                    price,
                    quantity: 1,
                    type: item.type,
                    discount_type: '',
                    discount: '',
                    manual_discount_enabled: false,
                    manual_discount_type: '',
                    manual_discount_value: '',
                    note: '',
                    total_price: price,
                    stock: item.stock,
                    ...(item.type === 'package' && { details: item.discount_package_items ?? [] }),
                },
            ];
        }

        const lineMap = await recomputeLineDiscounts(updatedCarts, data.selectedCustomer);

        const cartsComputed = updatedCarts.map((ci: any) => {
            const unitPrice = Number(ci.price);
            const qty = Number(ci.quantity);

            if (ci.manual_discount_enabled) {
                const t = (ci.manual_discount_type || '') as '' | 'nominal' | 'percentage';
                const v = ci.manual_discount_value ?? '';
                const total_price = calcLineTotal(unitPrice, qty, t, v);

                return {
                    ...ci,
                    discount_type: t,
                    discount: String(v || ''),
                    total_price,
                };
            }

            const rec = lineMap[fqcnKey(ci)];
            const t = (rec?.discount_type || '') as '' | 'nominal' | 'percentage';
            const v = rec?.discount ?? '';
            const total_price = calcLineTotal(unitPrice, qty, t, v);

            return {
                ...ci,
                discount_type: t,
                discount: t ? String(v) : '',
                total_price,
            };
        });

        const subTotal = cartsComputed.reduce((sum: number, c: any) => sum + c.total_price, 0);
        const { ppnAmount, oprAmount } = recalculateTotals(cartsComputed, 0, settings || []);
        const { rows } = buildTransactionTaxRows(settings || [], subTotal, 0);
        const grandTotal = subTotal + ppnAmount + oprAmount;

        setData({
            ...data,
            carts: cartsComputed,
            subTotal,
            ppn: ppnAmount,
            other: oprAmount,
            grandTotal,
            transaction_taxs: rows,
        });

        playAddToCartSound();
    };

    // remove item from carts
    const removeFromCart = (item: Item) => {
        const cartsArray = Array.isArray(data.carts) ? data.carts : [];
        const updatedCarts = cartsArray.filter((cartItem: any) => !(cartItem.id === item.id && cartItem.type === item.type && item.name === cartItem.name));
        setData({
            ...data,
            carts: updatedCarts,
            modalItem: false,
        });
    }

    // open modal selected item
    const handleModalItem = (item: Item) => {
        setData({
            ...data,
            modalItem: true,
            selectedItem: {
                ...item,
                discount_type: item.discount_type ?? '',
            },
        });
    }

    const handleUpdateCartItem = async (
        item: Item,
        quantity: number,
        price: string,
        _discount_type: '' | 'nominal' | 'percentage',
        _discount: string,
        note: string
    ) => {
        const cartsArray = Array.isArray(data.carts) ? data.carts : [];
        if (quantity > item.stock)
            return toast('Stok tidak mencukupi, sisa stok ' + item.stock);

        const unitPrice = Number(price);
        const qty = Number(quantity);

        const updatedCarts = cartsArray.map((ci: any) => {
            if (ci.id === item.id && ci.type === item.type) {
                const manualOn = !!_discount_type;
                const clampedVal = clampManual(unitPrice, _discount_type, Number(_discount));

                return {
                    ...ci,
                    price: unitPrice,
                    quantity: qty,
                    note,
                    manual_discount_enabled: manualOn,
                    manual_discount_type: manualOn ? _discount_type : '',
                    manual_discount_value: manualOn ? String(clampedVal) : '',
                    stock: Number(item.stock),
                };
            }
            return ci;
        });

        const lineMap = await recomputeLineDiscounts(updatedCarts, data.selectedCustomer);

        const cartsComputed = updatedCarts.map((ci: any) => {
            const priceNum = Number(ci.price);
            const qtyNum = Number(ci.quantity);

            if (ci.manual_discount_enabled) {
                const t = (ci.manual_discount_type || '') as '' | 'nominal' | 'percentage';
                const v = clampManual(priceNum, t, Number(ci.manual_discount_value));
                const total_price = calcLineTotal(priceNum, qtyNum, t, v);

                return {
                    ...ci,
                    discount_type: t,
                    discount: String(v),
                    total_price,
                };
            }

            const rec = lineMap[fqcnKey(ci)];
            const t = (rec?.discount_type || '') as '' | 'nominal' | 'percentage';
            const v = Number(rec?.discount ?? 0);
            const total_price = calcLineTotal(priceNum, qtyNum, t, v);

            return {
                ...ci,
                discount_type: t,
                discount: t ? String(v) : '',
                total_price,
            };
        });

        const subTotal = cartsComputed.reduce((sum: number, row: any) => sum + row.total_price, 0);
        const { ppnAmount, oprAmount } = recalculateTotals(cartsComputed, 0, settings || []);
        const { rows } = buildTransactionTaxRows(settings || [], subTotal, 0);
        const grandTotal = subTotal + ppnAmount + oprAmount;

        setData({
            ...data,
            carts: cartsComputed,
            modalItem: false,
            selectedItem: {
                name: '',
                quantity: 0,
                price: 0,
                discount_type: '',
                discount: '',
                note: '',
                type: '',
                total_price: 0,
                stock: 0,
            },
            subTotal,
            ppn: ppnAmount,
            other: oprAmount,
            grandTotal,
            transaction_taxs: rows,
        });
    };

    // remove all carts data
    const removeChart = () => {
        setData(prevData => ({
            ...prevData,
            carts: [],
            selectedItem: {
                name: '', quantity: 0, price: 0, discount_type: '', discount: '', note: '', type: '', stock: 0, total_price: 0,
            },
            discounts: {
                code: '',
                discount_type: '',
                discount_amount: 0,
            },
            pay: 0,
            remains: 0,
            return: 0,
            discount: 0,
            subTotal: 0,
            other: 0,
            ppn: 0,
            grandTotal: 0,
            transaction_taxs: [],
        }))
    };

    // apply discounts
    const applyDiscount = () => {
        let discount = data.discounts.discount_amount;
        const subTotal = Number(data.subTotal);
        let grandTotal = subTotal;

        if (data.discounts.discount_type === 'nominal') {
            grandTotal = subTotal - Number(discount || 0);
        } else {
            grandTotal = subTotal - ((Number(discount || 0) / 100) * subTotal);
            discount = (Number(discount || 0) / 100) * subTotal;
        }

        const { rows, ppnAmount, oprAmount } = buildTransactionTaxRows(settings || [], subTotal, discount);

        setData({
            ...data,
            discount: discount,
            grandTotal: grandTotal,
            ppn: ppnAmount,
            other: oprAmount,
            transaction_taxs: rows,
            modalDiscount: !data.modalDiscount,
        });
    }

    // get last transaction
    const getLastTransaction = async () => {
        try {
            const response = await axios.get(route('apps.options.get-last-transactions'));
            setData(prevData => ({
                ...prevData,
                grandTotal: 0,
                lastTransaction: {
                    invoice: response.data.data.invoice,
                    transaction_type: response.data.data.transaction_type,
                    pay: response.data.data.pay,
                    return: response.data.data.change
                },
                transactionPrint: response.data.data,
                modalTransaction: true
            }))
        } catch (e) {
            console.log(e);
        }
    };

    // store data
    const storeData = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.pos.store'), {
            onSuccess: () => {
                setData(prevData => ({
                    ...prevData,
                    items: [] as any[],
                    cashierId: '',
                    note: '',
                    selectedOrderType: '',
                    selectedTable: '',
                    selectedPlatform: '',
                    filters: {
                        search: filters.search,
                        category: filters.category,
                    },
                    carts: [] as CartItems[],
                    modalProduct: false as boolean,
                    modalCashier: false as boolean,
                    modalItem: false as boolean,
                    modalDiscount: false as boolean,
                    modalCustomer: false as boolean,
                    newModalCustomer: false as boolean,
                    modalShiftCashier: false as boolean,
                    modalPayment: false as boolean,
                    modalNote: false as boolean,
                    modalDelivery: false as boolean,
                    cashierShift: {
                        shift_id: '',
                        cash: 0,
                    },
                    newCust: {
                        name: '',
                        email: '',
                        phone: '',
                        address: '',
                    },
                    customers: [] as any[],
                    searchCustomer: '',
                    selectedCustomer: {
                        id: '',
                        name: '',
                    },
                    selectedItem: {
                        name: '', quantity: 0, price: 0, discount_type: '', discount: '', note: '', type: '', stock: 0, total_price: 0,
                    },
                    selectedPaymentMethod: '',
                    selectedBank: '',
                    discounts: {
                        code: '',
                        discount_type: '',
                        discount_amount: 0,
                    },
                    delivery: {
                        name: '',
                        no_resi: '',
                        address: '',
                        note: '',
                        status: '',
                    },
                    notes: {
                        no_ref: '',
                        transaction_source: '',
                        note: '',
                    },
                    pay: 0,
                    remains: 0,
                    return: 0,
                    discount: 0,
                    subTotal: 0,
                    other: 0,
                    ppn: 0,
                    grandTotal: 0,
                    isPendingOrder: false,
                    invoice: '',
                }));
                setTransaction(null);
                setSelectedOrderType('');
                setSelectedPlatform('');
                setSelectedTable('');
                window.dispatchEvent(new CustomEvent('pos:tx.changed'));
                getLastTransaction();
            }
        });
    }

    // sound add to cart
    const playAddToCartSound = () => {
        const audio = new Audio('/sounds/add-to-cart.mp3');
        audio.play();
    };

    // get list customer by request
    const getListCustomer = async () => {
        try {
            const response = await axios.get(route('apps.customers.list-customer-by-request'), {
                params: {
                    selectedCustomer: data.searchCustomer
                }
            });
            setData('customers', response.data);
        } catch (e) {
            console.log(e);
        }
    };

    const debouncedGetListCustomer = useCallback(
        debounce(() => {
            getListCustomer();
        }, 500),
        [data.searchCustomer]
    );

    const handleSelectCustomer = async (customer: any) => {
        const nextCarts = Array.isArray(data.carts) ? [...data.carts] : [];
        const lineMap = await recomputeLineDiscounts(nextCarts, { id: customer.id });

        const cartsWithAutoDiscount = nextCarts.map((ci: any) => {
            const key = fqcnKey(ci);
            const rec = lineMap[key];
            let discount_type = '';
            let discount = '';
            if (rec && rec.discount_type && rec.discount != null) {
                discount_type = rec.discount_type;
                discount = String(rec.discount);
            }
            const unitPrice = Number(ci.price);
            const qty = Number(ci.quantity);
            let unitDisc = 0;
            if (discount && discount_type) {
                unitDisc = discount_type === 'nominal'
                    ? (Number(discount) || 0)
                    : (unitPrice * (Number(discount) || 0) / 100);
            }
            const total_price = (unitPrice - Math.min(unitDisc, unitPrice)) * qty;
            return { ...ci, discount_type, discount, total_price };
        });

        const subTotal = cartsWithAutoDiscount.reduce((s: number, c: any) => s + c.total_price, 0);
        const { ppnAmount, oprAmount } = recalculateTotals(cartsWithAutoDiscount, 0, settings);
        const { rows } = buildTransactionTaxRows(settings, subTotal, 0);
        const grandTotal = subTotal + ppnAmount + oprAmount;

        setData(prev => ({
            ...prev,
            selectedCustomer: { id: customer.id, name: customer.name },
            searchCustomer: '',
            customers: [],
            modalCustomer: !data.modalCustomer,
            carts: cartsWithAutoDiscount,
            subTotal,
            ppn: ppnAmount,
            other: oprAmount,
            grandTotal,
            transaction_taxs: rows,
        }));
    };

    // store customer
    const storeCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post(route('apps.customers.store'), {
                name: data.newCust.name,
                email: data.newCust.email,
                phone: data.newCust.phone,
                address: data.newCust.address
            })

            const newCustomer = response.data.customer;

            setData(prevData => ({
                ...prevData,
                newCust: {
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                },
                newModalCustomer: !prevData.newModalCustomer,
                modalCustomer: !prevData.modalCustomer,
                selectedCustomer: {
                    id: newCustomer.id,
                    name: newCustomer.name,
                },
            }));
        } catch (e) {
            console.log(e);
        }
    }

    // store cashier shift
    const storeCashierShift = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('apps.pos.open-cashier-shift'), {
            onSuccess: () => {
                toast('Shift kasir berhasil dibuka');
                // Refresh page to update cashierShift prop
                router.visit(route('apps.pos.index'), {
                    only: ['cashierShift'],
                    preserveState: true,
                    preserveScroll: true,
                });
                setData(prevData => ({
                    ...prevData,
                    modalShiftCashier: false, // Close modal
                    cashierShift: {
                        shift_id: '',
                        cash: 0,
                    }
                }));
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Gagal membuka shift kasir, silakan coba lagi.');
            }
        });
    }

    useEffect(() => {
        if (data.selectedPaymentMethod === 'transfer') {
            setData((prev) => ({ ...prev, pay: data.grandTotal }));
        } else if (data.selectedPaymentMethod === 'tunai') {
            setData((prev) => ({ ...prev, pay: 0 }));
        }
    }, [data.selectedPaymentMethod, data.grandTotal]);

    // filter menu by search
    const handleFilterSearch = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const now = Date.now()
        const timeDiff = now - lastInputTime.current
        lastInputTime.current = now

        const isScanner = timeDiff < 100
        barcodeBuffer.current += value.slice(-1)

        if (isScanner && barcodeBuffer.current.length >= 8) {
            try {
                const response = await axios.get(route('apps.pos.search-by-barcode', {
                    barcode: barcodeBuffer.current
                }))
                const product = response.data.product

                if (product) {
                    addToCart(product)
                    toast('Produk berhasil ditambahkan ke keranjang')
                }

                barcodeBuffer.current = ''
                router.get(route('apps.pos.index'), {
                    search: '',
                    category: filters.category || undefined,
                }, {
                    preserveState: true,
                    replace: true,
                })
            } catch (error) {
                console.log(error)
                barcodeBuffer.current = ''
            }

            return
        }

        if (timeDiff > 150) {
            barcodeBuffer.current = ''
        }

        const params: { search: string; category?: string } = { search: value }
        if (filters.category) {
            params.category = filters.category
        }

        router.get(route('apps.pos.index'), params, {
            preserveState: true,
            replace: true,
        })
    }, [filters.category, addToCart])


    const handlePrint = async () => {
        // Use windows print method directly instead of backend call
        // This avoids server-side printer driver issues
        if (data.transactionPrint) {
            const safeSettings = Array.isArray(settings) ? settings : [];
            handleWindowsPrint(data.transactionPrint, safeSettings);
            toast("Struk berhasil dicetak");
        } else {
            toast('Gagal mencetak Struk: Data transaksi tidak ditemukan');
        }
    }

    const handleCloseTable = async () => {
        try {
            await axios.post(route('apps.pos.update-table'), { invoice: data.lastTransaction.invoice });
            toast('Data berhasil disimpan');
        } catch (error) {
            console.log(error);
            toast('Data gagal disimpan');
        }
    }

    const handleKitchen = async () => {
        try {
            // Auto-print ke printer dapur via Bluetooth
            await printKitchenBluetooth(data.lastTransaction.invoice);
            
            // Kirim ke dapur (database)
            await axios.post(route('apps.pos.send-kitchen'), { invoice: data.lastTransaction.invoice });
            toast('Pesanan berhasil dikirim ke dapur');
            setData('modalTransaction', !data.modalTransaction);
        } catch (error) {
            console.log(error);
            toast('Data gagal disimpan');
        }
    }

    const formatIDR = (n?: number | null) => `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`;
    const fmtDateTimeNow = () => new Date().toLocaleString('id-ID');
    const getSetting = (settings: Setting[], code: string, fallback = '-') => {
        const safeSettings = Array.isArray(settings) ? settings : [];
        return safeSettings.find((s) => s.code === code)?.value ?? fallback;
    };
    const n = (x: any) => {
        const v = Number(x ?? 0);
        return Number.isFinite(v) ? v : 0;
    };

    function makePayLabel(txRaw: any) {
        const pm = String(txRaw?.payment_method ?? '').toLowerCase().trim();
        if (pm === 'transfer') {
            const bank = txRaw?.bank_account?.bank_name ?? txRaw?.bank_name ?? '';
            return bank ? `Transfer ${String(bank).toUpperCase()}` : 'Transfer';
        }
        if (pm === 'cash') return 'Cash';
        return pm ? pm.charAt(0).toUpperCase() + pm.slice(1) : '-';
    }

    function computeDiscountedUnitAndTotal(
        basePrice: number,
        qty: number,
        discountType?: 'percentage' | 'rupiah' | null,
        discount?: number | null
    ) {
        const p = n(basePrice);
        const q = Math.max(1, n(qty));
        const dVal = n(discount);

        let discPerUnit = 0;
        if (discountType === 'percentage' && dVal > 0) {
            discPerUnit = p * (dVal / 100);
        } else if (discountType === 'rupiah' && dVal > 0) {
            discPerUnit = dVal > p ? dVal / q : dVal;
        } else if (!discountType && dVal > 0) {
            discPerUnit = dVal > p ? dVal / q : dVal;
        }

        const unitAfter = Math.max(0, p - discPerUnit);
        const totalAfter = unitAfter * q;
        return { unitAfter, totalAfter };
    }

    const buildVariantLabel = (pv: any) => {
        try {
            const vals: Array<{ opt?: string; val?: string }> =
                (pv?.product_variant_values ?? []).map((vv: any) => ({
                    opt: vv?.variant_value?.variant_option?.name,
                    val: vv?.variant_value?.name,
                }));
            const parts = vals
                .filter((v) => v.opt && v.val)
                .map((v) => `${v.opt}: ${v.val}`);
            return parts.length ? ` [${parts.join(', ')}]` : '';
        } catch {
            return '';
        }
    };

    const nameFromMorph = (morph: any): string => {
        if (!morph) return 'Item';
        if ('discount_package_items' in morph) return morph?.name ?? 'Paket';
        if ('product' in morph || 'product_variant_values' in morph) {
            const base = morph?.product?.name ?? morph?.name ?? 'Produk';
            return `${base}${buildVariantLabel(morph)}`;
        }
        if ('category' in morph) return morph?.name ?? 'Menu';
        return morph?.name ?? 'Item';
    };

    type ReceiptItem = {
        name: string;
        qty: number;
        price: number;
        total: number;
    };

    function mapDetailsToReceiptItems(txRaw: any): ReceiptItem[] {
        const details: any[] = txRaw?.transaction_details ?? [];
        const lines: ReceiptItem[] = [];

        for (const det of details) {
            const morph = det?.items;
            const qty = n(det?.quantity);
            const base = n(det?.price);
            const dType = (det?.discount_type as 'percentage' | 'rupiah' | null) ?? null;
            const dVal = det?.discount != null ? n(det.discount) : 0;

            const { unitAfter, totalAfter } = computeDiscountedUnitAndTotal(base, qty, dType, dVal);

            const baseName = nameFromMorph(morph);
            lines.push({
                name: baseName,
                qty,
                price: unitAfter,
                total: totalAfter,
            });
        }

        return lines;
    }

    const computeSubtotal = (items: ReceiptItem[]) =>
        items.reduce((acc, it) => acc + n(it.total), 0);

    function mapOrderTypeLabel(orderType?: string, platform?: string) {
        switch (orderType) {
            case 'dine_in':
                return 'Makan ditempat';
            case 'platform':
                return (platform ? String(platform) : '').replace(/^\w/, (c) => c.toUpperCase());
            case 'takeaway':
                return 'Takeaway';
            default:
                return orderType ?? '-';
        }
    }

    function buildReceiptHtml({
        tx,
        companyName,
        companyAddress,
        companyPhone,
        companyLogo,
    }: {
        tx: {
            invoice?: string;
            cashier_name?: string;
            order_type_label?: string;
            table_number?: string | number;
            customer_name?: string;
            items: ReceiptItem[];
            subtotal: number;
            discount?: number;
            taxes?: Array<{ label: string; value: number }>;
            grand_total?: number;
            pay?: number;
            change?: number;
            pay_label: string;
        };
        companyName: string;
        companyAddress: string;
        companyPhone: string;
        companyLogo: string;
    }) {
        // Format tanggal lengkap dan waktu dengan timezone
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }) + ' WIB';

        // Pesan personal berdasarkan nama pelanggan
        const thankYouMessage = tx.customer_name && tx.customer_name !== 'Umum' 
            ? `Terima kasih, ${tx.customer_name}!` 
            : 'Terima kasih atas kunjungan Anda!';

        const taxesHtml =
            (tx.taxes?.length ?? 0) > 0
                ? tx.taxes!
                    .map(
                        (t) => `
                <div class="row">
                <span>${t.label}</span>
                <span>${formatIDR(t.value)}</span>
                </div>
            `
                    )
                    .join('')
                : '';

        const itemsHtml =
            tx.items
                ?.map(
                    (it) => `
        <div class="item">
            <div class="item-name">${it.qty} ${it.name}</div>
            <div class="item-sub">
            <span>@${formatIDR(it.price)}</span>
            <span>${formatIDR(it.total)}</span>
            </div>
        </div>
        `
                )
                .join('') ?? '';

        // Hitung total item
        const totalItems = tx.items?.reduce((acc, it) => acc + it.qty, 0) ?? 0;

        return `
        <!doctype html>
        <html>
        <head>
        <meta charset="utf-8" />
        <title>Struk ${tx.invoice ?? ''}</title>
        <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, "Helvetica", "Liberation Sans", sans-serif; font-size: 10px; margin:0; padding:0; color: #000; }
        .paper { width: 100%; max-width: 58mm; margin: 0 auto; padding: 2px 3px 6px; }
        .center { text-align: center; }
        h1 { font-size: 11px; margin: 0; font-weight: bold; }
        .small { font-size: 9px; }
        hr { border:0; border-top:1px dashed #000; margin: 6px 0; }
        .section { font-size: 10px; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .row span { font-weight: 500; }
        .item { margin: 6px 0; }
        .item-name { font-size: 10px; font-weight: 600; }
        .item-sub { display:flex; justify-content: space-between; font-size: 9px; margin-top: 1px; }
        .logo { max-width: 60px; margin-bottom: 4px; }
        .table-badge { 
            display: inline-block;
            border: 1px solid #000; 
            padding: 1px 6px; 
            font-weight: bold;
            font-size: 11px;
        }
        .total-section { 
            text-align: center; 
            padding: 6px 0;
        }
        .total-label { 
            font-size: 10px; 
            margin-bottom: 2px;
        }
        .total-amount { 
            font-size: 14px; 
            font-weight: bold; 
        }
        .summary-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 2px 0;
            font-size: 10px;
        }
        .item-count {
            font-size: 9px;
            margin-bottom: 3px;
        }
        .payment-section {
            font-size: 9px;
        }
        @media print {
        @page { margin: 4mm 1mm 2mm 1mm; size: 58mm auto; }
        body { margin: 0; }
        .paper { width: 100%; max-width: 54mm; margin: 0 auto; padding: 3mm 1mm 3mm 1mm; }
        }
        </style>
        </head>
        <body>
        <div class="paper">
            <!-- Header -->
            <div class="center">
            ${companyLogo ? `<img src="${companyLogo}" class="logo" alt="Logo" onerror="this.style.display='none'"/>` : ''}
            <h1>${companyName}</h1>
            <div class="small">${companyAddress}</div>
            <div class="small">${companyPhone}</div>
            </div>

            <hr />

            <!-- Info Transaksi -->
            <div class="section">
            <div class="row"><span>Invoice</span><span>${tx.invoice ?? '-'}</span></div>
            <div class="row"><span>Tanggal</span><span>${dateStr}</span></div>
            <div class="row"><span>Waktu</span><span>${timeStr}</span></div>
            ${tx.table_number ? `<div class="row"><span>Meja</span><span class="table-badge">${tx.table_number}</span></div>` : ''}
            <div class="row"><span>Kasir</span><span>${tx.cashier_name ?? '-'}</span></div>
            ${tx.customer_name && tx.customer_name !== 'Umum' ? `<div class="row"><span>Pelanggan</span><span>${tx.customer_name}</span></div>` : ''}
            </div>

            <hr />

            <!-- Items -->
            <div class="section">
            ${itemsHtml}
            </div>

            <hr />

            <!-- Summary -->
            <div class="section">
            <div class="item-count">${totalItems} item</div>
            <div class="summary-row"><span>Subtotal</span><span>${formatIDR(tx.subtotal)}</span></div>
            ${tx.discount ? `<div class="summary-row"><span>Diskon</span><span>- ${formatIDR(tx.discount)}</span></div>` : ''}
            ${taxesHtml}
            </div>

            <!-- Total -->
            <div class="total-section">
            <div class="total-label">TOTAL</div>
            <div class="total-amount">${formatIDR(tx.grand_total)}</div>
            </div>

            <hr />

            <!-- Payment -->
            <div class="section payment-section">
            <div class="row">
                <span>${tx.pay_label ?? 'Tunai'}</span>
                <span>${formatIDR(tx.pay)}</span>
            </div>
            <div class="row"><span>Kembali</span><span>${formatIDR(tx.change)}</span></div>
            </div>

            <hr />
            <div class="center small">${thankYouMessage}<br/>Simpan struk ini sebagai bukti transaksi.</div>
        </div>

        <script>
            window.addEventListener('load', function() {
            setTimeout(function(){ window.print(); window.close(); }, 150);
            });
        </script>
        </body>
        </html>
    `.trim();
    }

    function buildKitchenReceiptHtml({
        tx,
    }: {
        tx: {
            invoice?: string;
            order_type_label?: string;
            table_number?: string | number;
            items: any[];
            note?: string;
        };
    }) {
        // Format tanggal dan waktu dengan timezone
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }) + ' WIB';

        // Hitung total item
        const totalQty = tx.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ?? 0;

        const itemsHtml =
            tx.items
                ?.map(
                    (it, idx) => `
        <div class="item">
            <div class="item-row">
                <span class="item-num">${idx + 1}.</span>
                <span class="item-qty">${it.quantity}</span>
                <span class="item-name">${it.name}</span>
                <span class="item-check">☐</span>
            </div>
            ${it.details && it.details.length > 0 ?
                    `<div class="item-details">
                ${it.details.map((d: any) => `<div>+ ${d.name}</div>`).join('')}
            </div>`
                    : ''
                }
            ${it.note ? `<div class="item-note">📝 ${it.note}</div>` : ''}
        </div>
        `
                )
                .join('') ?? '';

        return `
        <!doctype html>
        <html>
        <head>
        <meta charset="utf-8" />
        <title>Kitchen ${tx.invoice ?? ''}</title>
        <style>
        :root { --muted:#333; --line:#000; }
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, "Helvetica", "Liberation Sans", sans-serif; font-size: 10px; margin:0; padding:0; }
        .paper { width: 100%; max-width: 58mm; margin: 0 auto; padding: 2px 3px 6px; }
        .center { text-align: center; }
        .small { font-size: 9px; color: var(--muted); }
        hr { border:0; border-top:1px dashed var(--line); margin: 6px 0; }
        .section { font-size: 10px; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .row span:first-child { color: var(--muted); }
        .kitchen-badge {
            display: inline-block;
            background: #000;
            color: #fff;
            padding: 3px 10px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 3px;
            margin-bottom: 3px;
        }
        .order-type {
            font-size: 12px;
            font-weight: bold;
            margin: 2px 0;
        }
        .table-section {
            text-align: center;
            padding: 6px 0;
        }
        .table-badge {
            display: inline-block;
            font-size: 14px;
            font-weight: 900;
            border: 2px solid #000;
            padding: 4px 12px;
            border-radius: 4px;
        }
        .item { 
            margin: 6px 0; 
            padding: 6px 0; 
            border-bottom: 1px dotted #ccc; 
        }
        .item:last-child { border-bottom: none; }
        .item-row { 
            display: flex; 
            align-items: center; 
            gap: 4px; 
        }
        .item-num { 
            font-size: 10px;
            font-weight: 600; 
            min-width: 16px;
            color: var(--muted);
        }
        .item-qty { 
            font-size: 14px;
            font-weight: 900; 
            min-width: 20px;
        }
        .item-name { 
            flex: 1; 
            font-size: 12px; 
            font-weight: 600; 
        }
        .item-check { 
            font-size: 20px; 
            min-width: 24px; 
            text-align: center; 
        }
        .item-details { 
            font-size: 9px; 
            margin-left: 40px; 
            color: #555; 
            margin-top: 2px;
        }
        .item-note { 
            font-size: 9px; 
            font-weight: bold; 
            background: #eee; 
            padding: 2px 6px; 
            display: inline-block;
            margin-top: 3px;
            margin-left: 40px;
            border-radius: 2px;
        }
        .total-section {
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            padding: 4px 0;
        }
        .footer-msg {
            text-align: center;
            font-size: 9px;
            color: var(--muted);
            padding: 4px 0;
        }
        @media print {
        @page { margin: 4mm 1mm 2mm 1mm; size: 58mm auto; }
        body { margin: 0; }
        .paper { width: 100%; max-width: 54mm; margin: 0 auto; padding: 3mm 1mm 3mm 1mm; }
        }
        </style>
        </head>
        <body>
        <div class="paper">
            <!-- Header -->
            <div class="center">
            <span class="kitchen-badge">🍳 KITCHEN</span>
            <div class="order-type">${tx.order_type_label ?? 'ORDER'}</div>
            </div>

            <hr />

            <!-- Info -->
            <div class="section">
            <div class="row"><span>Invoice</span><span>${tx.invoice ?? '-'}</span></div>
            <div class="row"><span>Waktu</span><span>${dateStr} • ${timeStr}</span></div>
            </div>

            <!-- Table Badge -->
            ${tx.table_number ? `
            <div class="table-section">
            <span class="table-badge">MEJA: ${tx.table_number}</span>
            </div>
            ` : ''}

            <hr />

            <!-- Items -->
            <div class="section">
            ${itemsHtml}
            </div>

            <hr />

            <!-- Total -->
            <div class="total-section">${totalQty} item</div>

            <hr />
            <div class="footer-msg">⚡ Segera siapkan pesanan ini!</div>
        </div>

        <script>
            window.addEventListener('load', function() {
            setTimeout(function(){ window.print(); window.close(); }, 150);
            });
        </script>
        </body>
        </html>
    `.trim();
    }

    function handleKitchenPrint(txRaw: any) {
        if (!txRaw) {
            alert('Tidak ada data transaksi.');
            return;
        }

        // Kita gunakan raw items dari transaction details karena struktur data mungkin sedikit berbeda
        // txRaw.transaction_details biasanya berisi array item
        const items = txRaw.transaction_details || [];

        const tx = {
            invoice: txRaw.invoice,
            order_type_label: mapOrderTypeLabel(txRaw.transaction_type, txRaw.platform),
            table_number: txRaw.table?.number,
            items: items.map((detail: any) => {
                const morph = detail.items;
                let itemName = 'Item';

                // Logic penamaan mirip PosController backend
                if (morph) {
                    // Cek ProductVariant
                    if ('product' in morph || 'product_variant_values' in morph) {
                        const baseName = morph.product?.name ?? morph.name ?? 'Produk';
                        const variantLabel = buildVariantLabel(morph);
                        itemName = `${baseName}${variantLabel}`;
                    }
                    // Cek Menu
                    else if ('category' in morph || detail.items_type?.includes('Menu')) {
                        itemName = morph.name ?? 'Menu';
                    }
                    // Cek Package
                    else if ('discount_package_items' in morph || detail.items_type?.includes('DiscountPackage')) {
                        itemName = morph.name ?? 'Paket';
                    }
                    // Fallback
                    else {
                        itemName = morph.name ?? 'Item';
                    }
                }

                return {
                    quantity: detail.quantity,
                    name: itemName,
                    note: detail.note,
                    details: morph?.discount_package_items ?? [] // support paket bundle
                };
            }),
        };

        const html = buildKitchenReceiptHtml({ tx });
        const w = window.open('', '_blank', 'width=600,height=600');
        if (!w) {
            alert('Popup diblokir. Izinkan popup untuk mencetak.');
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
    }

    function handleWindowsPrint(txRaw: any, settings: Setting[]) {
        if (!txRaw) {
            alert('Tidak ada transaksi untuk dicetak.');
            return;
        }

        const items = mapDetailsToReceiptItems(txRaw);

        const tx = {
            invoice: txRaw.invoice,

            cashier_name:
                txRaw.cashier_shift?.user?.name ??
                txRaw.cashier?.name ??
                txRaw.user?.name ??
                '-',

            order_type_label: mapOrderTypeLabel(txRaw.transaction_type, txRaw.platform),
            table_number: txRaw.table?.number,
            customer_name: (txRaw.customer?.name ?? 'Umum') || 'Umum',

            items,
            subtotal: computeSubtotal(items),
            discount: n(txRaw.discount),

            taxes: Array.isArray(txRaw.transaction_taxs)
                ? txRaw.transaction_taxs.map((t: any) => ({
                    label: t?.name ?? t?.code ?? 'Pajak',
                    value: n(t?.value),
                }))
                : [],

            grand_total: n(txRaw.grand_total ?? txRaw.grandTotal),
            pay: n(txRaw.paid),
            change: n(txRaw.return),
            pay_label: makePayLabel(txRaw),
        };

        const companyName = getSetting(settings, 'NAME', 'Perusahaan');
        const companyAddress = getSetting(settings, 'ADDRESS', 'Alamat');
        const companyPhone = getSetting(settings, 'PHONE', '-');
        const companyLogo = getSetting(settings, 'LOGO', '');

        const html = buildReceiptHtml({ tx, companyName, companyAddress, companyPhone, companyLogo });
        const w = window.open('', '_blank', 'width=800,height=900');
        if (!w) {
            alert('Popup diblokir. Izinkan popup untuk mencetak.');
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
    }

    return (
        <>
            {!cashierShift
                ?
                <PosLayout>
                    <Head title="Kasir" />
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            {isWaiter ? (
                                <>
                                    <h1 className="text-2xl font-bold mb-4">Belum Ada Shift Kasir Aktif</h1>
                                    <p className="text-muted-foreground mb-4">
                                        Anda login sebagai waiter. Silakan tunggu kasir membuka shift terlebih dahulu.
                                    </p>
                                    <Button type='button' onClick={() => router.reload()}>Refresh Halaman</Button>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-bold mb-4">Shift Kasir Belum Dibuka</h1>
                                    <p className="text-muted-foreground mb-4">Silakan buka shift kasir terlebih dahulu untuk melanjutkan.</p>
                                    <Button type='button' onClick={() => setData('modalShiftCashier', !data.modalShiftCashier)}>Buka Shift Kasir</Button>
                                </>
                            )}
                        </div>

                        <Dialog open={data.modalShiftCashier} onOpenChange={() => setData('modalShiftCashier', !data.modalShiftCashier)}>
                            <DialogContent className="max-w-sm">
                                <DialogHeader>
                                    <DialogTitle>Buka Shift Kasir</DialogTitle>
                                    <DialogDescription>Silahkan buka shift kasir terlebih dahulu.</DialogDescription>
                                </DialogHeader>
                                <form className='space-y-4' onSubmit={storeCashierShift}>
                                    <div>
                                        <Label>Shift</Label>
                                        <Select value={String(data.cashierShift.shift_id)} onValueChange={(value) => setData('cashierShift.shift_id', value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih Shift" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {shifts.map((shift) => (
                                                    <SelectItem key={shift.id} value={String(shift.id)}>
                                                        {shift.name} ({shift.start_time} s.d {shift.end_time})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-red-500 text-xs">{errors['cashierShift.shift_id']}</p>
                                    </div>
                                    <div>
                                        <Label>Uang Kembalian</Label>
                                        <Input value={data.cashierShift.cash || ''} onChange={(e) => setData('cashierShift.cash', Number(e.target.value))} />
                                        <p className="text-red-500 text-xs">{errors['cashierShift.cash']}</p>
                                    </div>
                                    <Button type='submit' variant={'secondary'}>
                                        <Save /> Buka Kasir
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </PosLayout>
                :
                <PosLayout>
                    <Head title="Kasir" />
                    <div className="grid h-full grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="border-border bg-background flex h-full min-h-0 flex-col justify-between rounded-xl border shadow-sm md:col-span-1">
                            {/* Area keranjang */}
                            <div className="flex min-h-0 flex-grow flex-col p-4">
                                <div className="relative mb-0">
                                    <div className="flex items-center justify-between">
                                        {/* Label Pelanggan - Hidden for waiter */}
                                        {!isWaiter && (
                                            <label className="flex cursor-pointer items-center gap-2 select-none">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('modalCustomer', !data.modalCustomer)}
                                                    className="rounded-md p-2 transition hover:bg-gray-100"
                                                    aria-label="Pilih Pelanggan"
                                                >
                                                    <User className="h-4 w-4 text-gray-600" />
                                                </button>
                                                <span className="text-sm text-foreground font-medium select-text">{data.selectedCustomer.name != '' ? data.selectedCustomer.name : 'Umum'}</span>
                                            </label>
                                        )}
                                        {isWaiter && (
                                            <span className="text-sm text-foreground font-medium">Mode Waiter</span>
                                        )}

                                        {/* Tombol Search (Mobile only) */}
                                        <button
                                            type="button"
                                            onClick={() => setData('modalProduct', !data.modalProduct)}
                                            className="block rounded-md p-2 transition hover:bg-gray-100 md:hidden"
                                            aria-label="Cari Produk"
                                        >
                                            <Search className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                                <div className="border-border my-2 border-t" />

                                {/* Keranjang Items */}
                                <div className="mb-4 min-h-0 flex-grow overflow-y-auto pr-2">
                                    <div className="space-y-2">
                                        {data.carts.map((item, index) => (
                                            <div
                                                key={index}
                                                className="hover:bg-accent flex cursor-pointer items-start justify-between rounded p-2"
                                                onClick={() => handleModalItem(item)}
                                            >
                                                <div>
                                                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                                                    <div className="text-muted-foreground mt-1 flex items-center gap-x-4 text-sm">
                                                        <span>Rp {item.price}</span>
                                                        <span>x{item.quantity}</span>
                                                    </div>
                                                    {item.details && item.details.length > 0 &&
                                                        <div className='flex flex-col gap-1'>
                                                            {item.details.map((detail: any, detailIndex: number) => (
                                                                <span key={detailIndex} className="text-xs text-muted-foreground"> - {detail.name}</span>
                                                            ))}
                                                        </div>
                                                    }
                                                    <p className="text-muted-foreground mt-0.5 text-xs italic">{item.note}</p>
                                                </div>
                                                <p className="text-sm font-medium text-foreground">Rp {item.total_price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-background rounded-b-xl border-t p-4">
                                <div className="text-muted-foreground mb-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Total Item</span>
                                        <span className="text-foreground font-medium">{data.carts.length}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Total Belanja</span>
                                        <span className="text-foreground font-medium">Rp {data.subTotal}</span>
                                    </div>
                                    {data.discount > 0 && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Diskon</span>
                                                <span className="text-foreground font-medium">-Rp {data.discount}</span>
                                            </div>
                                            <hr className="border-border my-2" />
                                            <div className="flex justify-between">
                                                <span>Total Setelah Diskon</span>
                                                <span className="text-foreground font-medium">Rp {data.subTotal - data.discount}</span>
                                            </div>
                                        </>
                                    )}
                                    {data.carts.length > 0 && data.ppn > 0 && (settings || [])
                                        .filter((setting) => setting.code === 'PJK' && setting.is_active == true)
                                        .map((setting) => {
                                            const taxableBase = Math.max(data.subTotal - data.discount, 0);
                                            let amount = 0;
                                            if (setting.value.endsWith('%')) {
                                                const percent = parseFloat(setting.value.replace('%', '')) || 0;
                                                amount = (taxableBase * percent) / 100;
                                            } else {
                                                amount = parseInt(setting.value) || 0;
                                            }
                                            return (
                                                <div className="flex justify-between" key={setting.id}>
                                                    <span>{setting.name} ({setting.value})</span>
                                                    <span className="text-foreground font-medium">Rp {amount}</span>
                                                </div>
                                            );
                                        })}

                                    {data.carts.length > 0 && data.other > 0 && (settings || [])
                                        .filter((setting) => setting.code === 'OPR' && setting.is_active == true)
                                        .map((setting) => {
                                            const taxableBase = Math.max(data.subTotal - data.discount, 0);
                                            let amount = 0;
                                            if (setting.value.endsWith('%')) {
                                                const percent = parseFloat(setting.value.replace('%', '')) || 0;
                                                amount = (taxableBase * percent) / 100;
                                            } else {
                                                amount = parseInt(setting.value) || 0;
                                            }
                                            return (
                                                <div className="flex justify-between" key={setting.id}>
                                                    <span>{setting.name} ({setting.value})</span>
                                                    <span className="text-foreground font-medium">Rp {amount}</span>
                                                </div>
                                            );
                                        })}
                                </div>

                                <div className="mb-4 flex items-center justify-between gap-2">
                                    <div className="flex gap-1">
                                        <Button variant="destructive" className="rounded-md flex gap-2" onClick={() => removeChart()}>
                                            <Trash2 className="h-5 w-5" />
                                            <span className="hidden md:inline">Reset</span>
                                        </Button>
                                    </div>

                                    <div className="flex gap-1">
                                        {/* Discount Button - Hidden for waiter */}
                                        {!isWaiter && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Diskon"
                                                onClick={() => setData('modalDiscount', !data.modalDiscount)}
                                                className="hover:bg-primary/80 bg-muted border-border rounded-md border"
                                            >
                                                <TicketPercent className="h-5 w-5" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Catatan"
                                            onClick={() => setData('modalNote', !data.modalNote)}
                                            className="hover:bg-primary/80 bg-muted border-border rounded-md border"
                                        >
                                            <StickyNote className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Pengiriman"
                                            onClick={() => setData('modalDelivery', !data.modalDelivery)}
                                            className="hover:bg-primary/80 bg-muted border-border rounded-md border"
                                        >
                                            <Truck className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Pelayan"
                                            onClick={() => setData('modalCashier', !data.modalCashier)}
                                            className="hover:bg-primary/80 bg-muted border-border rounded-md border"
                                        >
                                            <UserCircle className="h-5 w-5" />
                                        </Button>
                                        {/* <Button variant="ghost" size="icon" title="Pilih Meja" onClick={() => setIsMejaOpen(true)} className="hover:bg-primary/80 bg-muted border border-border rounded-md">
                                                    <LayoutGrid className="w-5 h-5" />
                                                </Button> */}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {/* Payment Button - Hidden for waiter */}
                                    {!isWaiter && (
                                        <Button className="flex-1" onClick={() => setData('modalPayment', !data.modalPayment)}>
                                            Bayar • Rp {data.grandTotal.toLocaleString()}
                                        </Button>
                                    )}
                                    {/* Simpan Pesanan Button - For waiter show as primary, for cashier as secondary */}
                                    <form onSubmit={storeData} className={isWaiter ? 'flex-1' : ''}>
                                        <Button
                                            variant={isWaiter ? 'default' : 'ghost'}
                                            size={isWaiter ? 'default' : 'icon'}
                                            title="Simpan Pesanan"
                                            className={isWaiter ? 'w-full' : 'hover:bg-primary/80 bg-muted border-border rounded-md border'}
                                            type='submit'
                                            onClick={() => setData('isPendingOrder', true)}
                                        >
                                            <Save className="h-5 w-5" />
                                            {isWaiter && <span className="ml-2">Simpan Pesanan</span>}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Area Produk */}
                        <div className="border-border bg-background hidden h-full min-h-0 flex-col rounded-xl border p-4 shadow-sm md:col-span-2 md:flex">
                            <div className="mb-4 flex items-center gap-1 transition-all">
                                {/* Input Cari Produk */}
                                {activeInput === 'barcode' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('search');
                                            setTimeout(() => document.getElementById('searchInput')?.focus(), 50);
                                        }}
                                        className="p-2 rounded-md border hover:bg-accent"
                                        title="Cari produk"
                                    >
                                        <Search className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                ) : (
                                    <Input
                                        id="searchInput"
                                        type="text"
                                        placeholder="Cari produk berdasarkan nama/barcode/sku"
                                        className="flex-1 transition-all"
                                        value={data.filters.search || ''}
                                        onFocus={() => setActiveInput('search')}
                                        onChange={(e) => handleFilterSearch(e)}
                                    />
                                )}

                                {/* Input Scan Barcode */}
                                {activeInput === 'search' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('barcode');
                                            setTimeout(() => scanInputRef.current?.focus(), 50);
                                        }}
                                        className="p-2 rounded-md border hover:bg-accent"
                                        title="Scan barcode"
                                    >
                                        <ScanBarcodeIcon className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                ) : (
                                    <Input
                                        type="text"
                                        placeholder="Scan barcode"
                                        className="flex-1 transition-all"
                                        value={scanBarcode}
                                        ref={scanInputRef}
                                        onFocus={() => setActiveInput('barcode')}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setScanBarcode(value);
                                            if (scanTimer.current) clearTimeout(scanTimer.current);
                                            scanTimer.current = setTimeout(async () => {
                                                const code = value.trim();
                                                if (code.length >= 8) {
                                                    try {
                                                        const response = await axios.get(route('apps.pos.search-by-barcode', {
                                                            barcode: code
                                                        }));
                                                        const product = response.data.product;
                                                        if (product) {
                                                            addToCart(product);
                                                            toast('Produk berhasil ditambahkan ke keranjang');
                                                        } else {
                                                            toast('Produk tidak ditemukan');
                                                        }
                                                    } catch (error) {
                                                        console.error('Barcode scan error:', error);
                                                        toast('Gagal mencari produk');
                                                    }
                                                    setScanBarcode('');
                                                    scanInputRef.current?.focus();
                                                }
                                            }, 100);
                                        }}
                                    />
                                )}
                            </div>

                            <div className="mb-4 flex items-center justify-between">
                                {/* Kategori di kiri */}
                                <div className="flex flex-wrap gap-2">
                                    <Button variant={!filters.category ? 'default' : 'outline'} size="sm" onClick={() => handleCategoryChange(null)}>
                                        Semua
                                    </Button>
                                    {categories.map((category, key) => (
                                        <Button
                                            key={key}
                                            variant={String(activeCategory) === String(category.id) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleCategoryChange(category.id)}
                                        >
                                            {category.name}
                                        </Button>
                                    ))}
                                </div>

                                {/* Tombol Paket di kanan */}
                                <div>
                                    <Button size="sm" variant={String(activeCategory) === String('package') ? 'default' : 'outline'} onClick={() => handleCategoryChange('package')}>
                                        Paket
                                    </Button>
                                </div>
                            </div>

                            {/* Produk List */}
                            <div className="min-h-0 flex-1 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                                    {data.items.map((item, key) => (
                                        <button
                                            disabled={item.stock <= 0}
                                            onClick={() => addToCart(item)}
                                            key={key}
                                            className={`relative overflow-hidden rounded-lg border border-border bg-muted shadow-sm transition hover:shadow-md ${item.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {/* Gambar produk */}
                                            <img src={item.image} alt="No Image" className="h-32 w-full object-cover" />

                                            {/* Harga di pojok kanan atas */}
                                            <div className="absolute right-1 top-1 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white shadow">
                                                <sup>Rp</sup> {String(priceItem(item))}
                                            </div>

                                            {/* Nama produk di bawah */}
                                            <div className="absolute bottom-0 left-0 w-full bg-black/60 px-2 py-1 text-white">
                                                <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                                            </div>
                                        </button>


                                    ))}
                                </div>
                            </div>

                            {/* Footer Pagination */}
                            <div className="mt-4 flex items-center justify-start lg:justify-center border-t pt-4 overflow-x-auto">
                                <Pagination links={items.links} />
                            </div>
                        </div>
                    </div>

                    {/* Dialog Produk Mobile */}
                    <Dialog open={data.modalProduct} onOpenChange={(open) => setData('modalProduct', open)}>
                        <DialogContent className="max-w-full max-h-[90vh] p-4 overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Pilih Produk</DialogTitle>
                                <DialogDescription className="sr-only">Pilih produk yang akan dipesan</DialogDescription>
                            </DialogHeader>
                            <div className="mb-4 flex items-center gap-1 transition-all">
                                {/* Input Cari Produk */}
                                {activeInput === 'barcode' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('search');
                                            setTimeout(() => document.getElementById('searchInput')?.focus(), 50);
                                        }}
                                        className="p-2 rounded-md border hover:bg-accent"
                                        title="Cari produk"
                                    >
                                        <Search className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                ) : (
                                    <Input
                                        id="searchInput"
                                        type="text"
                                        placeholder="Cari produk berdasarkan nama/barcode/sku"
                                        className="flex-1 transition-all"
                                        value={data.filters.search || ''}
                                        onFocus={() => setActiveInput('search')}
                                        onChange={(e) => handleFilterSearch(e)}
                                    />
                                )}

                                {/* Input Scan Barcode */}
                                {activeInput === 'search' ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveInput('barcode');
                                                setTimeout(() => {
                                                    setShowCamera(true);
                                                }, 100);
                                            }}
                                            className="p-2 rounded-md border hover:bg-accent"
                                            title="Scan barcode dengan kamera"
                                        >
                                            <ScanBarcodeIcon className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1">
                                        <Input
                                            type="text"
                                            placeholder="Scan barcode"
                                            className="w-full transition-all"
                                            value={scanBarcode}
                                            ref={scanInputRef}
                                            onFocus={() => setActiveInput('barcode')}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setScanBarcode(value);
                                                if (scanTimer.current) clearTimeout(scanTimer.current);
                                                scanTimer.current = setTimeout(async () => {
                                                    const code = value.trim();
                                                    if (code.length >= 8) {
                                                        try {
                                                            const response = await axios.get(route('apps.pos.search-by-barcode', {
                                                                barcode: code
                                                            }));
                                                            const product = response.data.product;
                                                            if (product) {
                                                                addToCart(product);
                                                                toast('Produk berhasil ditambahkan ke keranjang');
                                                            } else {
                                                                toast('Produk tidak ditemukan');
                                                            }
                                                        } catch (error) {
                                                            console.error('Barcode scan error:', error);
                                                            toast('Gagal mencari produk');
                                                        }
                                                        setScanBarcode('');
                                                        scanInputRef.current?.focus();
                                                    }
                                                }, 100);
                                            }}
                                        />

                                        {/* Tampilkan Kamera setelah input scan */}
                                        {showCamera && (
                                            <div className="relative mt-2 border p-2 rounded-md bg-background z-50">
                                                <div className="w-full h-[200px] overflow-hidden rounded-md">
                                                    <BarcodeScannerHtml5
                                                        onScanSuccess={async (code) => {
                                                            try {
                                                                const response = await axios.get(route('apps.pos.search-by-barcode', {
                                                                    barcode: code,
                                                                }));
                                                                const product = response.data.product;
                                                                if (product) {
                                                                    addToCart(product);
                                                                    toast('Produk berhasil ditambahkan ke keranjang');
                                                                } else {
                                                                    toast('Produk tidak ditemukan');
                                                                }
                                                            } catch (error) {
                                                                console.error('Barcode scan error:', error);
                                                                toast('Gagal mencari produk');
                                                            }
                                                        }}

                                                    />
                                                </div>
                                                <button
                                                    className="absolute top-1 right-1 text-sm px-2 py-1 bg-red-500 text-white rounded"
                                                    onClick={() => setShowCamera(false)}
                                                >
                                                    Tutup
                                                </button>
                                                <div className="text-sm text-muted-foreground text-center mt-2">
                                                    Arahkan kamera ke barcode produk
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                            <div className="mb-4 flex items-center justify-between gap-4 flex-col-reverse">
                                {/* Kategori di kiri */}
                                <div className="flex flex-wrap gap-2">
                                    <Button variant={!filters.category ? 'default' : 'outline'} size="sm" onClick={() => handleCategoryChange(null)}>
                                        Semua
                                    </Button>
                                    {categories.map((category, key) => (
                                        <Button
                                            key={key}
                                            variant={String(activeCategory) === String(category.id) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleCategoryChange(category.id)}
                                        >
                                            {category.name}
                                        </Button>
                                    ))}
                                </div>

                                {/* Tombol Paket di kanan */}
                                <div>
                                    <Button size="sm" variant={String(activeCategory) === String('package') ? 'default' : 'outline'} onClick={() => handleCategoryChange('package')}>
                                        Paket
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[60vh]">
                                {data.items.map((item, key) => (
                                    <button
                                        disabled={item.stock <= 0}
                                        key={key}
                                        onClick={() => addToCart(item)}
                                        className={`relative h-36 cursor-pointer overflow-hidden rounded-lg border border-border bg-muted shadow-sm transition hover:shadow-md ${item.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {/* Gambar Produk */}
                                        <img
                                            src={item.image}
                                            alt="No Image"
                                            className="h-full w-full object-cover"
                                        />

                                        {/* Harga di kanan atas */}
                                        <div className="absolute right-1 top-1 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white shadow">
                                            <sup>Rp</sup> {String(priceItem(item))}
                                        </div>

                                        {/* Nama Produk di bawah */}
                                        <div className="absolute bottom-0 left-0 w-full bg-black/60 px-2 py-1 text-white">
                                            <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {/* Footer Pagination */}
                            <div className="mt-4 flex items-center justify-start lg:justify-center border-t pt-4 overflow-x-auto">
                                <Pagination links={items.links} />
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Pembayaran */}
                    <Dialog open={data.modalPayment} onOpenChange={() => setData('modalPayment', !data.modalPayment)}>
                        <DialogContent className="w-full max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="sr-only">Pembayaran</DialogTitle>
                                <DialogDescription className="sr-only">
                                    Detail pembayaran dan metode bayar.
                                </DialogDescription>
                                <div className="border-border flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Total</p>
                                        <p className="text-foreground text-lg font-semibold">Rp {data.grandTotal}</p>
                                    </div>

                                    <div>
                                        <p className="text-muted-foreground text-sm">Uang Kembalian</p>
                                        <p className="text-foreground text-lg font-semibold">Rp {data.return}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-yellow-600">Sisa Bayar</p>
                                        <p className="text-lg font-semibold text-yellow-700">Rp {data.remains}</p>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Tombol pilihan metode */}
                                <div>
                                    <Label>Metode Pembayaran</Label>
                                    <div className="mt-1 flex gap-2">
                                        <Button variant={data.selectedPaymentMethod === 'tunai' ? 'default' : 'outline'} onClick={() => setData('selectedPaymentMethod', 'tunai')}>
                                            Tunai
                                        </Button>
                                        <Button variant={data.selectedPaymentMethod === 'transfer' ? 'default' : 'outline'} onClick={() => setData('selectedPaymentMethod', 'transfer')}>
                                            Transfer
                                        </Button>
                                    </div>
                                </div>

                                {data.selectedPaymentMethod === 'transfer' && (
                                    <div className="space-y-3">
                                        <Label className="text-foreground block text-sm font-medium">Pilih Bank</Label>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {banks.map((bank, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setData('selectedBank', bank.bank_name)}
                                                    className={`w-full rounded-lg border px-4 py-3 text-left transition ${data.selectedBank === bank.bank_name
                                                        ? 'border-primary bg-primary/10 ring-primary ring-1'
                                                        : 'border-border bg-muted hover:bg-muted/70'
                                                        } `}
                                                >
                                                    <p className="text-foreground font-semibold uppercase">{bank.bank_name}</p>
                                                    <p className="text-muted-foreground mt-1 text-sm">
                                                        {bank.account_number} a/n {bank.account_name}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                        <div>
                                            <Label htmlFor="jumlahBayar">Jumlah Bayar</Label>
                                            <Input id="jumlahBayar" type="text" placeholder="Masukkan nominal" className="mt-1" value={data.pay || ''} onChange={(e) => setData('pay', Number(e.target.value))} />
                                        </div>
                                    </div>
                                )}

                                {data.selectedPaymentMethod === 'tunai' &&
                                    <>
                                        {/* Input jumlah bayar */}
                                        <div>
                                            <Label htmlFor="jumlahBayar">Jumlah Bayar</Label>
                                            <Input id="jumlahBayar" type="text" placeholder="Masukkan nominal" className="mt-1" value={data.pay || ''} onChange={(e) => setData('pay', Number(e.target.value))} />
                                        </div>

                                        {/* Tombol nominal bantuan */}
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {[10000, 20000, 50000, 100000].map((nominal) => (
                                                <Button
                                                    key={nominal}
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            pay: Number(prev.pay || 0) + nominal,
                                                        }))
                                                    }
                                                >
                                                    +Rp {nominal.toLocaleString()}
                                                </Button>
                                            ))}

                                        </div>
                                    </>
                                }
                                <form onSubmit={storeData}>
                                    <Button className="w-full" type='submit' disabled={processing || data.selectedPaymentMethod == ''}>Selesaikan Transaksi</Button>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog customer */}
                    <Dialog open={data.modalCustomer} onOpenChange={() => setData('modalCustomer', !data.modalCustomer)}>
                        <DialogContent className="max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Pilih Pelanggan</DialogTitle>
                                <DialogDescription>Silakan pilih pelanggan dari daftar berikut atau tambahkan baru.</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full" onClick={() => setData('newModalCustomer', !data.newModalCustomer)}>
                                    + Tambah Pelanggan Baru
                                </Button>

                                <Input
                                    type="text"
                                    placeholder="Cari nama pelanggan..."
                                    className="border-border focus:ring-primary mb-2 rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                                    value={data.searchCustomer}
                                    onChange={(e) => {
                                        setData('searchCustomer', e.target.value);
                                        debouncedGetListCustomer();
                                    }}
                                />
                                {data.customers.length > 0 &&
                                    <ul className="max-h-40 overflow-y-auto rounded-md border p-2">
                                        {data.customers.map((customer, key) => (
                                            <li key={key} className="hover:bg-muted cursor-pointer rounded p-2" onClick={() => handleSelectCustomer(customer)}>
                                                {customer.name} - {customer.phone}
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog new customer */}
                    <Dialog open={data.newModalCustomer} onOpenChange={() => setData('newModalCustomer', !data.newModalCustomer)}>
                        <DialogContent className="max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Tambah Pelanggan</DialogTitle>
                                <DialogDescription>Form ini digunakan untuk menambahkan data pelanggan</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={storeCustomer}>
                                <div className='mb-4 flex flex-col gap-2'>
                                    <Label htmlFor="harga">Nama<span className='text-rose-500'>*</span></Label>
                                    <Input type='text' value={data.newCust.name || ''} onChange={(e) => setData('newCust.name', e.target.value)} placeholder='Masukan nama pelanggan' />
                                </div>
                                <div className='mb-4 flex flex-col gap-2'>
                                    <Label htmlFor="harga">Nomor Hp<span className='text-rose-500'>*</span></Label>
                                    <Input type="number" value={data.newCust.phone || ''} onChange={(e) => setData('newCust.phone', e.target.value)} placeholder='Masukan nomor hp pelanggan' />
                                </div>
                                <div className='mb-4 flex flex-col gap-2'>
                                    <Label htmlFor="harga">Email</Label>
                                    <Input type='email' value={data.newCust.email || ''} onChange={(e) => setData('newCust.email', e.target.value)} placeholder='Masukan email pelanggan' />
                                </div>
                                <div className='mb-4 flex flex-col gap-2'>
                                    <Label htmlFor="harga">Alamat</Label>
                                    <Textarea rows={5} value={data.newCust.address} onChange={(e) => setData('newCust.address', e.target.value)} placeholder='Masukan alamat pelanggan' />
                                </div>
                                <div className='flex'>
                                    <Button>Simpan</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Item */}
                    <Dialog open={data.modalItem} onOpenChange={(open) => {
                        if (!open) {
                            setData((prev: any) => ({
                                ...prev,
                                modalItem: false,
                                selectedItem: {
                                    name: '',
                                    quantity: 0,
                                    price: 0,
                                    discount_type: '',
                                    discount: '',
                                    note: '',
                                    type: '',
                                    total_price: 0,
                                    stock: 0,
                                },
                            }));
                        } else {
                            setData('modalItem', true);
                        }
                    }}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit: {data.selectedItem.name}</DialogTitle>
                                <DialogDescription>
                                    Ubah harga, jumlah, diskon (auto/manual), atau tambahkan catatan.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-2 space-y-4">
                                {/* Harga Normal */}
                                <div>
                                    <Label htmlFor="harga">Harga Normal (Rp)</Label>
                                    <Input
                                        id="harga"
                                        type="number"
                                        value={data.selectedItem.price}
                                        onChange={(e) => setData('selectedItem.price', Number(e.target.value))}
                                        placeholder="Contoh: 15000"
                                    />
                                </div>

                                {/* Quantity */}
                                <div>
                                    <Label htmlFor="qty">Jumlah</Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        value={data.selectedItem.quantity}
                                        onChange={(e) => setData('selectedItem.quantity', Number(e.target.value))}
                                        placeholder="Contoh: 2"
                                    />
                                </div>

                                {/* Diskon */}
                                <div className="space-y-2">
                                    <Label>Diskon</Label>

                                    <div className="flex gap-2">
                                        <Select
                                            value={data.selectedItem.discount_type ?? ''}
                                            onValueChange={(value) => {
                                                if (value === 'auto') {
                                                    setData('selectedItem.discount_type', '');
                                                    setData('selectedItem.discount', '');
                                                } else {
                                                    setData('selectedItem.discount_type', value);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-36">
                                                <SelectValue placeholder="Auto (Promo)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="auto">Auto (Promo)</SelectItem>
                                                <SelectItem value="nominal">Rp</SelectItem>
                                                <SelectItem value="percentage">%</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            type="number"
                                            value={data.selectedItem.discount ?? ''}
                                            onChange={(e) => setData('selectedItem.discount', e.target.value)}
                                            placeholder={
                                                data.selectedItem.discount_type === 'percentage'
                                                    ? 'Contoh: 10'
                                                    : 'Contoh: 2000'
                                            }
                                            className="flex-1"
                                            disabled={!data.selectedItem.discount_type}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Pilih <b>Auto (Promo)</b> untuk memakai diskon secara otomatis. Pilih <b>Rp</b> atau <b>%</b> untuk input manual.
                                    </p>
                                </div>

                                {/* Catatan */}
                                <div>
                                    <Label htmlFor="catatan">Catatan Produk</Label>
                                    <Input
                                        id="catatan"
                                        type="text"
                                        value={data.selectedItem.note ?? ''}
                                        onChange={(e) => setData('selectedItem.note', e.target.value)}
                                        placeholder="Contoh: Tidak pedas"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <Button variant="destructive" onClick={() => removeFromCart(data.selectedItem)}>
                                    Hapus Item
                                </Button>

                                <Button
                                    onClick={() => {
                                        const typeRaw = data.selectedItem.discount_type ?? '';
                                        const mappedType =
                                            typeRaw === 'percentage' ? 'percentage' : (typeRaw as '' | 'nominal' | 'percentage');

                                        handleUpdateCartItem(
                                            data.selectedItem,
                                            Number(data.selectedItem.quantity),
                                            String(data.selectedItem.price),
                                            mappedType,
                                            String(data.selectedItem.discount ?? ''),
                                            String(data.selectedItem.note ?? '')
                                        );
                                    }}
                                >
                                    Simpan
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Diskon */}
                    <Dialog open={data.modalDiscount} onOpenChange={() => setData('modalDiscount', !data.modalDiscount)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Diskon</DialogTitle>
                                <DialogDescription>Masukkan kode diskon atau set diskon manual</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Kode Diskon */}
                                <div className="space-y-1">
                                    <Label>Kode Diskon</Label>
                                    <Input placeholder="Contoh: HEMAT10" value={data.discounts.code || ''} onChange={(e) => setData('discounts.code', e.target.value)} />
                                </div>

                                {/* Tipe dan Nilai Diskon */}
                                <div className="space-y-1">
                                    <Label>Diskon</Label>
                                    <div className="flex gap-2">
                                        <Select value={data.discounts.discount_type} onValueChange={(value) => setData('discounts.discount_type', value)}>
                                            <SelectTrigger className="w-28">
                                                <SelectValue placeholder="Tipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="nominal">Rp</SelectItem>
                                                <SelectItem value="persen">%</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Input type="text" placeholder="Contoh: 2000 atau 10" className="flex-1" value={data.discounts.discount_amount || ''} onChange={(e) => setData('discounts.discount_amount', Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <Button onClick={() => applyDiscount()}>
                                        Simpan
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Catatan */}
                    <Dialog open={data.modalNote} onOpenChange={() => setData('modalNote', !data.modalNote)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Catatan untuk Pesanan</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* No Referensi */}
                                <div>
                                    <Label htmlFor="noReferensi">No Referensi</Label>
                                    <Input id="noReferensi" placeholder="Contoh: INV-00123" value={data.notes.no_ref || ''} onChange={(e) => setData('notes.no_ref', e.target.value)} />
                                </div>

                                {/* Sumber Transaksi */}
                                <div>
                                    <Label htmlFor="sumberTransaksi">Sumber Transaksi</Label>
                                    <Input id="sumberTransaksi" placeholder="Contoh: Tokopedia, Shopee, dll." value={data.notes.transaction_source || ''} onChange={(e) => setData('notes.transaction_source', e.target.value)} />
                                </div>
                                {/* Catatan */}
                                <div>
                                    <Label htmlFor="catatan">Catatan</Label>
                                    <Textarea id="catatan" placeholder="Contoh: Tidak pedas, tambahkan sambal, dll." rows={4} value={data.notes.note} onChange={(e) => setData('notes.note', e.target.value)} />
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <Button onClick={() => setData('modalNote', !data.modalNote)}>
                                        Simpan
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Pengiriman */}
                    <Dialog open={data.modalDelivery} onOpenChange={() => setData('modalDelivery', !data.modalDelivery)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Informasi Pengiriman</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                                <Label htmlFor="ekspedisi">Nama Ekspedisi</Label>
                                <Input id="ekspedisi" placeholder="Contoh: JNE, J&T, Sicepat" value={data.delivery.name || ''} onChange={(e) => setData('delivery.name', e.target.value)} />

                                <Label htmlFor="resi">No Resi</Label>
                                <Input id="resi" placeholder="Contoh: JP1234567890" value={data.delivery.no_resi || ''} onChange={(e) => setData('delivery.no_resi', e.target.value)} />

                                <Label htmlFor="alamat">Alamat Pengiriman</Label>
                                <Textarea id="alamat" placeholder="Alamat lengkap pengiriman" rows={3} value={data.delivery.address} onChange={(e) => setData('delivery.address', e.target.value)} />

                                <Label htmlFor="catatan">Catatan untuk Kurir</Label>
                                <Input id="catatan" placeholder="Contoh: Lewat pintu belakang" value={data.delivery.note || ''} onChange={(e) => setData('delivery.note', e.target.value)} />

                                {/* Status Pengiriman */}
                                <div>
                                    <Label htmlFor="status-pengiriman">Status Pengiriman</Label>
                                    <Select value={data.delivery.status} onValueChange={(e) => setData('delivery.status', e)}>
                                        <SelectTrigger id="status-pengiriman">
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Belum Dikirim</SelectItem>
                                            <SelectItem value="shipped">Sedang Dikirim</SelectItem>
                                            <SelectItem value="delivered">Sampai Tujuan</SelectItem>
                                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <Button onClick={() => setData('modalDelivery', !data.modalDelivery)}>
                                        Simpan
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Pelayan */}
                    <Dialog open={data.modalCashier} onOpenChange={() => setData('modalCashier', !data.modalCashier)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Pilih Pelayan</DialogTitle>
                                <DialogDescription className="sr-only">Pilih pelayan yang melayani pesanan ini</DialogDescription>
                            </DialogHeader>
                            <div className="mt-2 flex flex-col gap-2">
                                <Label htmlFor="pelayan">Nama Pelayan</Label>
                                <Select value={data.cashierId} onValueChange={(value) => setData('cashierId', value)}>
                                    <SelectTrigger id="pelayan">
                                        <SelectValue placeholder="Pilih pelayan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cashiers.map((option) => (
                                            <SelectItem key={option.id} value={option.id}>
                                                {option.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <Button onClick={() => setData('modalCashier', !data.modalCashier)}>
                                    Simpan
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog after transaction*/}
                    <Dialog open={data.modalTransaction}>
                        <DialogContent>
                            <DialogHeader className="sr-only">
                                <DialogTitle>Transaksi Berhasil</DialogTitle>
                                <DialogDescription>Detail transaksi yang baru saja selesai.</DialogDescription>
                            </DialogHeader>
                            <div className='flex flex-col items-center justify-center'>
                                <CheckCircle2 className='w-20 h-20 text-teal-500' />
                                <div className='font-bold mt-4 text-2xl'>Transaksi Berhasil !</div>
                                <div className='text-gray-500 mt-2'>Transaki telah berhasil proses</div>
                            </div>
                            <Card className='rounded-xl bg-secondary w-full mt-4'>
                                <CardContent>
                                    <div className='flex flex-col gap-4'>
                                        <div className='flex items-center justify-between gap-4'>
                                            <div className='font-semibold text-sm text-gray-400'>Np Transaksi</div>
                                            <div>{data.lastTransaction.invoice}</div>
                                        </div>
                                        <div className='flex items-center justify-between gap-4'>
                                            <div className='font-semibold text-sm text-gray-400'>Total Bayar</div>
                                            <div><sup>Rp</sup> {data.lastTransaction.pay}</div>
                                        </div>
                                        <div className='flex items-center justify-between gap-4'>
                                            <div className='font-semibold text-sm text-gray-400'>Kembalian</div>
                                            <div><sup>Rp</sup> {data.lastTransaction.return}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className='flex flex-col gap-2 mt-4'>
                                {/* Browser Print - with logo & full layout */}
                                <div className='flex flex-row gap-2 items-center w-full'>
                                    <Button type='button' onClick={() => handlePrint()} variant={'outline'} className='w-full'>
                                        <Printer className='size-4' /> Cetak (dengan Logo)
                                    </Button>
                                </div>
                                {/* Bluetooth/QZ Tray Print - faster, no popup */}
                                <div className='flex flex-row gap-2 items-center w-full'>
                                    <PrintBluetoothButton 
                                        invoice={data?.lastTransaction?.invoice} 
                                        endpoint={route("apps.pos.print-receipt-bluetooth", data?.lastTransaction?.invoice)} 
                                    />
                                    <PrintKitchenBluetoothButton 
                                        invoice={data?.lastTransaction?.invoice} 
                                        endpoint={route("apps.pos.print-kitchen-bluetooth", data?.lastTransaction?.invoice)} 
                                    />
                                </div>
                            </div>
                            <div className='flex flex-row gap-2 items-center mt-4'>
                                <Button type='button' onClick={() => handleCloseTable()} variant={'default'} className='w-full' disabled={data.lastTransaction.transaction_type != 'dine_in'}>
                                    <Eraser className='size-4' /> Kosongkan Meja
                                </Button>
                                <Button variant={'secondary'} className='w-full' onClick={() => handleKitchen()}>
                                    <Check className='size-4' /> Selesai
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </PosLayout>
            }
        </>
    );
}
