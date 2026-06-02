import { motion } from 'framer-motion';
import storiesData from '../../data/stories.json';
import { Package } from 'lucide-react';
import { getCollectibleGlowTheme } from '../../utils/collectibleGlow';
import { ICON_BRAND, brandIconStyle } from '../../constants/brandColors';

const COLLECTIBLE_IMAGE_HEIGHT = 'h-28';

interface CollectionCaseProps {
    earnedCollectibles: string[];   // array of storyIds where collectible was earned
    assignedStories: string[];      // current week's assigned story IDs
}

export const CollectionCase = ({ earnedCollectibles, assignedStories }: CollectionCaseProps) => {
    const allCollectibleStories = (storiesData as any[]).filter(s => s.collectibleImage);

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
                <Package size={22} className={ICON_BRAND} style={brandIconStyle} />
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
                    const glow = getCollectibleGlowTheme(story.collectibleImage);

                    return (
                        <motion.div
                            key={story.id}
                            variants={item}
                            className="group relative flex flex-col items-center w-full"
                        >
                            <div className={`relative w-full ${COLLECTIBLE_IMAGE_HEIGHT} flex items-center justify-center`}>
                                {isEarned && (
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{ background: glow.ringGradient }}
                                        animate={{ opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                )}

                                <img
                                    src={story.collectibleImage}
                                    alt={story.collectibleName || story.title}
                                    className={`max-h-28 max-w-full w-auto object-contain transition-all duration-300 group-hover:scale-105 ${isEarned ? '' : 'grayscale opacity-35'
                                        }`}
                                    style={isEarned ? { filter: glow.imageFilter } : undefined}
                                />

                                {!isEarned && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-2xl opacity-60">🔒</span>
                                    </div>
                                )}

                                {isEarned && (
                                    <motion.div
                                        className={`absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow ${glow.collectionBadgeClass}`}
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                    >
                                        ⭐
                                    </motion.div>
                                )}
                            </div>

                            <div
                                className={`mt-2 w-full text-center text-xs font-semibold leading-tight rounded-xl px-2.5 py-2 border ${isEarned
                                    ? glow.labelCardClass
                                    : 'bg-gray-50 border-gray-200 text-gray-400'
                                    }`}
                            >
                                {isEarned ? (story.collectibleName || story.title) : '???'}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};
