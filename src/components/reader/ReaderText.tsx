import { motion } from 'framer-motion';

interface ReaderTextProps {
    text: string;
    currentWordIndex: number;
    fontFamily: 'sans' | 'script';
    mode: 'karaoke' | 'practice';
}

export const ReaderText = ({
    text,
    currentWordIndex,
    fontFamily,
    mode,
}: ReaderTextProps) => {
    const words = text.split(' ');

    const getFontClass = () => {
        return fontFamily === 'script' ? 'font-clicker' : 'font-poppins';
    };

    return (
        <div className={`text-4xl md:text-5xl leading-relaxed text-charcoal bg-white rounded-3xl p-8 shadow-sm ${getFontClass()}`}>
            {words.map((word, index) => {
                const isActive = index === currentWordIndex;
                const isPast = index < currentWordIndex;

                // Styling based on state
                let colorClass = 'text-charcoal';
                let scale = 1;

                if (mode === 'karaoke') {
                    if (isActive) {
                        colorClass = 'text-brand font-bold shadow-highlight rounded px-1 bg-purple-100';
                        scale = 1.1;
                    } else if (isPast) {
                        colorClass = 'text-gray-400';
                    }
                }

                return (
                    <motion.span
                        key={index}
                        className={`inline-block mr-3 transition-colors duration-200 ${colorClass}`}
                        animate={{ scale }}
                        transition={{ duration: 0.2 }}
                    >
                        {word}
                    </motion.span>
                );
            })}
        </div>
    );
};
