export interface ExpenseCategory {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface ExpenseCategoryLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
