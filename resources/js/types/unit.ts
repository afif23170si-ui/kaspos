export interface Unit {
    id: string;
    name: string;
    description: string;
    [key: string]: unknown;
}

export interface UnitLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
