import { TransactionDetail } from "./transaction-detail";
import { TransactionReturn } from "./transaction-return";

export interface TransactionReturnDetail {
    id: string;
    transaction_return_id: string;
    transaction_return: TransactionReturn
    transaction_detail_id: string;
    transaction_detail: TransactionDetail
    quantity: number;
    reason: string;
    [key: string]: unknown;
}

export interface TransactionReturnDetailLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
