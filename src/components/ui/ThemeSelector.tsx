import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronDown, BookOpen, TreePine, Rocket, Sun, Waves, Leaf } from 'lucide-react';
import type { BackgroundTheme } from './BackgroundLayer';

const THEME_OPTIONS: {
    id: BackgroundTheme;
    name: string;
    icon: React.ReactNode;
    color: string;
    hoverBg: string;
}[] = [
    { id: 'library', name: 'Biblioteca Mágica', icon: <BookOpen size={18} />, color: 'text-purple-600', hoverBg: 'hover:bg-purple-50' },
    { id: 'forest', name: 'Bosque Encantado', icon: <TreePine size={18} />, color: 'text-green-600', hoverBg: 'hover:bg-green-50' },
    { id: 'space', name: 'Viaje Espacial', icon: <Rocket size={18} />, color: 'text-indigo-600', hoverBg: 'hover:bg-indigo-50' },
    { id: 'desert', name: 'Desierto Salvaje', icon: <Sun size={18} />, color: 'text-orange-600', hoverBg: 'hover:bg-orange-50' },
    { id: 'underwater', name: 'Océano Profundo', icon: <Waves size={18} />, color: 'text-blue-600', hoverBg: 'hover:bg-blue-50' },
    { id: 'jungle', name: 'Templo en la Jungla', icon: <Leaf size={18} />, color: 'text-emerald-600', hoverBg: 'hover:bg-emerald-50' },
];

interface ThemeSelectorProps {
    theme: BackgroundTheme;
    onThemeChange: (theme: BackgroundTheme) => void;
    /** Lighter glass style for use on illustrated backgrounds */
    variant?: 'glass' | 'solid';
    menuAlign?: 'left' | 'right';
}

export const ThemeSelector = ({
    theme,
    onThemeChange,
    variant = 'glass',
    menuAlign = 'right',
}: ThemeSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const buttonClass =
        variant === 'glass'
            ? 'flex items-center gap-2 bg-white/25 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-white hover:bg-white/35 transition-all font-medium font-poppins border border-white/20'
            : 'flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-charcoal transition-all font-medium font-poppins border border-gray-200';

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={buttonClass}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <Palette size={20} className={variant === 'solid' ? 'text-purple-600' : ''} />
                <span>Temas</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        role="listbox"
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden py-2 z-50 border border-gray-100 ${menuAlign === 'right' ? 'right-0' : 'left-0'
                            }`}
                    >
                        {THEME_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                role="option"
                                aria-selected={theme === option.id}
                                onClick={() => {
                                    onThemeChange(option.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${option.hoverBg} ${theme === option.id ? 'bg-gray-100/80 font-bold' : 'font-medium'
                                    } text-charcoal font-poppins`}
                            >
                                <span className={option.color}>{option.icon}</span>
                                {option.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
