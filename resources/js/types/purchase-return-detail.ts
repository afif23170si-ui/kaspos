import { OrderDetail } from "./order-detail";
import { PurchaseReturn } from "./purchase-return";
;

export interface PurchaseReturnDetail {
    id: string;
    purchase_return_id: string;
    purchase_return: PurchaseReturn
    order_detail_id: string;
    order_detail: OrderDetail
    quantity: number;
    reason: string;
    total_price: number;
    expired_at: string;
    [key: string]: unknown;
}

export interface PurchaseReturnDetailLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
