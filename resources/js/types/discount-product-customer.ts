import { Customer } from "./customer";
import { DiscountProduct } from "./discount-product";

export interface DiscountProductCustomer {
    id: string;
    discount_product_id: string;
    discount_product: DiscountProduct;
    customer_id: string;
    customer: Customer;
    [key: string]: unknown;
}

export interface DiscountProductCustomerLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
