/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArchiveRestore, Calculator, ChefHat, ShoppingBag } from "lucide-react";
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
export function NavTransaction({ url, setOpenMobile } : { url: string, setOpenMobile: any }) {
    return (
        <>
            <SidebarGroup>
            {(hasAnyPermission(['transactions-data']) || hasAnyPermission(['transaction-kitchens-data']) || hasAnyPermission(['transactions-data']) || hasAnyPermission(['purhcase-returns-data'])) && (
                <SidebarGroupLabel>Penjualan</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {hasAnyPermission(['pos-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"pos"} isActive={url.startsWith('/pos') && true}>
                                <Link href={route('apps.pos.index')} onClick={() => setOpenMobile(false)}>
                                    <Calculator/>
                                    <span>Kasir</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['transaction-kitchens-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Dapur"} isActive={url.startsWith('/kitchen') && true}>
                                <Link href={route('apps.kitchen.index')} onClick={() => setOpenMobile(false)}>
                                    <ChefHat/>
                                    <span>Dapur</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['transactions-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Penjualan"} isActive={url.startsWith('/transactions')}>
                                <Link href={route('apps.transactions.index')} onClick={() => setOpenMobile(false)}>
                                    <ShoppingBag/>
                                    <span>Penjualan</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['transaction-returns-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Retur Penjualan"} isActive={url.startsWith('/transaction-returns')}>
                                <Link href={route('apps.transaction-returns.index')} onClick={() => setOpenMobile(false)}>
                                    <ArchiveRestore/>
                                    <span>Retur Penjualan</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
                {(hasAnyPermission(['orders-data'])) && (
                    <SidebarGroupLabel>Pembelian</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                    <SidebarMenu>
                        {hasAnyPermission(['orders-data']) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip={"Pembelian"} isActive={url.startsWith('/orders')}>
                                    <Link href={route('apps.orders.index')} onClick={() => setOpenMobile(false)}>
                                        <ShoppingBag/>
                                        <span>Pembelian</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {hasAnyPermission(['purchase-returns-data']) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip={"Retur Pembelian"} isActive={url.startsWith('/purchase-returns')}>
                                    <Link href={route('apps.purchase-returns.index')} onClick={() => setOpenMobile(false)}>
                                        <ArchiveRestore/>
                                        <span>Retur Pembelian</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}
