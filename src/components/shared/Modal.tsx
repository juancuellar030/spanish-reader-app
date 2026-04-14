import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    showCloseButton?: boolean;
}

export const Modal = ({
    isOpen,
    onClose,
    children,
    title,
    showCloseButton = true,
}: ModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-60 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            className="bg-white rounded-3xl shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-charcoal hover:text-ocean-blue transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={24} />
                                </button>
                            )}

                            {/* Title */}
                            {title && (
                                <h2 className="text-3xl font-bold text-charcoal mb-6 pr-8">
                                    {title}
                                </h2>
                            )}

                            {/* Content */}
                            <div>{children}</div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
