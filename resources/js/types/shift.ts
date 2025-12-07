export interface Shift {
    id: string;
    code: string;
    name: string;
    start_time: string;
    end_time: string;
    [key: string]: unknown;
}

export interface ShiftLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
