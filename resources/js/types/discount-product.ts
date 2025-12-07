import { DiscountProductCustomer } from "./discount-product-customer";
import { DiscountProductItem } from "./discount-product-item";

export interface DiscountProduct {
    id: string;
    discount_name: string;
    discount_type: string;
    discount_value: string;
    discount_quantity: string;
    all_products: string;
    all_customers: string;
    is_active: boolean
    discount_product_items: DiscountProductItem[];
    discount_product_customers: DiscountProductCustomer[];
    [key: string]: unknown;
}

export interface DiscountProductLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
