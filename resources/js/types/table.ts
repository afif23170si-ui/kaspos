import { Transaction } from "./transaction";

export interface Table {
    id: string;
    number: string;
    capacity: number;
    status: string;
    transaction: Transaction;
    [key: string]: unknown;
}

export interface TableLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
