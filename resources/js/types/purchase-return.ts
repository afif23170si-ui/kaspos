import { Order } from "./order";
import { PurchaseReturnDetail } from "./purchase-return-detail";

export interface PurchaseReturn {
    id: string;
    order_id: string;
    order: Order;
    details: PurchaseReturnDetail[]
    return_code: string;
    return_date: string;
    grand_total: number;
    refund_method: string;
    notes: string;
    status: string;
    created_by: string;
    [key: string]: unknown;
}

export interface PurchaseReturnLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
