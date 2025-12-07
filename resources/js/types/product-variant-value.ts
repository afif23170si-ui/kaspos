import { ProductVariant } from "./product-variant";
import { VariantValue } from "./variant-value";

export interface ProductVariantValue {
    id: string;
    product_variant_id: string;
    product_variant: ProductVariant
    variant_value_id: string;
    variant_value: VariantValue
    [key: string]: unknown;
}

export interface ProductVariantValueLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
