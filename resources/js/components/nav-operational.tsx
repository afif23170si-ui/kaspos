/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tag, Tags, Wallet } from "lucide-react";
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
export function NavOperational({ url, setOpenMobile } : { url: string, setOpenMobile: any }) {
    return (
        <SidebarGroup>
            {(hasAnyPermission(['expense-categories-data']) || (hasAnyPermission(['expense-subcategories-data']) || (hasAnyPermission(['expenses-data'])))) && (
                <SidebarGroupLabel>Operasional</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {hasAnyPermission(['expense-categories-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Kategori Pengeluaran"} isActive={url.startsWith('/expense-categories')}>
                                <Link href={route('apps.expense-categories.index')} onClick={() => setOpenMobile(false)}>
                                    <Tag/>
                                    <span>Kategori Pengeluaran</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['expense-subcategories-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Subkategori Pengeluaran"} isActive={url.startsWith('/expense-subcategories')}>
                                <Link href={route('apps.expense-subcategories.index')} onClick={() => setOpenMobile(false)}>
                                    <Tags/>
                                    <span>Subkategori Pengeluaran</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['expenses-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Pengeluaran"} isActive={url.startsWith('/expenses')}>
                                <Link href={route('apps.expenses.index')} onClick={() => setOpenMobile(false)}>
                                    <Wallet/>
                                    <span>Pengeluaran</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
