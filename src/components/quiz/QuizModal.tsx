import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { QuizResults } from './QuizResults';
import quizzesData from '../../data/quizzes.json';
import { updateStoryProgress, getStudent, updateStudentPoints, awardCollectible } from '../../services/firestore';
import { Timestamp } from 'firebase/firestore';

interface QuizModalProps {
    storyId: string;
    studentId: string;
    onClose: () => void;
    // Collectible props — optional (only stories with collectibles send these)
    collectibleImage?: string;
    studentCollectibles?: string[];   // storyIds already earned
    onCollectibleEarned?: (storyId: string) => void;
}

interface Question {
    id: string;
    type: string;
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
}

export const QuizModal = ({ storyId, studentId, onClose, collectibleImage, studentCollectibles, onCollectibleEarned }: QuizModalProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [answers, setAnswers] = useState<any[]>([]);

    useEffect(() => {
        const quizKey = Object.keys(quizzesData).find(key => key.includes(storyId) || key.endsWith(storyId));

        if (quizKey && (quizzesData as any)[quizKey]) {
            setQuestions((quizzesData as any)[quizKey]);
        } else {
            const firstKey = Object.keys(quizzesData)[0];
            setQuestions((quizzesData as any)[firstKey]);
        }
    }, [storyId]);

    const finishQuiz = async (finalScore: number, finalAnswers: any[]) => {
        setShowResults(true);

        try {
            await updateStoryProgress(studentId, storyId, {
                status: 'completed',
                completed: true,
                percentage: 100,
                completedAt: Timestamp.now(),
                pointsEarned: finalScore,
                quizAttempts: finalAnswers,
            });

            // Add the points to the student's total
            const studentData = await getStudent(studentId);
            if (studentData) {
                await updateStudentPoints(studentId, (studentData.points || 0) + finalScore);
            }

            // Award collectible if this is a perfect score and the story has one
            const scorableQuestions = questions.filter(q => q.type !== 'open-ended');
            const maxScore = scorableQuestions.reduce((sum, q) => sum + q.points, 0);
            const isPerfect = scorableQuestions.length > 0 && finalScore >= maxScore;
            const alreadyEarned = (studentCollectibles || []).includes(storyId);

            if (isPerfect && collectibleImage && !alreadyEarned) {
                await awardCollectible(studentId, storyId);
                onCollectibleEarned?.(storyId);
            }
        } catch (err) {
            console.error('Error saving quiz results:', err);
        }
    };

    const advance = (earnedPoints: number, answerData: any) => {
        const newScore = score + earnedPoints;
        setScore(newScore);
        const newAnswers = [...answers, answerData];
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
            }, 300);
        } else {
            finishQuiz(newScore, newAnswers);
        }
    };

    const handleAnswerSelect = (selectedIndex: number) => {
        const currentQuestion = questions[currentQuestionIndex];
        const earned = selectedIndex === currentQuestion.correctAnswer ? currentQuestion.points : 0;
        advance(earned, { questionId: currentQuestion.id, answer: selectedIndex, correct: earned > 0 });
    };

    // Open-ended questions are unscored — just advance when submitted
    const handleOpenEndedSubmit = (answerText: string) => {
        const currentQuestion = questions[currentQuestionIndex];
        advance(0, { questionId: currentQuestion.id, answer: answerText, correct: true });
    };

    if (questions.length === 0) return null;

    const currentQ = questions[currentQuestionIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative overflow-hidden"
            >
                {/* Decorative top gradient stripe */}
                <div className="absolute top-0 left-0 right-0 h-2 from-purple-400 rounded-t-3xl" />

                {/* Close Button */}
                {!showResults && (
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}

                <AnimatePresence mode="wait">
                    {showResults ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <QuizResults score={score} total={questions.filter(q => q.type !== 'open-ended').length} onClose={onClose} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`question-${currentQuestionIndex}`}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                        >
                            <QuestionCard
                                question={currentQ.question}
                                options={currentQ.options}
                                type={currentQ.type}
                                onSelect={handleAnswerSelect}
                                onOpenEndedSubmit={handleOpenEndedSubmit}
                                currentQuestionIndex={currentQuestionIndex}
                                totalQuestions={questions.length}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
