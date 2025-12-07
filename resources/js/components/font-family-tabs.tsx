import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const fonts = [
    { value: 'font-sans', label: 'Winky Sans' },
    { value: 'font-inter', label: 'Inter' },
    { value: 'font-poppins', label: 'Poppins' },
    { value: 'font-roboto', label: 'Roboto' },
    { value: 'font-figtree', label: 'Figtree' },
] as const;

export default function FontFamilyTabs() {
    const { fontFamily, updateFontFamily } = useAppearance();

    return (
        <div>
            <p className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">Font Family</p>
            <div className="inline-flex flex-wrap gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                {fonts.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => updateFontFamily(value)}
                        className={cn(
                            'rounded-md px-3.5 py-1.5 text-sm transition-colors',
                            fontFamily === value
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
