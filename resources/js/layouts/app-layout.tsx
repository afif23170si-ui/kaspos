import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { useEffect, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import InstallPrompt from "@/components/InstallPrompt";


interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const [layout, setLayout] = useState<'sidebar' | 'header'>('sidebar');

    useEffect(() => {
        const saved = localStorage.getItem('appLayout') as 'sidebar' | 'header' | null;
        setLayout(saved || 'sidebar');
    }, []);

    const LayoutComponent = layout === 'header' ? AppHeaderLayout : AppSidebarLayout;

    return (
        <LayoutComponent breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster/>
            <InstallPrompt />
        </LayoutComponent>
    );
}
