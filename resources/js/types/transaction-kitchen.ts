import { Transaction } from "./transaction";
import { TransactionKitchenItem } from "./transactionKitchenItem";

export interface TransactionKitchen {
    id: number;
    transaction: Transaction;
    status: string;
    transaction_kitchen_items: TransactionKitchenItem[];
    transaction_date: string;
    [key: string]: unknown;
}

export interface TransactionKitchenLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
