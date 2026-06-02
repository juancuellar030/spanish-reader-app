import { motion } from 'framer-motion';
import { BookOpen, Award, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Story, Progress } from '../../types';
import { SmartImage } from '../shared/SmartImage';
import { BRAND_PRIMARY, BRAND_FILL_CLASS, brandInlineBg } from '../../constants/brandColors';

interface StoryCardProps {
    story: Story;
    progressData?: Progress;
    onClick: () => void;
}

export const StoryCard = ({ story, progressData, onClick }: StoryCardProps) => {
    const progress = progressData?.percentage || 0;
    const isCompleted = progressData?.status === 'completed' || progressData?.completed;
    const isNew = progressData?.status === 'new';
    const isLocked = progressData?.status === 'locked';

    const has3DImage = !!story.previewImage3D;
    const imageSrc = story.previewImage3D || story.coverImage;

    // Use varying animation duration to make floating look organic and offset between cards
    const floatDurationY = 2 + ((story.id.length % 3) * 0.5);
    const floatDurationX = floatDurationY * 1.33; // Desync X and Y to create unpredictable Lissajous curves
    const offsetY = 5 + (story.id.length % 3); // Reduced amplitude to avoid exaggeration
    const offsetX = 3 + (story.id.length % 2);

    return (
        <motion.div
            className={`relative group flex flex-col items-center justify-end w-full h-[350px] ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            onClick={isLocked ? undefined : onClick}
            initial={{ y: 0, x: 0 }}
            animate={isLocked ? { y: 0, x: 0 } : { y: [0, -offsetY], x: [0, offsetX] }}
            transition={{
                y: {
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: floatDurationY,
                    ease: "easeInOut"
                },
                x: {
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: floatDurationX,
                    ease: "easeInOut"
                }
            }}
            whileHover={isLocked ? undefined : { scale: 1.02, transition: { duration: 0.3 } }}
        >
            {/* NEW Badge */}
            {isNew && (
                <div className="absolute top-16 -left-[-45px] z-40 bg-gradient-to-r from-green-400 to-green-500 text-white text-lg font-black px-3 py-1 rounded-full border-[3px] border-white shadow-xl flex items-center gap-1 transform rotate-[-35deg]">
                    <Sparkles size={12} className="text-yellow-200" />
                    <span>¡NUEVO!</span>
                </div>
            )}

            {/* The Book Image Container */}
            <div className={`relative w-[85%] h-auto max-h-[320px] transition-all duration-300 z-20 ${!isLocked && 'group-hover:-translate-y-4 group-hover:scale-[1.03] group-active:scale-95'} flex items-center justify-center ${!has3DImage && 'shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] rounded-r-xl rounded-l-sm border-l-[8px] border-l-black/30'}`}>

                {/* Image itself with optional visual filters */}
                <div className={`relative w-full h-full ${isLocked ? 'grayscale opacity-60' : ''}`}>
                    <SmartImage
                        src={imageSrc}
                        alt={story.title}
                        className={`w-full h-full object-contain ${!has3DImage ? 'rounded-r-xl rounded-l-sm' : ''}`}
                    />

                    {/* Locked overlay lock icon */}
                    {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-charcoal/80 text-white p-4 rounded-full backdrop-blur-sm shadow-xl">
                                <Lock size={32} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Shiny highlight overlay for flat images to mimic cover gloss */}
                {!has3DImage && !isLocked && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl rounded-l-sm pointer-events-none" />
                )}
            </div>

            {/* Info Overlay (slides up and fades in on hover, sitting slightly over the bottom of the book) */}
            <div className={`absolute bottom-2 left-0 w-full opacity-0 ${!isLocked && 'group-hover:opacity-100'} transition-all duration-300 translate-y-6 ${!isLocked && 'group-hover:translate-y-0'} z-30 flex flex-col items-center pointer-events-none`}>
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-white/50 flex flex-col items-center text-center w-11/12 mx-auto pointer-events-auto group-active:scale-[0.98] transition-transform">
                    {/* Grade Badge */}
                    <div
                        className={`absolute -top-3 right-3 text-white rounded-full px-3 py-0.5 shadow-md flex items-center gap-1 border-2 border-white ${BRAND_FILL_CLASS}`}
                        style={brandInlineBg}
                    >
                        <Award size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Grado {story.grade}</span>
                    </div>

                    <h3 className="text-charcoal font-black mb-1 mt-2 leading-tight text-[17px] line-clamp-2">{story.title}</h3>

                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4 font-medium">
                        <BookOpen size={12} />
                        <span>{story.wordCount} palabras</span>
                    </div>

                    {!isLocked && (
                        <button
                            style={!isCompleted ? brandInlineBg : undefined}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 w-full text-white ${isCompleted
                                ? 'bg-green-500 hover:bg-green-600'
                                : `${BRAND_FILL_CLASS} hover:opacity-90`
                                }`}
                        >
                            {isCompleted ? 'Leer de nuevo' : (progress > 0 ? 'Continuar' : 'Comenzar a leer')}
                        </button>
                    )}

                    {/* Progress Indication */}
                    {progress > 0 && progress < 100 && !isCompleted && (
                        <div className="w-full mt-3 flex items-center gap-2 px-1">
                            <span className="text-[10px] font-bold whitespace-nowrap brand-text" style={{ color: BRAND_PRIMARY }}>{progress}%</span>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full rounded-full brand-fill"
                                    style={{ width: `${progress}%`, backgroundColor: BRAND_PRIMARY }}
                                />
                            </div>
                        </div>
                    )}
                    {isCompleted && (
                        <div className="w-full mt-3 flex justify-center">
                            <span className="text-[11px] text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200 flex flex-row items-center justify-center gap-1">
                                <CheckCircle2 size={14} /> ¡Completado!
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
