import { Category } from "./category";
import { Receipe } from "./receipe";

export interface Menu {
    id: string;
    name: string;
    category_id: string;
    category: Category
    capital_price: number;
    selling_price: number;
    margin: number;
    receipes: Receipe[]
    image: string;
    [key: string]: unknown;
}

export interface MenuLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
