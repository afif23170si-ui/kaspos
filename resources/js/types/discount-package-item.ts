import { DiscountPackage } from '@/types/discount-package';

export interface DiscountPackageItem {
    id: string;
    discount_package: DiscountPackage;
    items_id: string;
    items_type: string;
    estimate_price: string;
    [key: string]: unknown;
}

export interface DiscountPackageItemLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
