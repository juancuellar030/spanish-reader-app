import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface ScoreboardProps {
    score: number;
}

export const Scoreboard = ({ score }: ScoreboardProps) => {
    return (
        <motion.div
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 overflow-hidden relative"
            whileHover={{ scale: 1.05 }}
        >
            <motion.div
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}
            >
                <Star size={20} className="text-gold fill-gold" />
            </motion.div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Puntos</span>
                <span className="text-lg font-bold text-charcoal leading-none">{score}</span>
            </div>

            {/* Shiny effect (optional) */}
            <motion.div
                className="absolute top-0 -left-10 w-8 h-full bg-white opacity-40 skew-x-12"
                animate={{ x: 200 }}
                transition={{ repeat: Infinity, duration: 3, delay: 2, ease: "easeInOut" }}
            />
        </motion.div>
    );
};
