import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

interface FlipbookAudioControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    progress: number;
}

export const FlipbookAudioControls = ({
    isPlaying,
    onTogglePlay,
    progress
}: FlipbookAudioControlsProps) => {
    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl px-4 py-2 flex items-center gap-4"
            >
                {/* Play/Pause Button */}
                <button
                    onClick={onTogglePlay}
                    className="w-14 h-14 rounded-full bg-medium-slate-blue hover:bg-gradient-to-r hover:from-medium-slate-blue hover:to-deep-purple flex items-center justify-center text-white shadow-lg transition-all active:scale-95"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                </button>

                {/* Progress Bar */}
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-medium-slate-blue to-deep-purple"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Visual Indicator */}
                {isPlaying && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex gap-1"
                    >
                        <div className="w-1 h-4 bg-medium-slate-blue rounded-full" />
                        <div className="w-1 h-4 bg-deep-purple rounded-full" />
                        <div className="w-1 h-4 bg-medium-slate-blue rounded-full" />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
