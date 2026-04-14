import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { Button } from '../shared/Button';

interface QuizResultsProps {
    score: number;
    total: number;
    onClose: () => void;
}

export const QuizResults = ({ score, total, onClose }: QuizResultsProps) => {
    const percentage = (score / total) * 100;

    useEffect(() => {
        if (percentage >= 70) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
            });
        }
    }, [percentage]);

    const getMessage = () => {
        if (percentage === 100) return '¡Increíble! 🌟';
        if (percentage >= 70) return '¡Muy bien! 👍';
        return '¡Sigue practicando! 💪';
    };

    return (
        <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-gold rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg"
            >
                <Star size={48} className="fill-current" />
            </motion.div>

            <h2 className="text-3xl font-bold text-charcoal mb-2">{getMessage()}</h2>
            <p className="text-xl text-gray-500 mb-8">
                Obtuviste <span className="font-bold text-ocean-blue">{score}</span> de <span className="font-bold text-ocean-blue">{total}</span> puntos
            </p>

            <div className="flex justify-center gap-4">
                <Button onClick={onClose} variant="primary" size="lg">
                    Volver a la Biblioteca
                </Button>
            </div>
        </div>
    );
};
