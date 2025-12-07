import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Link , usePage} from '@inertiajs/react';
import AppLogo from './app-logo';
import { NavUserManagement } from './nav-user-management';
import { NavMaster } from './nav-master';
import { NavMenu } from './nav-menu';
import { NavTransaction } from './nav-transaction';
import { NavStock } from './nav-stock';
import { NavOperational } from './nav-operational';
import { NavDiscount } from './nav-discount';
import { NavReport } from './nav-report';
import { Store } from 'lucide-react';
import hasAnyPermission from '@/utils/has-permissions';

export function AppSidebar() {

    const { url } = usePage();
    const { setOpenMobile } = useSidebar();

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {(hasAnyPermission(['dashboard-data'])) &&
                    <NavMain url={url} setOpenMobile={setOpenMobile}/>
                }
                {(hasAnyPermission(['units-data']) || hasAnyPermission(['suppliers-data']) || hasAnyPermission(['tables-data']) || hasAnyPermission(['customers-data'])) && (
                    <NavMaster url={url} setOpenMobile={setOpenMobile}/>
                )}
                {(hasAnyPermission(['materials-data']) || hasAnyPermission(['categories-data']) || hasAnyPermission(['menus-data']) || hasAnyPermission(['products-data'])) && (
                    <NavMenu url={url} setOpenMobile={setOpenMobile}/>
                )}
                {(hasAnyPermission(['coupons-data']) || hasAnyPermission(['discount-packages-data']) || hasAnyPermission(['discount-products-data'])) && (
                    <NavDiscount url={url} setOpenMobile={setOpenMobile}/>
                )}
                {(hasAnyPermission(['checking-stocks-data'])) && (
                    <NavStock url={url} setOpenMobile={setOpenMobile}/>
                )}
                {(hasAnyPermission(['transactions-data']) || hasAnyPermission(['pos-data']) || hasAnyPermission(['transaction-kitchens-data']) || hasAnyPermission(['purchase-returns-data'])) && (
                    <NavTransaction url={url} setOpenMobile={setOpenMobile}/>
                )}
                {(hasAnyPermission(['expense-categories-data']) || hasAnyPermission(['expense-subcategories-data']) || hasAnyPermission(['expeses-data'])) && (
                    <NavOperational url={url} setOpenMobile={setOpenMobile}/>
                )}
                {(hasAnyPermission(['report-cash-flow']) || hasAnyPermission(['report-purchase']) || hasAnyPermission(['report-sale']) || hasAnyPermission(['report-stock']) || hasAnyPermission(['report-card-stock']) || hasAnyPermission(['report-profit-loss'])) && (
                    <NavReport url={url} setOpenMobile={setOpenMobile}/>
                )}
                {(hasAnyPermission(['roles-data']) || hasAnyPermission(['permissions-data']) || hasAnyPermission(['users-data'])) && (
                    <NavUserManagement url={url} setOpenMobile={setOpenMobile}/>
                )}
            </SidebarContent>
            {(hasAnyPermission(['setting-data']) || hasAnyPermission(['settings-bank']) || hasAnyPermission(['settings-shifts']) || hasAnyPermission(['settings-setting']) || hasAnyPermission(['settings-loyalty'])) &&
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Laporan Arus Kas"} isActive={url.startsWith('/reports/cash-flow')}>
                                <Link className="block w-full" href={route('apps.setting-stores.index')} as="button">
                                    <Store className="mr-2" />
                                    Pengaturan Toko
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            }
        </Sidebar>
    );
}
