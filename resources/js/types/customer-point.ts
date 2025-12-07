import { Customer } from "./customer";
import { Transaction } from "./transaction";

export interface CustomerPoint {
    id: string;
    transaction_id: string;
    transaction: Transaction;
    customer_id: string;
    customer: Customer;
    point: number;
    status: string;
    change_date: string;
    [key: string]: unknown;
}

export interface CustomerPointLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
