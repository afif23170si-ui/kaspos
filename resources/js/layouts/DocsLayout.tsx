import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X, Search, Github, Moon, Sun, ChevronRight } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

interface DocsLayoutProps {
    children: React.ReactNode;
    menu: {
        title: string;
        items: {
            label: string;
            url: string;
            active: boolean;
        }[];
    }[];
}

interface TocItem {
    id: string;
    text: string;
    level: number;
}

function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transition-colors"
            title={`Switch to ${appearance === 'dark' ? 'light' : 'dark'} mode`}
        >
            {appearance === 'dark' ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}

export default function DocsLayout({ children, menu }: DocsLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toc, setToc] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);

    // Extract Headers & Generate TOC
    useEffect(() => {
        if (!contentRef.current) return;

        const headers = Array.from(contentRef.current.querySelectorAll('h2, h3'));
        
        const items: TocItem[] = headers.map((header) => {
            // Generate ID if missing
            if (!header.id) {
                const slug = header.textContent
                    ?.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');
                header.id = slug || '';
            }

            return {
                id: header.id,
                text: header.textContent || '',
                level: Number(header.tagName.substring(1)), // 2 or 3
            };
        });

        setToc(items);
    }, [children]); // Re-run when content changes

    // Scroll Spy (Active Highlight)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0% -35% 0%' }
        );

        const headers = document.querySelectorAll('h2, h3');
        headers.forEach((header) => observer.observe(header));

        return () => observer.disconnect();
    }, [toc]);

    return (
        <div className="min-h-screen bg-background font-sans text-foreground flex flex-col antialiased">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center px-4 md:px-8 max-w-screen-2xl mx-auto">
                    {/* Mobile Menu Button */}
                    <button
                        className="mr-4 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </button>

                    {/* Logo */}
                    <Link href="/documentations" className="mr-6 flex items-center space-x-2">
                        <img src="/logo-kaspos.png" alt="KasPOS Logo" className="h-8 w-auto" />
                        <span className="hidden font-bold sm:inline-block text-lg">
                            Docs
                        </span>
                    </Link>

                    {/* Search Bar (Static for now) */}
                    <div className="hidden md:flex flex-1 max-w-sm mx-4">
                        <div className="relative w-full text-muted-foreground group hover:text-foreground transition-colors">
                            <div className="flex h-9 w-full items-center rounded-full border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring focus-within:border-primary disabled:cursor-not-allowed disabled:opacity-50">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <span className="flex-1 opacity-50 group-hover:opacity-100 cursor-text">Search...</span>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div>
                        </div>
                    </div>

                    {/* Right Nav Links & Icons */}
                    <div className="flex items-center space-x-4 ml-auto">
                        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                            <Link 
                                href="/documentations/introduction" 
                                className={`transition-colors hover:text-primary ${window.location.pathname.includes('/introduction') || window.location.pathname.includes('/pos') ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                                Panduan Pengguna
                            </Link>
                            <Link 
                                href="/documentations/tech-stack" 
                                className={`transition-colors hover:text-primary ${window.location.pathname.includes('/tech-stack') || window.location.pathname.includes('/database') ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                                Referensi Teknis
                            </Link>
                            <a href="/" className="transition-colors text-muted-foreground hover:text-primary">
                                Kembali ke Aplikasi
                            </a>
                        </nav>
                        
                        <div className="h-4 w-px bg-border hidden md:block" />

                        <div className="flex items-center space-x-2">
                            <ThemeToggle />
                            <a href="https://github.com/kaspos/docs" target="_blank" title="Repository" className="inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                <Github className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 md:px-8 max-w-screen-2xl mx-auto">
                {/* Sidebar - Desktop */}
                <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block py-6 pr-4 lg:py-8 pl-2 shadow-[1px_0_0_0_hsl(var(--border))]">
                    {menu.map((group, index) => (
                        <div key={index} className="pb-8">
                            <h4 className="mb-2 rounded-md px-2 py-1 text-sm font-bold tracking-tight text-foreground/80">
                                {group.title}
                            </h4>
                            <div className="grid grid-flow-row auto-rows-max text-sm gap-1">
                                {group.items.map((item, itemIndex) => (
                                    <Link
                                        key={itemIndex}
                                        href={item.url}
                                        className={`group flex w-full items-center rounded-r-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                                            item.active 
                                                ? 'border-primary bg-primary/10 text-primary' 
                                                : 'border-transparent text-muted-foreground hover:border-primary/50'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </aside>

                {/* Sidebar - Mobile Drawer */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 z-50 flex lg:hidden">
                        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                        <div className="fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-xs border-r bg-background p-6 shadow-2xl animate-in slide-in-from-left duration-300">
                            <div className="flex items-center justify-between mb-8 px-2">
                                <span className="font-bold text-xl tracking-tight text-primary">KasPOS Docs</span>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-muted rounded-full">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                {menu.map((group, index) => (
                                    <div key={index}>
                                        <h4 className="mb-2 px-2 text-sm font-bold text-foreground">
                                            {group.title}
                                        </h4>
                                        <div className="space-y-1">
                                            {group.items.map((item, itemIndex) => (
                                                <Link
                                                    key={itemIndex}
                                                    href={item.url}
                                                    className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                                                        item.active 
                                                            ? 'bg-primary/10 text-primary' 
                                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="relative py-8 lg:gap-10 xl:grid xl:grid-cols-[1fr_240px] w-full max-w-7xl mx-auto">
                    <div className="w-full min-w-0">
                        {/* Breadcrumb */}
                        <div className="mb-6 flex items-center space-x-1 text-[13px] text-muted-foreground">
                            <Link href="/documentations" className="hover:text-foreground transition-colors">Docs</Link>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">Manual Book</span>
                        </div>
                        
                        {/* Content Area with Ref */}
                        <div 
                            ref={contentRef}
                            className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg prose-headings:scroll-mt-28 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md"
                        >
                            {children}
                        </div>

                        {/* Pagination / Footer */}
                        <div className="mt-12 flex justify-between border-t pt-6">
                            <span className="text-sm text-muted-foreground">Last updated: Today</span>
                        </div>
                    </div>
                    
                    {/* Right Sidebar (Dynamic Table of Contents) */}
                    <div className="hidden xl:block text-sm">
                        <div className="sticky top-24 border-l pl-6">
                           <h4 className="font-bold mb-4 text-sm text-foreground">On This Page</h4>
                           <ul className="space-y-3 text-muted-foreground">
                               {toc.map((item) => (
                                   <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                                       <a 
                                           href={`#${item.id}`} 
                                           onClick={(e) => {
                                               e.preventDefault();
                                               document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                               setActiveId(item.id);
                                           }}
                                           className={`block transition-colors hover:text-primary ${
                                               activeId === item.id 
                                                   ? 'text-primary font-medium border-l-2 -ml-[25.5px] pl-6 border-primary' 
                                                   : ''
                                           }`}
                                       >
                                           {item.text}
                                       </a>
                                   </li>
                               ))}
                           </ul>
                           {toc.length === 0 && (
                               <p className="text-xs text-muted-foreground/50 italic">No headings found</p>
                           )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
