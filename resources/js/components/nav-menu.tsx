/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Folder, NotebookText, Package } from "lucide-react";
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
export function NavMenu({ url, setOpenMobile } : { url: string, setOpenMobile: any }) {
    return (
        <SidebarGroup>
            {(hasAnyPermission(['materials-data']) || hasAnyPermission(['categories-data']) || hasAnyPermission(['menus-data']) || hasAnyPermission(['products-data'])) && (
                <SidebarGroupLabel>Menu & Inventory</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {hasAnyPermission(['categories-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Categories"} isActive={url.startsWith('/categories') && true}>
                                <Link href={route('apps.categories.index')} onClick={() => setOpenMobile(false)}>
                                    <Folder/>
                                    <span>Kategori</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['materials-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Ingredients"} isActive={url.startsWith('/materials') && true}>
                                <Link href={route('apps.materials.index')} onClick={() => setOpenMobile(false)}>
                                    <Box/>
                                    <span>Bahan Baku</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['menus-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Menus"} isActive={url.startsWith('/menus') && true}>
                                <Link href={route('apps.menus.index')} onClick={() => setOpenMobile(false)}>
                                    <NotebookText/>
                                    <span>Menu</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['products-data']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Products"} isActive={url.startsWith('/products') && true}>
                                <Link href={route('apps.products.index')} onClick={() => setOpenMobile(false)}>
                                    <Package/>
                                    <span>Produk</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
