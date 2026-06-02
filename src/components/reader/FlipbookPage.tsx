import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SmartImage } from '../shared/SmartImage';

interface FlipbookPageProps {
    pageNumber: number;
    text: string;
    overlayText?: string;
    image: string;
    isLeft: boolean;
    currentWordIndex: number;
    wordStartIndex: number;
    useCursiveFont?: boolean;
    isActive?: boolean;
    grade?: number;
    isFullscreen?: boolean;
}

export const FlipbookPage = React.memo(forwardRef<HTMLDivElement, FlipbookPageProps>(({
    pageNumber,
    text,
    overlayText,
    image,
    isLeft,
    currentWordIndex,
    wordStartIndex,
    useCursiveFont = false,
    isActive = true,
    grade,
    isFullscreen = false,
}, ref) => {
    const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);

    const renderParagraphs = (content: string, startIndex: number) => {
        if (!content) return null;
        let globalWordCounter = startIndex;
        const paragraphs = content.split('\n\n');

        return paragraphs.map((para, pIndex) => {
            const isChapterHeader = para.trim().startsWith('Capítulo');
            const words = para.trim().split(/\s+/);

            const className = isChapterHeader
                ? "font-bold text-center text-[1.25em] mb-6 text-charcoal/90"
                : "mb-4";

            return (
                <p key={pIndex} className={className}>
                    {words.map((word, wIndex) => {
                        const globalWordIndex = globalWordCounter++;
                        const isAudioHighlighted = globalWordIndex === currentWordIndex;
                        const isHovered = hoveredWordIndex === globalWordIndex;

                        let spanClass = 'inline-block px-1 rounded cursor-default select-none transition-colors duration-75 ';
                        if (isAudioHighlighted) {
                            spanClass += 'text-black bg-yellow-200';
                        } else if (isHovered) {
                            spanClass += 'text-black bg-purple-100';
                        } else {
                            spanClass += 'text-charcoal';
                        }

                        return (
                            <span
                                key={wIndex}
                                className={spanClass}
                                onMouseEnter={() => setHoveredWordIndex(globalWordIndex)}
                                onMouseLeave={() => setHoveredWordIndex(null)}
                                style={{
                                    textShadow: isAudioHighlighted ? '0 0 0.5px currentColor' : 'none',
                                }}
                            >
                                {word}{' '}
                            </span>
                        );
                    })}
                </p>
            );
        });
    };

    return (
        <div
            ref={ref}
            className={`w-full h-full flex items-center justify-center relative overflow-hidden select-none ${isLeft ? 'bg-gradient-to-r from-[#FDFBF7] to-[#F4F0EA]' : 'bg-white'
                }`}
            style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
            }}
        >
            {/* Paper Texture Overlay */}
            <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80 z-50"
                style={{
                    backgroundImage: 'url("/spanish-reader-app/assets/images/paper_texture.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />
            {isLeft ? (
                <div className="w-full h-full flex flex-col relative p-12">
                    <motion.div
                        className="flex-1 flex flex-col justify-center"
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: isActive ? 1 : 0, filter: isActive ? 'blur(0px)' : 'blur(4px)' }}
                        transition={{ duration: 0.6, delay: isActive ? 0.3 : 0 }}
                    >
                        <div className="prose prose-lg max-w-none">
                            <div
                                className={`text-charcoal ${useCursiveFont
                                    ? (grade && grade <= 2
                                        ? (isFullscreen ? 'font-cursive text-5xl leading-[1.3]' : 'font-cursive text-4xl leading-[1.3]')
                                        : (isFullscreen ? 'font-cursive text-4xl leading-tight' : 'font-cursive text-3xl leading-[1.3]'))
                                    : (grade && grade >= 4
                                        ? (isFullscreen ? 'font-noticia text-xl leading-[1.6]' : 'font-noticia text-base leading-[1.5]')
                                        : grade && grade === 3
                                            ? (isFullscreen ? 'font-noticia text-2xl leading-[1.6]' : 'font-noticia text-lg leading-[1.5]')
                                            : 'font-sans text-2xl leading-[1.6]')
                                    }`}
                                style={{
                                    fontFamily: useCursiveFont
                                        ? '"Clicker Script", cursive'
                                        : (grade && grade >= 3 ? '"Noticia Text", serif' : '"Poppins", sans-serif'),
                                }}
                            >
                                {renderParagraphs(text, wordStartIndex)}
                            </div>
                        </div>
                    </motion.div>

                    {/* Page Number */}
                    <div className="absolute bottom-6 w-full text-center left-0">
                        <span className="text-charcoal text-sm font-medium">
                            Página {pageNumber}
                        </span>
                    </div>
                </div>
            ) : (
                // Right page: Image
                <div className="w-full h-full relative">
                    <SmartImage
                        src={image}
                        alt={`Página ${pageNumber}`}
                        className="w-full h-full object-cover block"
                        draggable="false"
                        loading="eager"
                        decoding="async"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                        }}
                    />

                    {overlayText && (
                        <div className="absolute top-5 left-5 right-5 bg-[#FDFBF7]/95 p-6 pb-2 z-10">
                            <div
                                className={`text-charcoal ${useCursiveFont
                                    ? (grade && grade <= 2
                                        ? (isFullscreen ? 'font-cursive text-5xl leading-[1.3]' : 'font-cursive text-4xl leading-[1.3]')
                                        : (isFullscreen ? 'font-cursive text-4xl leading-tight' : 'font-cursive text-3xl leading-[1.3]'))
                                    : (grade && grade >= 4
                                        ? (isFullscreen ? 'font-noticia text-xl leading-[1.6]' : 'font-noticia text-base leading-[1.5]')
                                        : grade && grade === 3
                                            ? (isFullscreen ? 'font-noticia text-2xl leading-[1.6]' : 'font-noticia text-lg leading-[1.5]')
                                            : 'font-sans text-2xl leading-[1.6]')
                                    }`}
                                style={{
                                    fontFamily: useCursiveFont
                                        ? '"Clicker Script", cursive'
                                        : (grade && grade >= 3 ? '"Noticia Text", serif' : '"Poppins", sans-serif'),
                                }}
                            >
                                {renderParagraphs(overlayText, wordStartIndex + (text ? text.trim().split(/\s+/).length : 0))}
                            </div>
                        </div>
                    )}

                    {/* Page Number with highlight */}
                    <div className="absolute bottom-6 w-full text-center left-0">
                        <span className="text-charcoal bg-white/80 backdrop-blur-sm px-3 py-1 rounded-xl text-sm font-medium shadow-sm">
                            Página {pageNumber}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}));
FlipbookPage.displayName = 'FlipbookPage';
