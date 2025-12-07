import { DiscountPackageItem } from "./discount-package-item";

export interface DiscountPackage {
    id: string;
    image: string;
    name: string;
    total_price: string;
    is_active: string;
    discount_package_items: DiscountPackageItem[];
    [key: string]: unknown;
}

export interface DiscountPackageLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
