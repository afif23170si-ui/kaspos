import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import { useEffect, useState } from 'react';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    const [layout, setLayout] = useState<'split' | 'simple' | 'card'>('split');

    useEffect(() => {
        const saved = localStorage.getItem('authLayout') as 'split' | 'simple' | 'card' | null;
        setLayout(saved || 'split');
    }, []);

    const LayoutComponent = layout === 'card' ? AuthCardLayout : layout === 'simple' ? AuthSimpleLayout : AuthSplitLayout;

    return (
        <LayoutComponent title={title} description={description} {...props}>
            {children}
        </LayoutComponent>
    );
}
