/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react"
import { useCallback } from "react";
import { useForm, router } from "@inertiajs/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Input } from "./input"
import { cn } from "@/lib/utils"
import { User } from "@/types";
import { Setting } from "@/types/setting";

const TableCard = ({ children, className } : { children: React.ReactNode, className?: string }) => {
    return(
        <div className={cn("w-full border rounded-md overflow-x-auto bg-background", className)}>
            {children}
        </div>
    )
}

TableCard.displayName = "TableCard";

interface TableFilterProps {
    url: string,
    placeholder: string,
    withFilterPage?: boolean,
    currentPage?: number,
    perPage?: number,
    withFilterStatus?: boolean,
    withFilterDate?: boolean,
    withFilterPlatform?: boolean,
    withFilterShipping?: boolean,
    withFilterCashier?: boolean,
    platforms?: Setting[],
    cashiers?: User[],
}

const TableFilter = ({
    url,
    placeholder,
    withFilterPage = false,
    currentPage,
    perPage,
    withFilterStatus = false,
    withFilterDate = false,
    withFilterPlatform = false,
    withFilterShipping = false,
    withFilterCashier = false,
    platforms = [],
    cashiers = [],

} : TableFilterProps) => {
    const { data, setData } = useForm({
        search: '',
        page: currentPage,
        perPage: perPage,
        status: '',
        date_from: '',
        date_to: '',
        platform: '',
        shipping: '',
        cashier: '',
    });

    const applyFilters = useCallback((changes: Partial<typeof data>) => {
        const params: any = { ...data, ...changes };
        if (params.perPage) {
            params.per_page = params.perPage;
            delete params.perPage;
        }
        setData({ ...data, ...changes });
        router.get(url, params, { preserveState: true, replace: true });
    }, [data, url]);

    return(
        <>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    {withFilterPage &&
                        <Select value={String(data.perPage)} onValueChange={(v) => applyFilters({ perPage: parseInt(v) || 10, page: 1 })}>
                            <SelectTrigger className="w-[70px] focus:ring-0">
                                <SelectValue placeholder={perPage} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                    <Input
                        className="w-full"
                        type="text"
                        value={data.search}
                        onChange={(e) => applyFilters({ search: e.target.value })}
                        placeholder={placeholder}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {withFilterStatus &&
                        <Select value={data.status} onValueChange={(v) => applyFilters({ status: v })}>
                            <SelectTrigger className="w-[160px] focus:ring-0">
                                <SelectValue placeholder="Status Pembayaran" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="partial">Partial</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    }

                    {withFilterDate &&
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={data.date_from}
                                onChange={(e) => applyFilters({ date_from: e.target.value })}
                                className="w-[150px]"
                            />
                            <span>-</span>
                            <Input
                                type="date"
                                value={data.date_to}
                                onChange={(e) => applyFilters({ date_to: e.target.value })}
                                className="w-[150px]"
                            />
                        </div>
                    }

                    {withFilterPlatform &&
                        <Select value={data.platform} onValueChange={(v) => applyFilters({ platform: v })}>
                            <SelectTrigger className="w-[160px] focus:ring-0">
                                <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                {platforms.map((p) => (
                                    <SelectItem key={p.name} value={p.name}>{String(p.name)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }

                    {withFilterShipping &&
                        <Select value={data.shipping} onValueChange={(v) => applyFilters({ shipping: v })}>
                            <SelectTrigger className="w-[160px] focus:ring-0">
                                <SelectValue placeholder="Status Pengiriman" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                        </Select>
                    }

                    {withFilterCashier &&
                        <Select value={data.cashier} onValueChange={(v) => applyFilters({ cashier: v })}>
                            <SelectTrigger className="w-[160px] focus:ring-0">
                                <SelectValue placeholder="Kasir" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                {cashiers.map((c) => (
                                    <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                </div>
            </div>
        </>
    )
}


TableFilter.displayName = "TableFilter";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b bg-background", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted divide-x",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "p-3 whitespace-nowrap text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 text-gray-700 dark:text-gray-300 whitespace-nowrap align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

const TableEmpty = ({colSpan, message} : {colSpan: number, message: string}) => {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} align="center">{message} tidak ditemukan.</TableCell>
        </TableRow>
    )
}
TableEmpty.displayName = "TableEmpty";


export {
    TableCard,
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
    TableEmpty,
    TableFilter
}
