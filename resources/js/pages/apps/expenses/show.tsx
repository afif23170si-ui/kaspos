import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCard, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Expense } from '@/types/expenses';
import { Head, usePage } from '@inertiajs/react';
import { Calendar, FileText, NotebookPen, ReceiptText, ShoppingBag, User2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengeluaran',
        href: route('apps.expenses.index'),
    },
    {
        title: 'Detail Pengeluaran',
        href: '#',
    },
];

interface ShowProps {
    expense: Expense;
    [key: string]: unknown;
}

export default function Show() {

    const { expense } = usePage<ShowProps>().props;

    console.log(expense);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Pengeluaran" />
            <div className="p-6">
                <Card className="shadow-lg">
                    <CardContent className="space-y-6 p-8">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight">Detail Biaya Pengeluaran</h2>
                                <p className="text-muted-foreground text-sm">Informasi lengkap pengeluaran operasional</p>
                            </div>
                            <div className="text-end">
                                <div className="bg-primary/5 rounded-lg p-4">
                                    <p className="text-muted-foreground text-sm">No. Biaya</p>
                                    <p className="text-primary text-2xl font-bold tracking-tight">{expense.expensee_number}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Informasi Pengeluaran</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-muted-foreground h-4 w-4" />
                                        <div>
                                            <p className="text-sm font-medium">Tanggal</p>
                                            <p className="text-muted-foreground text-sm">{expense.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <NotebookPen className="text-muted-foreground h-4 w-4" />
                                        <div>
                                            <p className="text-sm font-medium">Kategori</p>
                                            <p className="text-muted-foreground text-sm">{expense.expense_category.name} &gt; {expense.expense_subcategory.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FileText className="text-muted-foreground h-4 w-4" />
                                        <div>
                                            <p className="text-sm font-medium">No. Referensi</p>
                                            <p className="text-muted-foreground text-sm">{expense.reference_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User2 className="text-muted-foreground h-4 w-4" />
                                        <div>
                                            <p className="text-sm font-medium">Dibuat Oleh</p>
                                            <p className="text-muted-foreground text-sm">{expense.user_created.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Detail Lainnya</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="text-muted-foreground h-4 w-4" />
                                        <div>
                                            <p className="text-sm font-medium">Jumlah</p>
                                            <p className="text-muted-foreground text-sm"><sup>Rp</sup> {expense.amount}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <FileText className="text-muted-foreground mt-0.5 h-4 w-4" />
                                        <div>
                                            <p className="mb-1 text-sm font-medium">Deskripsi</p>
                                            <p className="text-muted-foreground text-sm">{expense.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <ReceiptText className="text-muted-foreground mt-0.5 h-4 w-4" />
                                        <div>
                                            <p className="mb-1 text-sm font-medium">Bukti Pembayaran</p>
                                            {expense.file &&
                                                <div className="bg-muted/20 w-fit rounded-md border p-3">
                                                    <a
                                                        href={expense.file}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        Lihat Bukti Pembayaran
                                                    </a>
                                                    <div className="mt-2">
                                                        <img
                                                            src={expense.file}
                                                            alt="Bukti Pembayaran"
                                                            className="w-48 rounded border shadow"
                                                        />
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <div>
                        <div className="bg-secondary p-4">Riwayat Pembayaran</div>
                        <TableCard className='rounded-t-none border-none'>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 divide-muted/50">
                                        <TableHead className="w-[50px] text-center">No</TableHead>
                                        <TableHead>Tanggal Pembayaran</TableHead>
                                        <TableHead>Metode Pembayaran</TableHead>
                                        <TableHead>Akun Bank</TableHead>
                                        <TableHead className="text-right">Jumlah Bayar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expense.expense_payments.map((payment, index) => (
                                        <TableRow key={index} className="hover:bg-transparent">
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell>{payment.paid_at}</TableCell>
                                            <TableCell className="capitalize">{payment.payment_method}</TableCell>
                                            <TableCell>
                                                {payment.bank_account ?
                                                    <>
                                                        {payment.bank_account?.bank_name} - {payment.bank_account?.account_name} [{payment.bank_account?.account_number}]
                                                    </>
                                                    :
                                                    '-'
                                                }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <sup>Rp</sup> {payment.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50 divide-muted/50">
                                        <TableCell colSpan={4} className="text-right font-bold">
                                            Total Bayar
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            <sup>Rp</sup> {expense.total_payment}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="bg-muted/50 divide-muted/50">
                                        <TableCell colSpan={4} className="text-right font-bold">
                                            Sisa Bayar
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            <sup>Rp</sup> {expense.remaining_payment}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableCard>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
