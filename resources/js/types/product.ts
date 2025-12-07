import { Category } from "./category";
import { ProductVariant } from "./product-variant";

export interface Product {
    id: string;
    sku: string;
    name: string;
    category_id: string;
    category: Category;
    variants: ProductVariant[];
    image: string;
    description: string;
    initial_stock: {
        quantity: string;
        expired_at: string;
    }
    has_stock: boolean;
    has_variant: boolean;
    [key: string]: unknown;
}

export interface ProductLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
