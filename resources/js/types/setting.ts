export interface Setting {
    id: string;
    code: string;
    name: string;
    value: string;
    is_active: boolean;
    [key: string]: unknown;
}

export interface SettingLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
