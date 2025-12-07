import { ExpenseCategory } from "./expense-category";

export interface ExpenseSubcategory {
    id: string;
    expense_category_id: string;
    expense_category: ExpenseCategory
    name: string;
    [key: string]: unknown;
}

export interface ExpenseSubcategoryLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
