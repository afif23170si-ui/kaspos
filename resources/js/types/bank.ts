export interface BankAccount {
    id: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    [key: string]: unknown;
}

export interface BankAccountLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
