import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LinkPagination {
    url: string | null;
    label: string;
    active: boolean;
}
interface PaginationProps {
    links: LinkPagination[]
}
export default function Pagination({ links } : PaginationProps) {
    const style = 'p-2 text-sm border rounded-md bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:border-zinc-900'

    return (
        <>
            <ul className="justify-end flex items-center gap-1">
                {links.map((item, i) => {
                    return item.url != null ? (
                        item.label.includes('Previous') ? (
                            <Link className={style} key={i} href={item.url} preserveState>
                                <ChevronLeft className='size-4'/>
                            </Link>
                        ) : item.label.includes('Next') ? (
                            <Link className={style} key={i} href={item.url} preserveState>
                                <ChevronRight className='size-4'/>
                            </Link>
                        ) : (
                            <Link preserveState className={`px-3 py-1.5 text-sm border rounded-md text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:border-zinc-900 ${item.active ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-50' : 'bg-white dark:bg-zinc-950'}`} key={i} href={item.url}>
                                {item.label}
                            </Link>
                        )
                    ) : null;
                })}
            </ul>
        </>
    )
}

