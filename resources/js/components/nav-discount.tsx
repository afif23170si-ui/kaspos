/* eslint-disable @typescript-eslint/no-explicit-any */
import { PackageCheck, Percent, TicketPercent } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link } from "@inertiajs/react";
import hasAnyPermission from "@/utils/has-permissions";
export function NavDiscount({ url, setOpenMobile } : { url: string, setOpenMobile: any }) {
    return (
        <SidebarGroup>
            {(hasAnyPermission(['coupons-data']) || hasAnyPermission(['discount-packages-data']) || hasAnyPermission(['discount-products-data'])) && (
                <SidebarGroupLabel>Master Promo</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {hasAnyPermission(['coupons-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Diskon"} isActive={url.startsWith('/coupons') && true}>
                                <Link href={route('apps.coupons.index')} onClick={() => setOpenMobile(false)}>
                                    <TicketPercent/>
                                    <span>Diskon</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['discount-packages-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Diskon Paket"} isActive={url.startsWith('/discount-packages') && true}>
                                <Link href={route('apps.discount-packages.index')} onClick={() => setOpenMobile(false)}>
                                    <Percent/>
                                    <span>Diskon Paket</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['discount-products-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Diskon Produk"} isActive={url.startsWith('/discount-products') && true}>
                                <Link href={route('apps.discount-products.index')} onClick={() => setOpenMobile(false)}>
                                    <PackageCheck/>
                                    <span>Diskon Produk</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
