import { Transaction } from "./transaction";
import { TransactionReturnDetail } from "./transaction-return-detail";

export interface TransactionReturn {
    id: string;
    transaction_id: string;
    transaction: Transaction;
    details: TransactionReturnDetail[]
    return_code: string;
    return_date: string;
    grand_total: number;
    refund_method: string;
    notes: string;
    status: string;
    created_by: string;
    [key: string]: unknown;
}

export interface TransactionReturnLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
