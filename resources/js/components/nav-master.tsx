/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookUser, Box, Grid2X2, Truck } from "lucide-react";
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
export function NavMaster({ url, setOpenMobile } : { url: string, setOpenMobile: any }) {
    return (
        <SidebarGroup>
            {(hasAnyPermission(['units-data']) || hasAnyPermission(['suppliers-data']) || hasAnyPermission(['tables-data']) || hasAnyPermission(['customers-data'])) && (
                <SidebarGroupLabel>Master Data</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {hasAnyPermission(['units-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Satuan"} isActive={url.startsWith('/units') && true}>
                                <Link href={route('apps.units.index')} onClick={() => setOpenMobile(false)}>
                                    <Box/>
                                    <span>Satuan</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['suppliers-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Supplier"} isActive={url.startsWith('/suppliers') && true}>
                                <Link href={route('apps.suppliers.index')} onClick={() => setOpenMobile(false)}>
                                    <Truck/>
                                    <span>Supplier</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['tables-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Meja"} isActive={url.startsWith('/tables') && true}>
                                <Link href={route('apps.tables.index')} onClick={() => setOpenMobile(false)}>
                                    <Grid2X2/>
                                    <span>Meja</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['customers-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Pelanggan"} isActive={url.startsWith('/customers') && true}>
                                <Link href={route('apps.customers.index')} onClick={() => setOpenMobile(false)}>
                                    <BookUser/>
                                    <span>Pelanggan</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
