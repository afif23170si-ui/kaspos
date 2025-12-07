export interface Supplier {
    id: string;
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
    banks_count: number;
    [key: string]: unknown;
}

export interface SupplierLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
