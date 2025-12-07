export interface VariantOption {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface VariantOptionLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
