import { Material } from "./material";
import { Menu } from "./menu";

export interface Receipe {
    id: string;
    menu_id: string;
    menu: Menu;
    material_id: string;
    material: Material
    quantity: number;
    price: number;
    total_price: number;
    [key: string]: unknown;
}

export interface ReceipeLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
