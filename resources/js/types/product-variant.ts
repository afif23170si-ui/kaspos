import { Unit } from '@/types/unit';
import { Product } from './product';
import { ProductVariantValue } from './product-variant-value';

export interface ProductVariant {
    id: string;
    product_id: string;
    product: Product
    barcode: string;
    unit_id: string;
    unit: Unit;
    price: number;
    capital_price: number;
    minimum_quantity: string;
    product_variant_values: ProductVariantValue[]
    initial_stock: {
        quantity: string;
        expired_at: string;
    }
    [key: string]: unknown;
}

export interface ProductVariantLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
