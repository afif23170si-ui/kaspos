export interface Coupon {
    id: string;
    code: string;
    type: string;
    value: string;
    is_active: string;
    [key: string]: unknown;
}

export interface CouponLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
