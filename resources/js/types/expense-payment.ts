import { BankAccount } from "./bank";
import { Expense } from "./expenses";
export interface ExpensePayment {
    id: string;
    expense_id: string;
    expense: Expense;
    bank_account: BankAccount;
    paid_at: string;
    amount: string;
    payment_method: string;
    payment_date: string;
    [key: string]: unknown;
}

export interface ExpensePaymentLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
