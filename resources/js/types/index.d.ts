import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { Role } from './role';

export interface Auth {
    user: User;
    super: boolean;
    permissions: Record<string, boolean>;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    settings: Setting[];
    [key: string]: unknown;
}

export interface User {
    id: string;
    username: string;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
    [key: string]: unknown;
}

export interface UserLink {
    url: string | null;
    label: string;
    active: boolean;
}
