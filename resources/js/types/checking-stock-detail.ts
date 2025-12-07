import { CheckingStock } from "./checking-stock";
import { Material } from "./material";
import { Product } from "./product";

export interface CheckingStockDetail {
    id: string;
    checking_stock_id: string;
    checking_stock: CheckingStock
    items_id: string;
    items: Product | Material;
    quantity: number;
    stock: number;
    price: number;
    diffrence: number;
    diffrence_price: number;
    note: string;
    [key: string]: unknown;
}

export interface CheckingStockDetailLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
