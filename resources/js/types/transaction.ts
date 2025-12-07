import { Coupon } from './coupon';
import { User } from ".";
import { CashierShift } from "./cashier-shift";
import { Customer } from "./customer";
import { Table } from "./table";
import { TransactionDetail } from './transaction-detail';

export interface Transaction {
    id: string;
    invoice: string;
    cashier_shift_id: string;
    cashier_shift: CashierShift;
    customer_id: string;
    customer: Customer;
    waiter_id: string;
    waiter: User;
    transaction_type: string;
    table_id: string;
    table: Table;
    platform: string;
    coupon_id: string;
    coupon: Coupon;
    status: string;
    notes_noref: string;
    notes_transaction_source: string;
    notes_note: string;
    shipping_name: string;
    shipping_ref: string;
    shipping_address: string;
    shipping_note: string;
    shipping_status: string;
    payment_method: string;
    subtotal: number;
    discount: number;
    pay: number;
    change: number;
    grand_total: number;
    transaction_date: string;
    transaction_details: TransactionDetail[];
    [key: string]: unknown;
}

export interface TransactionLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
