/* eslint-disable @typescript-eslint/no-explicit-any */
import { Users2, UserCog, UserRoundCheck } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@inertiajs/react";
import hasAnyPermission from "@/utils/has-permissions";

export function NavUserManagement({ url, setOpenMobile } : { url: string, setOpenMobile: any }) {
    return (
        <SidebarGroup>
            {(hasAnyPermission(['permissions-data']) || hasAnyPermission(['users-data']) || hasAnyPermission(['roles-data'])) && (
                <SidebarGroupLabel>User Management</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {hasAnyPermission(['roles-data']) &&
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Permissions"} isActive={url.startsWith('/apps/permissions') && true}>
                                <Link href={route('apps.permissions.index')} onClick={() => setOpenMobile(false)}>
                                    <UserCog/>
                                    <span>Permissions</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    }
                    {hasAnyPermission(['permissions-data']) &&
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Roles"} isActive={url.startsWith('/apps/roles') && true}>
                                <Link href={route('apps.roles.index')} onClick={() => setOpenMobile(false)}>
                                    <UserRoundCheck/>
                                    <span>Roles</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    }
                    {hasAnyPermission(['users-data']) &&
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Users"} isActive={url.startsWith('/apps/users') && true}>
                                <Link href={route('apps.users.index')} onClick={() => setOpenMobile(false)}>
                                    <Users2/>
                                    <span>Users</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    }
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
