import { DiscountPackage } from "./discount-package";
import { DiscountProduct } from "./discount-product";
import { Menu } from "./menu";
import { ProductVariant } from "./product-variant";

export interface DiscountProductItem {
    id: string;
    discount_product_id: string;
    discount_product: DiscountProduct;
    items: Menu | DiscountPackage | ProductVariant;
    [key: string]: unknown;
}

export interface DiscountProductItemLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
