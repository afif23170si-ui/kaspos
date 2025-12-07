import { Order } from "./order";

export interface OrderDetail {
    id: string;
    order_id: string;
    order : Order;
    items_id: string;
    quantity: number;
    price: number;
    expired_at: string;
    total_price: string;
    [key: string]: unknown;
}

export interface OrderDetailLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
