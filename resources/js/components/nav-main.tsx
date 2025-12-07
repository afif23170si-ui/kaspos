/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutGrid } from "lucide-react";
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
export function NavMain({ url, setOpenMobile } : { url: string, setOpenMobile: any }) {
    return (
        <SidebarGroup>
            {(hasAnyPermission(['dashboard-data'])) && (
                <SidebarGroupLabel>Main</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {hasAnyPermission(['dashboard-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Dashboard"} isActive={url.startsWith('/dashboard') && true}>
                                <Link href={route('apps.dashboard')} onClick={() => setOpenMobile(false)}>
                                    <LayoutGrid/>
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
