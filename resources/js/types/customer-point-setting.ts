export interface CustomerPointSetting {
    id: string;
    spend_amount: string;
    point_earned: string;
    expired_in_days: string;
    is_active: boolean;
    [key: string]: unknown;
}

export interface CustomerPointSettingLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
