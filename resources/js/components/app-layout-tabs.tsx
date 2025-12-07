import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const layouts = [
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'header', label: 'Header' },
] as const;

export default function AppLayoutTabs() {
    const { appLayout, updateAppLayout } = useAppearance();

    return (
        <div>
            <p className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">App Page Layout</p>
            <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                {layouts.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => updateAppLayout(value)}
                        className={cn(
                            'rounded-md px-3.5 py-1.5 text-sm transition-colors',
                            appLayout === value
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60'
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
