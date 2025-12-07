import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import AuthLayoutTabs from '@/components/auth-layout-tabs';
import AppLayoutTabs from '@/components/app-layout-tabs';
import FontFamilyTabs from '@/components/font-family-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                    <AuthLayoutTabs />
                    <AppLayoutTabs />
                    <FontFamilyTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
