import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

/** Custom quiz option palette (A–D) */
export const QUIZ_OPTION_COLORS = [
    '#3BBFCC',
    '#D6588C',
    '#EFAD3C',
    '#A749EB',
] as const;

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const STAGGER_BASE_DELAY = 0.12;
const STAGGER_STEP = 0.14;

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
        <div className="w-full mx-auto">
            {/* Progress bar */}
            <div className="mb-5 md:mb-6">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm md:text-base font-bold text-purple-600">
                        Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                    </span>
                    <span className="text-sm md:text-base font-bold text-purple-500">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 md:h-4 bg-purple-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#A749EB] to-[#D6588C] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 mb-6 md:mb-8 shadow-sm">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 leading-relaxed text-center">
                    {question}
                </p>
            </div>

            {isOpenEnded ? (
                <div className="space-y-4 max-w-xl mx-auto">
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
                        className="w-full py-4 flex items-center justify-center gap-2 text-white font-bold text-lg rounded-2xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#A749EB' }}
                    >
                        <Send size={20} />
                        Enviar respuesta
                    </motion.button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
                    {options.map((option, index) => {
                        const fill = QUIZ_OPTION_COLORS[index % QUIZ_OPTION_COLORS.length];
                        const label = OPTION_LABELS[index];
                        const isThirdCentered = options.length === 3 && index === 2;

                        const optionButton = (
                            <motion.button
                                type="button"
                                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    delay: STAGGER_BASE_DELAY + index * STAGGER_STEP,
                                    duration: 0.4,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                whileHover={{ scale: 1.02, filter: 'brightness(1.05)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelect(index)}
                                className="min-h-[4.5rem] sm:min-h-[5.5rem] md:min-h-[6.5rem] lg:min-h-[7.5rem] w-full p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl text-white font-semibold text-left flex items-center gap-3 md:gap-4 shadow-lg hover:shadow-xl transition-shadow"
                                style={{ backgroundColor: fill }}
                            >
                                <span
                                    className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-white flex items-center justify-center font-black text-lg md:text-xl shadow-sm"
                                    style={{ color: fill }}
                                    aria-hidden
                                >
                                    {label}
                                </span>
                                <span className="flex-1 text-base md:text-lg lg:text-xl leading-snug pr-1">
                                    {option}
                                </span>
                            </motion.button>
                        );

                        if (isThirdCentered) {
                            return (
                                <div
                                    key={index}
                                    className="sm:col-span-2 flex justify-center"
                                >
                                    <div className="w-full sm:max-w-[calc(50%-0.375rem)] md:max-w-[calc(50%-0.5rem)]">
                                        {optionButton}
                                    </div>
                                </div>
                            );
                        }

                        return <div key={index}>{optionButton}</div>;
                    })}
                </div>
            )}
        </div>
    );
};
