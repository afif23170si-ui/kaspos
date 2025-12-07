import { User } from ".";
import { OrderDetail } from "./order-detail";
import { OrderPayment } from "./order-payment";
import { PurchaseReturn } from "./purchase-return";
import { Supplier } from "./supplier";

export interface Order {
    id: string;
    supplier_id: string;
    supplier: Supplier;
    order_code: string;
    order_date: string;
    type: string;
    discount_type: string;
    subtotal: number;
    notes: string;
    grand_total: number;
    discount: string;
    created_by: User;
    order_details: OrderDetail[]
    order_status: string;
    order_payments: OrderPayment[];
    payment_status: string;
    total_payment: number;
    remaining_payment: number;
    purchase_return: PurchaseReturn
    [key: string]: unknown;
}

export interface OrderLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
