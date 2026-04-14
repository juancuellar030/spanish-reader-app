import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CollectibleRevealProps {
    image: string;
    name: string;
    onClose: () => void;
}

const Sparkle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
    <motion.div
        className="absolute w-3 h-3 rounded-full bg-yellow-300"
        style={{ left: `${x}%`, top: `${y}%` }}
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

export const CollectibleReveal = ({ image, name, onClose }: CollectibleRevealProps) => {
    useEffect(() => {
        // Big celebratory confetti burst
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#F97316'],
            ticks: 300,
        });
        setTimeout(() => {
            confetti({ particleCount: 80, spread: 120, origin: { x: 0.1, y: 0.6 }, angle: 60 });
            confetti({ particleCount: 80, spread: 120, origin: { x: 0.9, y: 0.6 }, angle: 120 });
        }, 400);
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #0f0c29 100%)' }}
                onClick={onClose}
            >
                {/* Outer glow ring */}
                <motion.div
                    className="relative flex items-center justify-center"
                    initial={{ scale: 0.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                    {/* Sparkles around the item */}
                    {sparklePositions.map((pos, i) => (
                        <Sparkle key={i} x={pos.x} y={pos.y} delay={i * 0.15} />
                    ))}

                    {/* Glow rings */}
                    <motion.div
                        className="absolute rounded-full"
                        style={{ width: 260, height: 260, background: 'radial-gradient(circle, rgba(250,204,21,0.35) 0%, transparent 70%)' }}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute rounded-full border-2 border-yellow-300/40"
                        style={{ width: 220, height: 220 }}
                        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    />

                    {/* The collectible image */}
                    <motion.div
                        className="relative z-10 w-48 h-48 flex items-center justify-center"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        {/* Shine sweep effect */}
                        <motion.div
                            className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: ['−100%', '200%'], opacity: [0, 0.6, 0] }}
                            transition={{ duration: 1.5, delay: 0.8, ease: 'easeInOut' }}
                            style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)' }}
                        />
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]"
                        />
                    </motion.div>
                </motion.div>

                {/* Text */}
                <motion.div
                    className="mt-8 text-center px-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <p className="text-yellow-300 text-lg font-semibold tracking-wide mb-2 uppercase">
                        ¡Nueva pieza de colección!
                    </p>
                    <h2 className="text-white text-3xl font-bold mb-6">{name}</h2>
                    <motion.button
                        className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-full text-lg shadow-lg shadow-yellow-500/40 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onClose}
                    >
                        ¡Genial! 🌟
                    </motion.button>
                    <p className="text-white/50 text-sm mt-4">Toca en cualquier lugar para cerrar</p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
