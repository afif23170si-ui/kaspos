<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DocumentationController extends Controller
{
    public function index($slug = 'introduction')
    {
        $path = resource_path("docs/{$slug}.md");

        if (!File::exists($path)) {
            abort(404);
        }

        $content = File::get($path);
        
        // Convert Markdown to HTML
        $html = Str::markdown($content, [
            'html_input' => 'allow',
            'allow_unsafe_links' => false,
        ]);

        $menu = [
            [
                'title' => 'Panduan Pengguna',
                'items' => [
                    ['label' => 'Pengenalan', 'url' => '/documentations/introduction', 'active' => $slug === 'introduction'],
                    ['label' => 'Instalasi', 'url' => '/documentations/installation', 'active' => $slug === 'installation'],
                    ['label' => 'Login & Akses', 'url' => '/documentations/auth', 'active' => $slug === 'auth'],
                ]
            ],
            [
                'title' => 'Operasional Utama',
                'items' => [
                    ['label' => 'Dashboard', 'url' => '/documentations/dashboard', 'active' => $slug === 'dashboard'],
                    ['label' => 'Point of Sale (Kasir)', 'url' => '/documentations/pos', 'active' => $slug === 'pos'],
                    ['label' => 'Kitchen Display', 'url' => '/documentations/kitchen', 'active' => $slug === 'kitchen'],
                ]
            ],
            [
                'title' => 'Manajemen',
                'items' => [
                    ['label' => 'Produk & Stok', 'url' => '/documentations/products', 'active' => $slug === 'products'],
                    ['label' => 'Pelanggan', 'url' => '/documentations/customers', 'active' => $slug === 'customers'],
                    ['label' => 'Transaksi', 'url' => '/documentations/transactions', 'active' => $slug === 'transactions'],
                    ['label' => 'Laporan', 'url' => '/documentations/reports', 'active' => $slug === 'reports'],
                ]
            ],
            [
                'title' => 'Admin Area',
                'items' => [
                    ['label' => 'Pengaturan & User', 'url' => '/documentations/settings', 'active' => $slug === 'settings'],
                    ['label' => 'Troubleshooting', 'url' => '/documentations/troubleshooting', 'active' => $slug === 'troubleshooting'],
                ]
            ],
            [
                'title' => 'Technical Reference',
                'items' => [
                    ['label' => 'Tech Stack', 'url' => '/documentations/tech-stack', 'active' => $slug === 'tech-stack'],
                    ['label' => 'Database', 'url' => '/documentations/database', 'active' => $slug === 'database'],
                    ['label' => 'Development', 'url' => '/documentations/development', 'active' => $slug === 'development'],
                ]
            ]
        ];

        // Determine Title based on Slug
        $titles = [
            'introduction' => 'Pengenalan',
            'installation' => 'Instalasi',
            'auth' => 'Login & Akses',
            'dashboard' => 'Dashboard',
            'pos' => 'Point of Sale',
            'kitchen' => 'Kitchen Display',
            'products' => 'Manajemen Produk',
            'customers' => 'Manajemen Pelanggan',
            'transactions' => 'Manajemen Transaksi',
            'reports' => 'Laporan',
            'settings' => 'Pengaturan',
            'troubleshooting' => 'Troubleshooting',
            'tech-stack' => 'Tech Stack',
            'database' => 'Database',
            'development' => 'Development'
        ];

        return Inertia::render('Documentation/Index', [
            'content' => $html,
            'slug' => $slug,
            'title' => $titles[$slug] ?? 'Documentation',
            'menu' => $menu
        ]);
    }
}
