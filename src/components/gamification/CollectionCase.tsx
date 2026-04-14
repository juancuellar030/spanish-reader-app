import { motion } from 'framer-motion';
import storiesData from '../../data/stories.json';
import { Package } from 'lucide-react';

interface CollectionCaseProps {
    earnedCollectibles: string[];   // array of storyIds where collectible was earned
    assignedStories: string[];      // current week's assigned story IDs
}

export const CollectionCase = ({ earnedCollectibles, assignedStories }: CollectionCaseProps) => {
    // Find all stories that have a collectible image
    const allCollectibleStories = (storiesData as any[]).filter(s => s.collectibleImage);

    // Only show stories that the student has been assigned at some point (earned) or is currently assigned
    const visibleStories = allCollectibleStories.filter(s =>
        earnedCollectibles.includes(s.id) || assignedStories.includes(s.id)
    );

    if (visibleStories.length === 0) return null;

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.12 } },
    };

    const item = {
        hidden: { opacity: 0, scale: 0.5, y: 20 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 18 } },
    };

    return (
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
                <Package size={22} className="text-purple-600" />
                <h2 className="text-2xl font-bold text-charcoal">Mi Colección ✨</h2>
            </div>

            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {visibleStories.map((story) => {
                    const isEarned = earnedCollectibles.includes(story.id);
                    return (
                        <motion.div
                            key={story.id}
                            variants={item}
                            className="group relative flex flex-col items-center"
                        >
                            {/* Glow aura — only for earned items */}
                            {isEarned && (
                                <motion.div
                                    className="absolute inset-0 rounded-2xl pointer-events-none"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(250,204,21,0.40) 0%, transparent 75%)',
                                    }}
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            )}

                            {/* Item frame */}
                            <div
                                className={`relative w-full aspect-square rounded-xl flex items-center justify-center p-3 transition-transform group-hover:scale-105 ${isEarned
                                    ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-300 shadow-md shadow-yellow-200'
                                    : 'bg-gray-100 border-2 border-dashed border-gray-300'
                                    }`}
                            >
                                <img
                                    src={story.collectibleImage}
                                    alt={story.collectibleName || story.title}
                                    className={`w-full h-full object-contain transition-all duration-300 ${isEarned
                                        ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]'
                                        : 'grayscale opacity-30'
                                        }`}
                                />

                                {/* Lock overlay for unearned */}
                                {!isEarned && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                                        <span className="text-2xl opacity-50">🔒</span>
                                    </div>
                                )}

                                {/* Sparkle badge for earned */}
                                {isEarned && (
                                    <motion.div
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs shadow"
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                    >
                                        ⭐
                                    </motion.div>
                                )}
                            </div>

                            {/* Label */}
                            <p
                                className={`mt-2 text-center text-xs font-medium leading-tight ${isEarned ? 'text-amber-800' : 'text-gray-400'
                                    }`}
                            >
                                {isEarned ? (story.collectibleName || story.title) : '???'}
                            </p>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};
