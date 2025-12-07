import { TransactionDetail } from "./transaction-detail";
import { TransactionKitchen } from "./transaction-kitchen";

export interface TransactionKitchenItem {
    id: string;
    transaction_kitchen_id: string;
    transction_kitchen: TransactionKitchen;
    transaction_detail_id: string;
    transaction_detail: TransactionDetail;
    is_done: boolean;
    [key: string]: unknown;
}

export interface TransactionKitchenItemLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
