import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Package } from 'lucide-react';
export default function opname() {
    return (
        <>
            <Head title="Akses Ditolak" />
            <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
                <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-200 p-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                                <Package className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Stok Opname Sistem</h1>
                                <p className="text-sm text-slate-600">Inventory Management</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6 border-l-4 border-orange-400 bg-orange-50 p-6">
                            <div className="flex items-start">
                                <AlertTriangle className="mt-1 mr-4 h-6 w-6 flex-shrink-0 text-orange-400" />
                                <div>
                                    <h2 className="mb-2 text-lg font-semibold text-orange-800">Stok Opname Sedang Berlangsung</h2>
                                    <p className="mb-4 leading-relaxed text-orange-700">
                                        Sistem sedang melakukan proses stock opname untuk memastikan akurasi data inventory. Selama proses ini
                                        berlangsung, fitur transaksi tidak dapat diakses.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button asChild variant={'secondary'} className='w-full'>
                            <Link href={route('apps.dashboard')}>
                                <ArrowLeft/> Kembali Ke Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
