import { motion } from 'framer-motion';
import { Play, Pause, Type, Music, BookOpen } from 'lucide-react';
import type { ReaderMode } from '../../types';

interface ReaderControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    mode: ReaderMode;
    onToggleMode: (mode: ReaderMode) => void;
    fontFamily: 'sans' | 'script';
    onToggleFont: () => void;
    progress: number;
}

export const ReaderControls = ({
    isPlaying,
    onTogglePlay,
    mode,
    onToggleMode,
    // fontFamily is consumed by parent, kept here if we want to show active state later
    onToggleFont,
    progress,
}: ReaderControlsProps) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-lg">
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-ocean-blue to-deep-purple"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    {/* Font Toggle */}
                    <button
                        onClick={onToggleFont}
                        className="p-3 rounded-xl bg-gray-100 text-charcoal hover:bg-gray-200 transition-colors"
                        title="Cambiar letra"
                    >
                        <Type size={24} />
                        <span className="sr-only">Cambiar fuente</span>
                    </button>

                    {/* Play/Pause Button */}
                    <motion.button
                        onClick={onTogglePlay}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-ocean-blue to-deep-purple text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        whileTap={{ scale: 0.95 }}
                    >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </motion.button>

                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => onToggleMode('karaoke')}
                            className={`p-3 rounded-lg transition-all ${mode === 'karaoke'
                                ? 'bg-white text-ocean-blue shadow-sm'
                                : 'text-gray-500 hover:text-charcoal'
                                }`}
                            title="Modo Karaoke"
                        >
                            <Music size={24} />
                        </button>
                        <button
                            onClick={() => onToggleMode('practice')}
                            className={`p-3 rounded-lg transition-all ${mode === 'practice'
                                ? 'bg-white text-ocean-blue shadow-sm'
                                : 'text-gray-500 hover:text-charcoal'
                                }`}
                            title="Modo Práctica"
                        >
                            <BookOpen size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
