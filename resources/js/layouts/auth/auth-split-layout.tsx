/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { Utensils, Briefcase, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge'

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote, settings } = usePage<SharedData>().props;

    const logo = settings?.find((setting: any) => setting.code === 'LOGO');

    const appLogo = logo?.value ?? 'Logo.jpg';

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">

                <div className="absolute inset-0 flex items-center justify-center bg-black/90 px-6 py-10 text-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">

                        {/* Usaha Jasa */}
                        <div className="relative group flex flex-col items-center rounded-xl bg-white/10 backdrop-blur-md p-4 transition-transform hover:scale-105 hover:shadow-lg hover:bg-white/20">
                            <Badge
                                variant="secondary"
                                className="absolute right-2 top-2 bg-orange-500/20 text-orange-500 border-none"
                            >
                                Coming Soon
                            </Badge>
                            <Briefcase className="mb-2 h-12 w-12 text-white transition-transform group-hover:-rotate-3" />
                            <p className="mb-1 text-base font-semibold">Usaha Jasa</p>
                            <p className="text-xs text-neutral-300 text-center">
                                Kelola penjadwalan & reservasi pelanggan
                            </p>
                        </div>

                        {/* Restoran & Kafe */}
                        <div className="relative group flex flex-col items-center rounded-xl bg-white/10 backdrop-blur-md p-4 transition-transform hover:scale-105 hover:shadow-lg hover:bg-white/20">
                            <Utensils className="mb-2 h-12 w-12 text-white transition-transform group-hover:rotate-3" />
                            <p className="mb-1 text-base font-semibold">Restoran & Kafe</p>
                            <p className="text-xs text-neutral-300 text-center">
                                Manajemen menu, meja, dan jualan online
                            </p>
                        </div>

                        {/* Retail & Toko */}
                        <div className="relative group flex flex-col items-center rounded-xl bg-white/10 backdrop-blur-md p-4 transition-transform hover:scale-105 hover:shadow-lg hover:bg-white/20">
                            <Badge
                                variant="secondary"
                                className="absolute right-2 top-2 bg-orange-500/20 text-orange-500 border-none"
                            >
                                Coming Soon
                            </Badge>
                            <Store className="mb-2 h-12 w-12 text-white transition-transform group-hover:-rotate-3" />
                            <p className="mb-1 text-base font-semibold">Retail & Toko</p>
                            <p className="text-xs text-neutral-300 text-center">
                                Kelola stok & transaksi usaha ritel Anda
                            </p>
                        </div>

                    </div>
                </div>

                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    {/* <AppLogoIcon className="mr-2 size-8 fill-current text-white" /> */}
                    <img src={appLogo} alt={name} className='mr-2 size-8'/>
                    {name}
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
