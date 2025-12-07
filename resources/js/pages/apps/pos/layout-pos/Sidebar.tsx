import React from 'react';
import { X } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
        <h2 className="text-xl font-bold text-foreground">Wioos POS</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Tutup sidebar"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>
      </div>

      <nav className="flex flex-col p-4 space-y-2 overflow-auto">
        <a href="#" className="block rounded px-3 py-2 hover:bg-accent font-medium text-foreground">Dashboard</a>
        <a href="#" className="block rounded px-3 py-2 hover:bg-accent text-foreground">Transaksi</a>
        <a href="#" className="block rounded px-3 py-2 hover:bg-accent text-foreground">Produk</a>
        <a href="#" className="block rounded px-3 py-2 hover:bg-accent text-foreground">Laporan</a>
      </nav>
    </div>
  );
}

