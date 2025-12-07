export interface Permission {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface PermissionLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
