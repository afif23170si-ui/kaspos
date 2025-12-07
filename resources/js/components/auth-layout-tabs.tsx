import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const layouts = [
    { value: 'split', label: 'Split' },
    { value: 'simple', label: 'Simple' },
    { value: 'card', label: 'Card' },
] as const;

export default function AuthLayoutTabs() {
    const { authLayout, updateAuthLayout } = useAppearance();

    return (
        <div>
            <p className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">Auth Page Layout</p>
            <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                {layouts.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => updateAuthLayout(value)}
                        className={cn(
                            'rounded-md px-3.5 py-1.5 text-sm transition-colors',
                            authLayout === value
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
