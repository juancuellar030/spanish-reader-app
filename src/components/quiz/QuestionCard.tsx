import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

// Playful per-option color palettes: [border, bg, hover-border, label-bg, label-text]
const OPTION_COLORS = [
    ['border-rose-300', 'bg-rose-50', 'hover:border-rose-500', 'bg-rose-400', 'text-white'],
    ['border-sky-300', 'bg-sky-50', 'hover:border-sky-500', 'bg-sky-400', 'text-white'],
    ['border-emerald-300', 'bg-emerald-50', 'hover:border-emerald-500', 'bg-emerald-400', 'text-white'],
    ['border-amber-300', 'bg-amber-50', 'hover:border-amber-500', 'bg-amber-400', 'text-white'],
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface QuestionCardProps {
    question: string;
    options: string[];
    type: string;
    onSelect: (index: number) => void;
    onOpenEndedSubmit: (answer: string) => void;
    currentQuestionIndex: number;
    totalQuestions: number;
}

export const QuestionCard = ({
    question,
    options,
    type,
    onSelect,
    onOpenEndedSubmit,
    currentQuestionIndex,
    totalQuestions,
}: QuestionCardProps) => {
    const [openAnswer, setOpenAnswer] = useState('');

    const isOpenEnded = type === 'open-ended';
    const progressPercent = Math.round(((currentQuestionIndex) / totalQuestions) * 100);

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Progress bar */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-purple-500">
                        Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                    </span>
                    <span className="text-sm font-bold text-purple-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Question bubble */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-xl font-bold text-gray-800 leading-relaxed text-center">
                    {question}
                </p>
            </div>

            {isOpenEnded ? (
                /* Open-ended input */
                <div className="space-y-4">
                    <textarea
                        value={openAnswer}
                        onChange={e => setOpenAnswer(e.target.value)}
                        placeholder="Escribe tu respuesta aquí... ✏️"
                        rows={5}
                        className="w-full p-4 text-base font-medium text-gray-700 bg-white border-2 border-purple-200 rounded-2xl resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all placeholder:text-gray-400"
                    />
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onOpenEndedSubmit(openAnswer)}
                        disabled={openAnswer.trim().length < 5}
                        className="w-full py-4 flex items-center justify-center gap-2 text-white font-bold text-lg rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                        Enviar respuesta
                    </motion.button>
                </div>
            ) : (
                /* Multiple-choice options */
                <div className="space-y-3">
                    {options.map((option, index) => {
                        const [border, bg, hoverBorder, labelBg, labelText] = OPTION_COLORS[index % OPTION_COLORS.length];
                        return (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelect(index)}
                                className={`w-full p-4 text-left text-base font-medium text-gray-700 ${bg} border-2 ${border} ${hoverBorder} rounded-2xl hover:shadow-md transition-all flex items-center gap-3 group`}
                            >
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full ${labelBg} ${labelText} flex items-center justify-center font-bold text-sm`}>
                                    {OPTION_LABELS[index]}
                                </span>
                                {option}
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
