import { BankAccount } from "./bank";
import { Order } from "./order";
export interface OrderPayment {
    id: string;
    order_id: string;
    order: Order;
    bank_account: BankAccount;
    paid_at: string;
    amount: string;
    payment_method: string;
    payment_date: string;
    [key: string]: unknown;
}

export interface OrderPaymentLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
