import { User } from ".";
import { ExpenseCategory } from "./expense-category";
import { ExpensePayment } from "./expense-payment";
import { ExpenseSubcategory } from "./expense-subcategory";

export interface Expense {
    id: string;
    expensee_number: string;
    reference_number: string;
    date: string;
    expense_category_id: string;
    expense_category: ExpenseCategory
    expense_subcategory_id: string;
    expense_subcategory: ExpenseSubcategory
    amount: number;
    payment_status: string;
    description: string;
    file: string;
    expense_payments: ExpensePayment[]
    user_created: User;
    total_payment: number;
    remaining_payment: number;
    [key: string]: unknown;
}

export interface ExpenseLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
