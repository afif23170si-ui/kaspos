import { Transaction } from "./transaction";

export interface TransactionDetail {
    id: string;
    transaction: Transaction;
    items_id: string;
    items_type: string;
    [key: string]: unknown;
}

export interface TransactionDetailLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
