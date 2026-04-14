import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { StoryCard } from './StoryCard';
import type { Story, Progress } from '../../types';
import storiesData from '../../data/stories.json';

interface StoryLibraryProps {
    assignedStories: string[];
    studentProgress: Progress[];
    onStorySelect: (story: Story) => void;
}

export const StoryLibrary = ({ assignedStories, studentProgress, onStorySelect }: StoryLibraryProps) => {
    // Filter stories based on assigned story IDs
    const stories = useMemo(() => {
        return storiesData.filter((story) => assignedStories.includes(story.id));
    }, [assignedStories]);

    const remainingToRead = useMemo(() => {
        return stories.filter(story => {
            const p = studentProgress.find(p => p.storyId === story.id);
            return !p?.completed;
        }).length;
    }, [stories, studentProgress]);

    // Container animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    // Individual card animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    // Empty state
    if (stories.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-card p-12 text-center">
                <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-charcoal mb-2">
                    No hay historias asignadas
                </h3>
                <p className="text-gray-600">
                    Habla con tu maestro para que te asigne historias para leer.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-charcoal mb-2">
                    Tus Historias 📚
                </h2>
                <p className="text-gray-600">
                    Te {remainingToRead === 1 ? 'falta' : 'faltan'} {remainingToRead} {remainingToRead === 1 ? 'historia' : 'historias'} por leer esta semana
                </p>
            </div>

            {/* Story Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {stories.map((story) => {
                    const pData = studentProgress.find(p => p.storyId === story.id);
                    return (
                        <motion.div key={story.id} variants={cardVariants}>
                            <StoryCard
                                story={story}
                                progressData={pData}
                                onClick={() => onStorySelect(story)}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};
