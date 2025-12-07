import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Settings, Settings2, Store, Building2, ChevronsUpDown } from 'lucide-react';
import { Link } from '@inertiajs/react';

export function NavSettings() {
    const isMobile = useIsMobile();
    const { state } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            asChild
                            tooltip="Settings"
                            isActive={false}
                        >
                            <button className="w-full flex items-center">
                                <Settings className="size-4" />
                                {state !== "collapsed" && (
                                    <>
                                        <span className="ml-2 truncate">Settings</span>
                                        <ChevronsUpDown className="ml-auto size-4" />
                                    </>
                                )}
                            </button>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'top' : state === 'collapsed' ? 'left' : 'top'}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href="/settings/general" className="w-full" prefetch>
                                    <Settings2 className="mr-2 size-4" />
                                    General Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings/pos" className="w-full" prefetch>
                                    <Store className="mr-2 size-4" />
                                    POS Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings/store" className="w-full" prefetch>
                                    <Building2 className="mr-2 size-4" />
                                    Store Settings
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
