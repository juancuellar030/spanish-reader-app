import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getCollectibleGlowTheme } from '../../utils/collectibleGlow';

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
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/30 backdrop-blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: EXIT_DURATION_MS / 1000, ease: 'easeInOut' }}
                    onClick={requestClose}
                >
                    <motion.div
                        className="relative flex items-center justify-center"
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 15,
                            opacity: { duration: EXIT_DURATION_MS / 1000, ease: 'easeInOut' },
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
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
                            className="relative z-10 w-48 h-48 flex items-center justify-center"
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
                    </motion.div>

                    <motion.div
                        className="mt-8 text-center px-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className={`text-lg font-semibold tracking-wide mb-2 uppercase ${glow.accentTextClass}`}>
                            ¡Nueva pieza de colección!
                        </p>
                        <h2 className="text-white text-3xl font-bold mb-6 drop-shadow-md">{name}</h2>
                        <motion.button
                            type="button"
                            className={`px-8 py-3 font-bold rounded-full text-lg shadow-lg transition-colors ${glow.buttonClass}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={requestClose}
                        >
                            ¡Genial! 🌟
                        </motion.button>
                        <p className="text-white/60 text-sm mt-4">Toca en cualquier lugar para cerrar</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
