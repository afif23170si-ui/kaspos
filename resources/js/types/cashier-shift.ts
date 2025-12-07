import { User } from ".";
import { Shift } from "./shift";

export interface CashierShift {
    id: string;
    shift_id: string;
    shift: Shift;
    user_id: string;
    user: User
    starting_cash: number;
    ending_cash: number;
    opened_at: string;
    closed_at: string;
    status: string;
    [key: string]: unknown;
}

export interface CashierShiftLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
