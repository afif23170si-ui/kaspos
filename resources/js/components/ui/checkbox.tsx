import { InputHTMLAttributes } from 'react';
const Checkbox: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({
    className = '',
    ...props
}) => {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-rose-600 shadow-sm focus:ring-rose-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800 ' +
                className
            }
        />
    );
}

export { Checkbox };
