/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePage } from '@inertiajs/react';
interface SettingsProps {
    [key: string] : any;
}

export default function AppLogo() {
    const { settings } = usePage<SettingsProps>().props;
    const name = settings?.find((setting: any) => setting.code === 'NAME');
    const logo = settings?.find((setting: any) => setting.code === 'LOGO');

    const appName = name?.value ?? 'My App';
    const appLogo = logo?.value ?? 'Logo.jpg';
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                <img
                    src={appLogo}
                    alt={appName}
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{appName}</span>
            </div>
        </>
    );
}
