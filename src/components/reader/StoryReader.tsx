import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { ReaderText } from './ReaderText';
import { ReaderControls } from './ReaderControls';
import { QuizModal } from '../quiz';
import type { Story, ReaderMode } from '../../types';
import { updateStoryProgress } from '../../services/firestore';
import { Timestamp } from 'firebase/firestore';

interface StoryReaderProps {
    story: Story;
    studentId: string;
    onBack: () => void;
}

export const StoryReader = ({ story, studentId, onBack }: StoryReaderProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const [mode, setMode] = useState<ReaderMode>('karaoke');
    const [fontFamily, setFontFamily] = useState<'sans' | 'script'>('sans');
    const [showQuiz, setShowQuiz] = useState(false);

    // Record that the student opened the story
    useEffect(() => {
        const recordOpen = async () => {
            await updateStoryProgress(studentId, story.id, {
                status: 'in-progress',
                openedAt: Timestamp.now()
            });
        };
        recordOpen();
    }, [studentId, story.id]);

    // Mock audio sync effect for karaoke mode
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying && mode === 'karaoke') {
            interval = setInterval(() => {
                setCurrentWordIndex((prev) => {
                    if (prev >= story.wordCount - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 500); // Simulated 500ms per word speed
        }
        return () => clearInterval(interval);
    }, [isPlaying, mode, story.wordCount]);

    const progress = ((currentWordIndex + 1) / story.wordCount) * 100;

    return (
        <div className="min-h-screen bg-soft-gray flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-charcoal"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-charcoal truncate px-4">
                    {story.title}
                </h1>

                {/* Finish Button */}
                <button
                    onClick={() => setShowQuiz(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold shadow-md transition-all active:scale-95 text-sm"
                >
                    <CheckCircle size={16} />
                    <span>Terminar</span>
                </button>
            </header>

            {/* Reading Area */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 pb-32">
                <ReaderText
                    text={story.text}
                    currentWordIndex={currentWordIndex}
                    mode={mode}
                    fontFamily={fontFamily}
                />
            </div>

            {/* Controls */}
            <ReaderControls
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                mode={mode}
                onToggleMode={(newMode) => {
                    setMode(newMode);
                    setIsPlaying(false);
                    setCurrentWordIndex(-1);
                }}
                fontFamily={fontFamily}
                onToggleFont={() => setFontFamily(prev => prev === 'sans' ? 'script' : 'sans')}
                progress={progress}
            />

            {/* Quiz Modal */}
            <motion.div
                initial={false}
                animate={showQuiz ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
                className="fixed inset-0 z-50 pointer-events-none"
            >
                {showQuiz && (
                    <QuizModal
                        storyId={story.id}
                        studentId={studentId}
                        onClose={() => {
                            setShowQuiz(false);
                            onBack(); // Return to library after quiz
                        }}
                    />
                )}
            </motion.div>
        </div>
    );
};
