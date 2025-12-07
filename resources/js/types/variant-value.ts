import { VariantOption } from "./variant-option";

export interface VariantValue {
    id: string;
    name: string;
    variant_option_id: string;
    variant_option: VariantOption
    [key: string]: unknown;
}

export interface VariantValueLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
