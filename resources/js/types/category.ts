export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    [key: string]: unknown;
}

export interface CategoryLink {
    url: string | null;
    label: string;
    active: boolean;
    [key: string]: unknown;
}
