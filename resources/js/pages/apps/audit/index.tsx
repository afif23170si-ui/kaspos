/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import PagePagination from '@/components/page-pagination';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Info } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type Activity = {
    id: number;
    created_at: string;
    log_name: string | null;
    event: string | null;
    description: string | null;
    subject_type: string | null;
    subject_id: number | string | null;
    causer?: { id: number; name: string } | null;
};

type LinkType = {
    url: string | null;
    label: string;
    active: boolean;
};

interface IndexProps {
    logs: {
        data: Activity[];
        links: LinkType[];
    };
    perPage: number;
    currentPage: number;
    options: { log_names: string[]; events: string[] };
    filters: {
        q?: string;
        log_name?: string;
        event?: string;
        user_id?: number | string;
        date_from?: string;
        date_to?: string;
        per_page?: number | string;
    };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Audit Log', href: route('apps.audit-logs.index') },
];

export default function Index() {
    const { logs, perPage, currentPage, options, filters } = usePage<IndexProps>().props;

    const [openDetail, setOpenDetail] = React.useState(false);
    const [loadingDetail, setLoadingDetail] = React.useState(false);
    const [detail, setDetail] = React.useState<any>(null);

    const onExport = () => {
        const params = new URLSearchParams({ ...filters, export: 'csv' } as any).toString();
        window.location.href = route('apps.audit-logs.index') + '?' + params;
    };

    const openDetailDialog = async (id: number) => {
        setOpenDetail(true);
        setLoadingDetail(true);
        try {
            const res = await fetch(route('apps.audit-logs.show', id));
            const json = await res.json();
            setDetail(json);
        } finally {
            setLoadingDetail(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log" />
            <div className="p-6">
                <div className="flex items-center justify-between gap-2">
                    <Heading title="Audit Log" description="Pantau semua aktivitas sistem dan perubahan data" />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onExport}>
                            <Download className="size-4" />
                            <span className="hidden sm:inline-flex ml-2 font-semibold">Export CSV</span>
                        </Button>
                    </div>
                </div>

                {/* Bar Filter – mengikuti pola TableFilter + form kecil tambahan */}
                <div className="mt-6 flex flex-col gap-3">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.audit-logs.index')}
                        placeholder="Cari deskripsi / log name / event / properties"
                    />

                    <div className="flex flex-wrap items-end gap-2">
                        <Select
                            name="log_name"
                            defaultValue={filters.log_name ?? ''}
                            onValueChange={(v) =>
                                router.visit(route('apps.audit-logs.index', { ...filters, log_name: v || undefined }), {
                                    preserveScroll: true,
                                    preserveState: true,
                                })
                            }
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Log name" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                {options.log_names.map((n) => (
                                    <SelectItem key={n} value={n}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            name="event"
                            defaultValue={filters.event ?? ''}
                            onValueChange={(v) =>
                                router.visit(route('apps.audit-logs.index', { ...filters, event: v || undefined }), {
                                    preserveScroll: true,
                                    preserveState: true,
                                })
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Event" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                {options.events.map((e) => (
                                    <SelectItem key={e} value={e}>
                                        {e}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabel */}
                <TableCard className="mt-5">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[10px]">No</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Log</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="w-[10px] text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableEmpty colSpan={8} message="audit log" />
                            ) : (
                                logs.data.map((a, idx) => (
                                    <TableRow key={a.id}>
                                        <TableCell className="text-center">{idx + 1}</TableCell>
                                        <TableCell className="whitespace-nowrap">{new Date(a.created_at).toLocaleString('id-ID')}</TableCell>
                                        <TableCell>{a.log_name ? <Badge variant="secondary">{a.log_name}</Badge> : '-'}</TableCell>
                                        <TableCell>{a.event ?? '-'}</TableCell>
                                        <TableCell className="max-w-[360px] truncate" title={a.description ?? ''}>
                                            {a.description ?? '-'}
                                        </TableCell>
                                        <TableCell className="max-w-[280px] truncate" title={`${a.subject_type ?? ''}#${a.subject_id ?? ''}`}>
                                            {a.subject_type ?? '-'}{a.subject_id ? ` #${a.subject_id}` : ''}
                                        </TableCell>
                                        <TableCell>{a.causer?.name ?? (a.causer ? a.causer.id : '-')}</TableCell>
                                        <TableCell>
                                            <div className="text-center">
                                                <Button size="icon" variant="ghost" onClick={() => openDetailDialog(a.id)} title="Detail">
                                                    <Info className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableCard>

                <PagePagination data={logs} />

                {/* Dialog Detail */}
                <Dialog open={openDetail} onOpenChange={setOpenDetail}>
                    <DialogContent className="w-full max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Detail Audit Log</DialogTitle>
                        </DialogHeader>
                        {loadingDetail ? (
                            <div className="text-sm text-muted-foreground">Memuat...</div>
                        ) : detail ? (
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-muted-foreground">Waktu</div>
                                        <div className="font-medium">{new Date(detail.created_at).toLocaleString('id-ID')}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Log / Event</div>
                                        <div className="font-medium">
                                            {detail.log_name} / {detail.event ?? '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">User</div>
                                        <div className="font-medium">{detail.causer?.name ?? '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Subject</div>
                                        <div className="font-medium">
                                            {detail.subject_type ?? '-'} {detail.subject_id ? `#${detail.subject_id}` : ''}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-muted-foreground">Deskripsi</div>
                                        <div className="font-medium">{detail.description ?? '-'}</div>
                                    </div>
                                </div>

                                <div className="border rounded-md p-3 bg-muted/30">
                                    <div className="text-muted-foreground mb-1">Properties</div>
                                    <pre className="text-xs overflow-auto max-h-72 whitespace-pre-wrap">
                                        {JSON.stringify(detail.properties ?? {}, null, 2)}
                                    </pre>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => navigator.clipboard?.writeText(JSON.stringify(detail.properties ?? {}, null, 2))}
                                        >
                                            Copy JSON
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">Tidak ada detail.</div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
