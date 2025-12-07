import { CustomerPoint } from "./customer-point";

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    available_points: number;
    address: string;
    customer_points: CustomerPoint[]
    [key: string]: unknown;
}

export interface CustomerLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
