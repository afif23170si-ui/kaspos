/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartBarDecreasing, ChartCandlestick, ChartNetwork, ChartNoAxesCombined, ChartSpline, History, TrendingUpDown } from "lucide-react";
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
export function NavReport({ url, setOpenMobile } : { url: string, setOpenMobile: any }) {
    return (
        <SidebarGroup>
            {(hasAnyPermission(['report-cash-flow'])) && (
                <SidebarGroupLabel>Laporan</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {(hasAnyPermission(['report-cash-flow']) || hasAnyPermission(['report-purchase']) || hasAnyPermission(['report-sale']) || hasAnyPermission(['report-stock']) || hasAnyPermission(['report-audit-logs'])) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Laporan Arus Kas"} isActive={url.startsWith('/reports/cash-flow')}>
                                <Link href={route('apps.reports.cash-flows')} onClick={() => setOpenMobile(false)}>
                                    <TrendingUpDown/>
                                    <span>Laporan Arus Kas</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['report-purchase']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Laporan Pembelian"} isActive={url.startsWith('/reports/purchase')}>
                                <Link href={route('apps.reports.purchases')} onClick={() => setOpenMobile(false)}>
                                    <ChartSpline/>
                                    <span>Laporan Pembelian</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['report-sale']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Laporan Penjualan"} isActive={url.startsWith('/reports/sale')}>
                                <Link href={route('apps.reports.sales')} onClick={() => setOpenMobile(false)}>
                                    <ChartNoAxesCombined/>
                                    <span>Laporan Penjualan</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['report-stock']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Laporan Sisa Stok"} isActive={url.startsWith('/reports/stock')}>
                                <Link href={route('apps.reports.stocks')} onClick={() => setOpenMobile(false)}>
                                    <ChartCandlestick/>
                                    <span>Laporan Sisa Stok</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['report-card-stock']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Laporan Kartu Stok"} isActive={url.startsWith('/reports/card-stock')}>
                                <Link href={route('apps.reports.card-stocks')} onClick={() => setOpenMobile(false)}>
                                    <ChartBarDecreasing/>
                                    <span>Laporan Kartu Stok</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['report-profit-loss']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Laporan Laba Rugi"} isActive={url.startsWith('/reports/profit-loss')}>
                                <Link href={route('apps.reports.profit-loss')} onClick={() => setOpenMobile(false)}>
                                    <ChartNetwork/>
                                    <span>Laporan Laba Rugi</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    {hasAnyPermission(['report-audit-logs']) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={"Laporan Audit Log"} isActive={url.startsWith('/audit-logs')}>
                                <Link href={route('apps.audit-logs.index')} onClick={() => setOpenMobile(false)}>
                                    <History/>
                                    <span>Laporan Audit Log</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
