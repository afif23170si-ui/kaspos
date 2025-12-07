import { Unit } from "./unit";

export interface Material {
    id: string;
    name: string;
    unit_id: string;
    unit: Unit;
    initial_stock: {
        quantity: string;
        expired_at: string;
    }
    minimum_qty: number;
    price: number;
    capital_price: number;
    [key: string]: unknown;
}

export interface MaterialLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
