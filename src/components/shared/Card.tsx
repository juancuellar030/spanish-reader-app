import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export const Card = ({
    children,
    className = '',
    onClick,
    hoverable = true,
}: CardProps) => {
    const baseStyles = 'bg-white rounded-3xl shadow-card overflow-hidden';
    const hoverStyles = hoverable ? 'cursor-pointer' : '';

    const combinedClassName = `${baseStyles} ${hoverStyles} ${className}`;

    if (!hoverable) {
        return <div className={combinedClassName}>{children}</div>;
    }

    return (
        <motion.div
            className={combinedClassName}
            onClick={onClick}
            whileHover={{
                y: -8,
                scale: 1.03,
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};
