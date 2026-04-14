import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyles = 'font-poppins font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

    const variantStyles = {
        primary: 'bg-medium-slate-blue hover:bg-gradient-to-r hover:from-medium-slate-blue hover:to-deep-purple text-white shadow-button hover:shadow-button-hover',
        secondary: 'border-2 border-medium-slate-blue text-medium-slate-blue bg-transparent hover:bg-gradient-to-r hover:from-medium-slate-blue hover:to-deep-purple hover:text-white hover:border-transparent',
        icon: 'bg-white shadow-md hover:shadow-lg rounded-full flex items-center justify-center',
    };

    const sizeStyles = {
        sm: variant === 'icon' ? 'w-10 h-10' : 'px-4 py-2 text-sm',
        md: variant === 'icon' ? 'w-14 h-14' : 'px-8 py-4 text-base',
        lg: variant === 'icon' ? 'w-16 h-16' : 'px-10 py-5 text-lg',
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    return (
        <motion.button
            className={combinedClassName}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                children
            )}
        </motion.button>
    );
};
