import React from 'react';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/sonner';

export default function PosLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <main className="flex-1 overflow-hidden p-4">
                <Toaster/>
                {children}
            </main>
        </div>
    );
}
