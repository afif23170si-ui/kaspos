import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';
export type AuthLayoutOption = 'split' | 'simple' | 'card';
export type AppLayoutOption = 'sidebar' | 'header';
export type FontFamilyOption = 'font-sans' | 'font-inter' | 'font-poppins' | 'font-roboto' | 'font-figtree';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');
    const [authLayout, setAuthLayout] = useState<AuthLayoutOption>('split');
    const [appLayout, setAppLayout] = useState<AppLayoutOption>('sidebar');
    const [fontFamily, setFontFamily] = useState<FontFamilyOption>('font-sans');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);
    }, []);

    const updateAuthLayout = useCallback((layout: AuthLayoutOption) => {
        setAuthLayout(layout);
        localStorage.setItem('authLayout', layout);
        setCookie('authLayout', layout);
    }, []);

    const updateAppLayout = useCallback((layout: AppLayoutOption) => {
        setAppLayout(layout);
        localStorage.setItem('appLayout', layout);
        setCookie('appLayout', layout);
    }, []);

    const updateFontFamily = useCallback((font: FontFamilyOption) => {
        setFontFamily(font);
        localStorage.setItem('fontFamily', font);
        setCookie('fontFamily', font);

        // Update class di <body>
        const body = document?.getElementById('body');
        if (body) {
            body.classList.remove('font-sans', 'font-inter', 'font-poppins', 'font-roboto', 'font-figtree');
            body.classList.add(font);
        }
    }, []);

    useEffect(() => {
        const savedAppearance = (localStorage.getItem('appearance') as Appearance | null) || 'system';
        const savedAuthLayout = (localStorage.getItem('authLayout') as AuthLayoutOption | null) || 'split';
        const savedAppLayout = (localStorage.getItem('appLayout') as AppLayoutOption | null) || 'sidebar';
        const savedFont = (localStorage.getItem('fontFamily') as FontFamilyOption) || 'font-sans';

        updateAppearance(savedAppearance);
        setAuthLayout(savedAuthLayout);
        setAppLayout(savedAppLayout);
        setFontFamily(savedFont);

        const body = document?.getElementById('body');
        if (body) {
            body.classList.add(savedFont);
        }

        return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, [updateAppearance]);

    return { appearance, updateAppearance, authLayout, updateAuthLayout, appLayout, updateAppLayout, fontFamily, updateFontFamily } as const;
}
