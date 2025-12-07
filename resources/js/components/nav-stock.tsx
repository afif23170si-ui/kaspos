/* eslint-disable @typescript-eslint/no-explicit-any */
import { Warehouse } from "lucide-react";
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
export function NavStock({ url, setOpenMobile } : { url: string, setOpenMobile: any }) {
    return (
        <SidebarGroup>
            {(hasAnyPermission(['checking-stocks-data'])) && (
                <SidebarGroupLabel>Stock Management</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {hasAnyPermission(['checking-stocks-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Stok Opname"} isActive={url.startsWith('/checking-stocks') && true}>
                                <Link href={route('apps.checking-stocks.index')} onClick={() => setOpenMobile(false)}>
                                    <Warehouse/>
                                    <span>Stok Opname</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
