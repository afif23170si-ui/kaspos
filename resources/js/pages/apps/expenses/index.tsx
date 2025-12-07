import React from 'react';
import AppLayout from '@/layouts/app-layout'
import hasAnyPermission from '@/utils/has-permissions';
import PagePagination from '@/components/page-pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Table, TableBody, TableCard, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableFilter } from '@/components/ui/table';
import { CheckCircle, CirclePause, FileText, PlusCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/action-button';
import { ModalDelete } from '@/components/modal-delete';
import { Expense, ExpenseLink } from '@/types/expenses';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengeluaran',
        href: route('apps.expenses.index'),
    },
];

interface IndexProps {
    expenses: {
        data: Expense[],
        links: ExpenseLink[],
    };
    perPage: number;
    currentPage: number;
    [key: string]: unknown;
}

export default function Index() {

    const { expenses, perPage, currentPage } = usePage<IndexProps>().props;
    const {data, setData} = useForm({
        id: '',
    })

    const [deleteModal, setDeleteModal] = React.useState(false);

    const handleModalDelete = (expense: Expense) => {
        setDeleteModal(true);
        setData(prevData => ({
            ...prevData,
            id: expense.id,
        }))
    }

    const statusPayment = (status: string): React.ReactNode => {
        switch (status) {
            case 'paid':
                return <div className='flex items-center gap-1 text-green-500'><CheckCircle className='size-4'/> Lunas</div>
            case 'partial':
                return <div className='flex items-center gap-1 text-amber-500'><CirclePause className='size-4'/> Belum Lunas</div>
            case 'unpaid':
                return <div className='flex items-center gap-1 text-rose-500'><XCircle className='size-4'/> Belum Dibayar</div>
            default:
                return 'Status Tidak Dikenal';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Pengeluaran'/>
            <div className='p-6'>
                {hasAnyPermission(['expenses-create']) &&
                    <Button asChild variant='outline'>
                        <Link href={route('apps.expenses.create')}>
                            <PlusCircle className="size-4" /> <span className="hidden sm:inline-flex font-semibold">Tambah Pengeluaran</span>
                        </Link>
                    </Button>
                }
                <div className="mt-6">
                    <TableFilter
                        withFilterPage
                        currentPage={currentPage}
                        perPage={perPage}
                        url={route('apps.expenses.index')}
                        placeholder="Cari data pengeluaran berdasarkan nomor pengeluaran"
                    />
                </div>
                <TableCard className='mt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[10px]'>No</TableHead>
                                <TableHead>No Biaya</TableHead>
                                <TableHead>No Referensi</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Subkategori</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Jumlah</TableHead>
                                <TableHead className='w-[10px] text-center'>Status Pengeluaran</TableHead>
                                <TableHead className='w-[10px] text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.data.length === 0 ?
                                <TableEmpty colSpan={9} message='data pengeluaran'/>
                                :
                                expenses.data.map((expense, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{expense.expensee_number}</TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                {expense.file != null && (
                                                    <a
                                                        href={expense.file}
                                                        target="_blank"
                                                    >
                                                        <FileText size={16}/>
                                                    </a>
                                                    )
                                                }
                                                {expense.reference_number}
                                            </div>
                                        </TableCell>
                                        <TableCell>{expense.expense_category.name}</TableCell>
                                        <TableCell>{expense.expense_subcategory.name}</TableCell>
                                        <TableCell>{expense.date}</TableCell>
                                        <TableCell><sup>Rp</sup> {expense.amount}</TableCell>
                                        <TableCell>{statusPayment(expense.payment_status)}</TableCell>
                                        <TableCell>
                                            <div className='text-center'>
                                                {(hasAnyPermission(['expenses-update']) || hasAnyPermission(['expenses-delete'])) &&
                                                    <ActionButton
                                                        permissionPrefix='expenses'
                                                        withDetail
                                                        actionDetailHref={route('apps.expenses.show', expense.id)}
                                                        actionEditHref={route('apps.expenses.edit', expense.id)}
                                                        actionDelete={() => handleModalDelete(expense)}
                                                    />
                                                }
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableCard>
                <ModalDelete open={deleteModal} onOpenChange={setDeleteModal} url={route('apps.expenses.destroy', data.id)}/>
                <PagePagination data={expenses}/>
            </div>
        </AppLayout>
    )
}
