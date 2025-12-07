import { User } from ".";
import { CheckingStockDetail } from "./checking-stock-detail";

export interface CheckingStock {
    id: string;
    no_ref: string;
    due_date: string;
    user_id: string;
    user: User;
    type: string;
    status: string;
    note: string;
    details_count: string;
    diffrence: number;
    diffrence_price: number;
    details: CheckingStockDetail[]
    summary: {
        total_checked: number;
        item_with_difference: number;
        stock_excess: number;
        stock_lack: number;
        potential_loss: number;
        potential_gain: number;
    }
    [key: string]: unknown;
}

export interface CheckingStockLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
