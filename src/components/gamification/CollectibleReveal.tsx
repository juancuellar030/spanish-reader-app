import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getCollectibleGlowTheme, EARNED_COLLECTIBLE_SOUND } from '../../utils/collectibleGlow';

interface CollectibleRevealProps {
    image: string;
    name: string;
    onClose: () => void;
}

const Sparkle = ({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) => (
    <motion.div
        className="absolute w-3 h-3 rounded-full"
        style={{ left: `${x}%`, top: `${y}%`, backgroundColor: color }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
        transition={{ duration: 1.2, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.8 }}
    />
);

const sparklePositions = [
    { x: 20, y: 25 }, { x: 75, y: 20 }, { x: 85, y: 65 },
    { x: 15, y: 70 }, { x: 50, y: 10 }, { x: 50, y: 88 },
    { x: 10, y: 45 }, { x: 90, y: 45 },
];

const EXIT_DURATION_MS = 450;

export const CollectibleReveal = ({ image, name, onClose }: CollectibleRevealProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const glow = getCollectibleGlowTheme(image);

    const requestClose = useCallback(() => {
        setIsVisible(false);
    }, []);

    useEffect(() => {
        const sfx = new Audio(EARNED_COLLECTIBLE_SOUND);
        sfx.volume = 0.85;
        sfx.play().catch(() => {});

        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors: glow.confettiColors,
            ticks: 300,
        });
        const t = setTimeout(() => {
            confetti({ particleCount: 80, spread: 120, origin: { x: 0.1, y: 0.6 }, angle: 60, colors: glow.confettiColors });
            confetti({ particleCount: 80, spread: 120, origin: { x: 0.9, y: 0.6 }, angle: 120, colors: glow.confettiColors });
        }, 400);
        return () => clearTimeout(t);
    }, [glow.confettiColors]);

    return (
        <AnimatePresence onExitComplete={onClose}>
            {isVisible && (
                <motion.div
                    key="collectible-reveal"
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/65 backdrop-blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: EXIT_DURATION_MS / 1000, ease: 'easeInOut' }}
                    onClick={requestClose}
                >
                    <motion.div
                        className="flex flex-col items-center text-center w-full max-w-md px-6 sm:px-8"
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 18,
                            opacity: { duration: EXIT_DURATION_MS / 1000, ease: 'easeInOut' },
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Announcement — above the image */}
                        <motion.p
                            className={`text-lg sm:text-xl font-bold tracking-wide uppercase mb-6 ${glow.accentTextClass}`}
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.45 }}
                        >
                            ¡Nueva pieza de colección!
                        </motion.p>

                        {/* Collectible image */}
                        <div className="relative flex items-center justify-center w-48 h-48 sm:w-52 sm:h-52 mb-8">
                            {sparklePositions.map((pos, i) => (
                                <Sparkle key={i} x={pos.x} y={pos.y} delay={i * 0.15} color={glow.sparkleColor} />
                            ))}

                            <motion.div
                                className="absolute rounded-full pointer-events-none"
                                style={{ width: 260, height: 260, background: glow.ringGradient }}
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.div
                                className="absolute rounded-full border-2 pointer-events-none"
                                style={{ width: 220, height: 220, borderColor: glow.ringBorder }}
                                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                            />

                            <motion.div
                                className="relative z-10 w-full h-full flex items-center justify-center"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <motion.div
                                    className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                                    initial={{ x: '-100%', opacity: 0 }}
                                    animate={{ x: ['-100%', '200%'], opacity: [0, 0.6, 0] }}
                                    transition={{ duration: 1.5, delay: 0.8, ease: 'easeInOut' }}
                                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)' }}
                                />
                                <img
                                    src={image}
                                    alt={name}
                                    className="w-full h-full object-contain"
                                    style={{ filter: glow.imageFilter }}
                                />
                            </motion.div>
                        </div>

                        {/* Label */}
                        <motion.h2
                            className="w-full text-white text-xl sm:text-2xl font-bold mb-5 drop-shadow-md rounded-2xl px-5 py-3 bg-white/15 backdrop-blur-md border border-white/25 shadow-lg leading-snug"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.45 }}
                        >
                            {name}
                        </motion.h2>

                        {/* Action — below the label */}
                        <motion.button
                            type="button"
                            className={`px-8 py-3 font-bold rounded-full text-lg shadow-lg transition-colors ${glow.buttonClass}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={requestClose}
                        >
                            ¡Genial! 🌟
                        </motion.button>

                        <motion.p
                            className="text-white/50 text-sm mt-5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.75 }}
                        >
                            Toca en cualquier lugar para cerrar
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
