import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Maximize, Minimize } from 'lucide-react';
import { FlipbookCover } from './FlipbookCover';
import { FlipbookPage } from './FlipbookPage';
import { FlipbookAudioControls } from './FlipbookAudioControls';
import { QuizModal } from '../quiz';
import { useVTTParser } from '../../hooks/useVTTParser';
import { SmartImage } from '../shared/SmartImage';
import { updateStoryProgress } from '../../services/firestore';
import { Timestamp } from 'firebase/firestore';
import './flipbook-overrides.css';

const RealisticBarcode = ({ code }: { code: string }) => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = ((hash << 5) - hash) + code.charCodeAt(i);
        hash |= 0;
    }
    const seed = Math.abs(hash);
    const modules: number[] = [];
    modules.push(1, 0, 1);
    for (let i = 0; i < 6; i++) {
        const digit = Math.abs((seed ^ (i * 12345))) % 10;
        const patterns = [
            [0, 0, 0, 1, 1, 0, 1], [0, 0, 1, 1, 0, 0, 1], [0, 0, 1, 0, 0, 1, 1], [0, 1, 1, 1, 1, 0, 1], [0, 1, 0, 0, 0, 1, 1],
            [0, 1, 1, 0, 0, 0, 1], [0, 1, 0, 1, 1, 1, 1], [0, 1, 1, 1, 0, 1, 1], [0, 1, 1, 0, 1, 1, 1], [0, 0, 0, 1, 0, 1, 1]
        ];
        modules.push(...patterns[digit]);
    }
    modules.push(0, 1, 0, 1, 0);
    for (let i = 0; i < 6; i++) {
        const digit = Math.abs((seed ^ (i * 67890))) % 10;
        const patterns = [
            [1, 1, 1, 0, 0, 1, 0], [1, 1, 0, 0, 1, 1, 0], [1, 1, 0, 1, 1, 0, 0], [1, 0, 0, 0, 0, 1, 0], [1, 0, 1, 1, 1, 0, 0],
            [1, 0, 0, 1, 1, 1, 0], [1, 0, 1, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 0, 0], [1, 1, 1, 0, 1, 0, 0]
        ];
        modules.push(...patterns[digit]);
    }
    modules.push(1, 0, 1);

    let digits = "";
    for (let i = 0; i < 10; i++) {
        digits += Math.abs((seed ^ (i * 9876))) % 10;
    }

    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 95 50" preserveAspectRatio="none" className="w-[100px] h-[40px] mb-1">
                {modules.map((bit, i) => {
                    if (!bit) return null;
                    const isGuard = i < 3 || (i >= 45 && i < 50) || i >= 92;
                    return <rect key={i} x={i} y={0} width="1" height={isGuard ? 50 : 42} fill="black" />
                })}
            </svg>
            <span className="text-[12px] font-mono text-black/90 tracking-[0.3em] font-bold">
                {digits}
            </span>
        </div>
    );
};

interface FlipbookStory {
    id: string;
    title: string;
    grade: number;
    type: string;
    coverImage: string;
    titleImage: string;
    endImage?: string;
    audioFile?: string;
    vttFile?: string;
    themeColor?: string;
    pages: Array<{
        pageNumber: number;
        text: string;
        overlayText?: string;
        image: string;
        wordStart: number;
        wordEnd: number;
    }>;
    totalPages: number;
    wordCount: number;
}

interface FlipbookViewerProps {
    story: FlipbookStory;
    studentId: string;
    studentGrade?: number;
    onBack: () => void;
    studentCollectibles: string[];
    onCollectibleEarned: (storyId: string) => void;
    collectibleImage?: string;
}

export const FlipbookViewer = ({ story, studentId, studentGrade, onBack, studentCollectibles, onCollectibleEarned, collectibleImage }: FlipbookViewerProps) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const [showQuiz, setShowQuiz] = useState(false);
    const [useCursiveFont, setUseCursiveFont] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [prevPageIndex, setPrevPageIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [bookDimensions, setBookDimensions] = useState({ width: 600, height: 600 });
    const [dragOffset, setDragOffset] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const bookWrapperRef = useRef<HTMLDivElement>(null);
    const { cues } = useVTTParser(story.vttFile || null);

    // Record that this student opened the story
    useEffect(() => {
        if (!studentId) return;
        updateStoryProgress(studentId, story.id, {
            status: 'in-progress',
            openedAt: Timestamp.now()
        }).catch(err => console.error('Failed to record openedAt:', err));
    }, [studentId, story.id]);

    // Sound Effect refs
    const pageFlipSound = useRef(new Audio('/spanish-reader-app/assets/sounds/page-flip.mp3'));
    const lastSoundTime = useRef(0);
    const isAutoFlipping = useRef(false);
    const lastManualFlipTime = useRef(0);

    // Show font toggle only for grades 1-3
    const showFontToggle = story.grade <= 3;

    // Show audio feature only if story is < 4 AND student is < 4
    const showAudio = story.grade < 4 && (!studentGrade || studentGrade < 4);

    // Accurate Page Count Calculation
    const exactTotalPages = 6 + (story.pages.length * 2);

    // Derive the CSS position class for the book wrapper
    const getBookPositionClass = () => {
        if (currentPageIndex === 0) return 'is-cover';
        if (currentPageIndex >= exactTotalPages / 2) return 'is-back';
        return 'is-spread';
    };

    // Fullscreen Logic
    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    }, []);

    const handleExit = useCallback(async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error("Exit fullscreen error:", err);
        } finally {
            onBack();
        }
    }, [onBack]);

    // Handle Resize & Fullscreen Dimensions
    useEffect(() => {
        const updateDimensions = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);

            if (isFull) {
                const vh = window.innerHeight;
                const vw = window.innerWidth;
                let newHeight = Math.floor(vh * 0.92);
                let newWidth = newHeight;
                if (newWidth * 2 > vw * 0.92) {
                    newWidth = Math.floor((vw * 0.92) / 2);
                    newHeight = newWidth;
                }
                setBookDimensions({ width: newWidth, height: newHeight });
            } else {
                setBookDimensions({ width: 600, height: 600 });
            }
        };

        window.addEventListener('resize', updateDimensions);
        document.addEventListener('fullscreenchange', updateDimensions);
        return () => {
            window.removeEventListener('resize', updateDimensions);
            document.removeEventListener('fullscreenchange', updateDimensions);
        };
    }, []);

    // Audio Sync Logic with Offset and Auto-Flip
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            const currentTime = audio.currentTime + 0.1;
            const currentCue = cues.find(
                cue => currentTime >= cue.startTime && currentTime < cue.endTime
            );
            if (currentCue) {
                setCurrentWordIndex(currentCue.wordIndex);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentWordIndex(-1);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [cues]);

    // Auto-turn pages based on word index
    useEffect(() => {
        if (currentWordIndex === -1) return;
        if (Date.now() - lastManualFlipTime.current < 1500) return;

        let targetPage = -1;
        const firstPageStart = story.pages[0]?.wordStart ?? 0;

        if (firstPageStart > 0 && currentWordIndex < firstPageStart) {
            targetPage = 2;
        } else {
            const pageIndex = story.pages.findIndex(p =>
                currentWordIndex >= p.wordStart && currentWordIndex <= p.wordEnd
            );
            if (pageIndex !== -1) {
                targetPage = 3 + (pageIndex * 2);
            }
        }

        if (targetPage !== -1) {
            const currentSpread = currentPageIndex === 0 ? -1 : Math.floor((currentPageIndex - 1) / 2);
            const targetSpread = targetPage === 0 ? -1 : Math.floor((targetPage - 1) / 2);
            if (currentSpread !== targetSpread) {
                isAutoFlipping.current = true;
                handlePageTurn(Math.floor(targetPage / 2));
            }
        }
    }, [currentWordIndex, story, currentPageIndex]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    // Helper to render title words with highlighting
    const renderTitleWords = () => {
        const words = story.title.split(' ');
        const firstPageStart = story.pages[0]?.wordStart ?? 0;

        return words.map((word, index) => {
            const isHighlighted = index === currentWordIndex && (firstPageStart === 0 || index < firstPageStart);
            return (
                <span
                    key={index}
                    className={`inline-block transition-colors duration-200 px-1 rounded ${isHighlighted ? 'text-blue-600 bg-yellow-200' : 'text-charcoal'
                        }`}
                    style={{
                        textShadow: isHighlighted ? '0 0 0.5px currentColor' : 'none',
                    }}
                >
                    {word}{' '}
                </span>
            );
        });
    };

    // Helper to play sound with debounce
    const playFlipSound = (isInteraction: boolean = false) => {
        const now = Date.now();
        if (isInteraction) {
            lastSoundTime.current = now;
        } else if (now - lastSoundTime.current < 600) {
            return;
        }
        const sound = pageFlipSound.current;
        sound.currentTime = 0;
        sound.volume = 0.4;
        sound.play().catch(err => console.error("Audio play failed:", err));
    };

    const checkAndPlaySoundViaInteraction = (direction: 'next' | 'prev') => {
        let shouldPlay = false;
        if (direction === 'next') {
            if (currentPageIndex < Math.floor(exactTotalPages / 2)) shouldPlay = true;
        } else {
            if (currentPageIndex > 0) shouldPlay = true;
        }
        if (shouldPlay) playFlipSound(true);
    };

    const handlePageTurn = useCallback((newPageIndex: number) => {
        setPrevPageIndex(currentPageIndex);
        setCurrentPageIndex(newPageIndex);

        setIsFlipping(true);
        setTimeout(() => setIsFlipping(false), 800); // disable buttons during flip

        // Sound logic
        const isOpeningCover = newPageIndex === 1;
        const isClosingBook = newPageIndex >= Math.floor(exactTotalPages / 2);
        if (!isOpeningCover && !isClosingBook) {
            playFlipSound(false);
        }

        // Skip audio seek if auto-flipping
        if (isAutoFlipping.current) {
            isAutoFlipping.current = false;
            return;
        }

        lastManualFlipTime.current = Date.now();

        // Manual Flip Sync: Seek audio to start of new page
        if (audioRef.current && cues.length > 0) {
            let targetTime = -1;
            if (newPageIndex <= 1) {
                targetTime = 0;
            } else {
                const storyIdx = newPageIndex - 2;
                if (storyIdx >= 0 && storyIdx < story.pages.length) {
                    const wordIdx = story.pages[storyIdx].wordStart;
                    if (cues[wordIdx]) {
                        targetTime = cues[wordIdx].startTime;
                    }
                }
            }
            if (targetTime !== -1) {
                if (Math.abs(audioRef.current.currentTime - targetTime) > 0.1) {
                    audioRef.current.currentTime = targetTime;
                }
            }
        }
    }, [exactTotalPages, cues, story, currentPageIndex]);

    // Page Navigation Handlers
    const goToNextPage = useCallback(() => {
        if (currentPageIndex < Math.floor(exactTotalPages / 2)) {
            checkAndPlaySoundViaInteraction('next');
            handlePageTurn(currentPageIndex + 1);
        }
    }, [currentPageIndex, exactTotalPages, handlePageTurn]);

    const goToPreviousPage = useCallback(() => {
        if (currentPageIndex > 0) {
            checkAndPlaySoundViaInteraction('prev');
            handlePageTurn(currentPageIndex - 1);
        }
    }, [currentPageIndex, handlePageTurn]);

    const handlePan = useCallback((_e: any, info: any) => {
        if (isFlipping) return;
        let capped = info.offset.x;
        if (currentPageIndex === 0 && capped > 0) capped = 0;
        if (currentPageIndex >= Math.floor(exactTotalPages / 2) && capped < 0) capped = 0;
        capped = Math.max(-bookDimensions.width, Math.min(bookDimensions.width, capped));
        setDragOffset(capped);
    }, [bookDimensions.width, currentPageIndex, exactTotalPages, isFlipping]);

    const handlePanEnd = useCallback((_e: any, info: any) => {
        if (isFlipping) return;
        const threshold = bookDimensions.width * 0.2;
        if (info.offset.x < -threshold || info.velocity.x < -500) {
            goToNextPage();
        } else if (info.offset.x > threshold || info.velocity.x > 500) {
            goToPreviousPage();
        }
        setDragOffset(0);
    }, [bookDimensions.width, goToNextPage, goToPreviousPage, isFlipping]);

    const getPageAnimation = useCallback((pageIdx: number, baseRotateYCondition: boolean, defaultZIndex: number, isAnimatingCondition: boolean) => {
        let rotateY = baseRotateYCondition ? -180 : 0;
        let isDraggingThisPage = false;

        if (dragOffset !== 0 && !isFlipping) {
            if (dragOffset < 0 && pageIdx === currentPageIndex) {
                const progress = Math.max(-1, dragOffset / bookDimensions.width);
                rotateY = progress * 180;
                isDraggingThisPage = true;
            } else if (dragOffset > 0 && pageIdx === currentPageIndex - 1) {
                const progress = Math.min(1, dragOffset / bookDimensions.width);
                rotateY = -180 + (progress * 180);
                isDraggingThisPage = true;
            }
        }

        return {
            animate: {
                rotateY,
                zIndex: isAnimatingCondition || isDraggingThisPage ? 100 : defaultZIndex
            },
            transition: {
                duration: isDraggingThisPage ? 0 : 0.8,
                ease: (isDraggingThisPage ? "linear" : [0.645, 0.045, 0.355, 1]) as any
            }
        };
    }, [currentPageIndex, dragOffset, bookDimensions.width, isFlipping]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goToNextPage();
            if (e.key === 'ArrowLeft') goToPreviousPage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNextPage, goToPreviousPage]);

    const progress = (currentPageIndex / (exactTotalPages - 1)) * 100;

    return (
        <div className="min-h-screen bg-charcoal flex flex-col relative overflow-hidden">
            {/* Hidden Audio */}
            {showAudio && story.audioFile && (
                <audio ref={audioRef} src={story.audioFile} preload="auto" />
            )}

            {/* Header */}
            <header
                className={`p-4 sticky top-0 z-30 border-b flex items-center justify-between transition-all duration-500 ${isFullscreen
                    ? 'bg-black/0 border-transparent hover:bg-black/40 hover:border-white/10 opacity-30 hover:opacity-100'
                    : 'bg-black/30 backdrop-blur-md border-white/10 opacity-100'
                    }`}
            >
                <div className="flex items-center gap-4">
                    <button onClick={handleExit} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                    </button>
                </div>

                <h1 className={`text-lg font-bold text-white truncate px-4 transition-opacity ${isFullscreen ? 'opacity-0' : 'opacity-100'}`}>
                    {story.title}
                </h1>

                <div className="flex items-center gap-3">
                    {showFontToggle && (
                        <button
                            onClick={() => setUseCursiveFont(!useCursiveFont)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold shadow-md transition-all active:scale-95 text-sm"
                            title={useCursiveFont ? 'Cambiar a letra normal' : 'Cambiar a letra cursiva'}
                        >
                            <span className={useCursiveFont ? 'font-sans' : 'font-cursive'} style={{ fontFamily: useCursiveFont ? 'Poppins' : 'Clicker Script' }}>
                                Aa
                            </span>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            pauseAudio();
                            setShowQuiz(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold shadow-md transition-all active:scale-95 text-sm"
                    >
                        <CheckCircle size={16} />
                        <span>Terminar</span>
                    </button>
                </div>
            </header>

            {/* Main Flipbook Area */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
                {/* Outer wrapper manages the vertical entrance slide */}
                <motion.div
                    initial={{ y: "-100vh", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                    className="flex justify-center items-center"
                >
                    {/* Inner wrapper manages the horizontal centering via CSS `transform` so they don't fight */}
                    <div
                        ref={bookWrapperRef}
                        className={`book-position-wrapper relative drop-shadow-2xl rounded-sm select-none ${getBookPositionClass()}`}
                        style={{ width: bookDimensions.width * 2, height: bookDimensions.height, touchAction: 'none' }}
                    >
                        <div className="book-container w-full h-full relative">
                            {/* Book Spine Shadow */}
                            <div className="book-spine-shadow" />

                            {/* Page 0: Front Cover (Right Side) */}
                            <motion.div
                                className={`flip-page-wrapper ${currentPageIndex > 0 ? 'flipped' : ''}`}
                                initial={false}
                                {...getPageAnimation(
                                    0,
                                    currentPageIndex > 0,
                                    currentPageIndex > 0 ? 10 : 40,
                                    0 >= Math.min(prevPageIndex, currentPageIndex) && 0 < Math.max(prevPageIndex, currentPageIndex)
                                )}
                            >
                                <div className="flip-page-face flip-page-front">
                                    <FlipbookCover
                                        coverImage={story.coverImage}
                                        titleImage={story.titleImage}
                                        storyTitle={story.title}
                                    />
                                </div>
                                <div className="flip-page-face flip-page-back bg-gradient-to-r from-[#FDFBF7] to-[#F4F0EA] shadow-inner">
                                    <div
                                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 z-50"
                                        style={{ backgroundImage: 'url("/spanish-reader-app/assets/images/paper_texture.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    />
                                </div>
                            </motion.div>

                            {/* Page 1: Title Spread (Left: Blank/Inner Cover, Right: Title) */}
                            <motion.div
                                className="flip-page-wrapper"
                                initial={false}
                                {...getPageAnimation(
                                    1,
                                    currentPageIndex > 1,
                                    currentPageIndex > 1 ? 11 : 39,
                                    1 >= Math.min(prevPageIndex, currentPageIndex) && 1 < Math.max(prevPageIndex, currentPageIndex)
                                )}
                            >
                                <div className="flip-page-face flip-page-front bg-gradient-to-r from-[#F4F0EA] to-[#FDFBF7] flex items-center justify-center p-8">
                                    <div
                                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 z-50"
                                        style={{ backgroundImage: 'url("/spanish-reader-app/assets/images/paper_texture.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    />
                                    <div className="text-center w-full z-10">
                                        <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">
                                            {renderTitleWords()}
                                        </h1>
                                        <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full opacity-50"></div>
                                    </div>
                                </div>
                                <div className="flip-page-face flip-page-back">
                                    {/* Back of Title Page (Left side of first story spread) */}
                                    {story.pages.length > 0 && (
                                        <FlipbookPage
                                            pageNumber={1}
                                            text={story.pages[0].text}
                                            image={story.pages[0].image}
                                            isLeft={true}
                                            currentWordIndex={currentWordIndex}
                                            wordStartIndex={story.pages[0].wordStart}
                                            useCursiveFont={useCursiveFont}
                                            isActive={currentPageIndex === 2}
                                            grade={story.grade}
                                            isFullscreen={isFullscreen}
                                        />
                                    )}
                                </div>
                            </motion.div>

                            {/* Story Pages */}
                            {story.pages.map((page, index) => {
                                // Each sheet has an image on the front (right side of one spread) 
                                // and text on the back (left side of the next spread).
                                // The first text page is on the back of the Title spread (above).
                                const pageIdx = index + 2; // +2 offset for title and cover
                                const isFlipped = currentPageIndex > pageIdx;
                                const isLastPage = index === story.pages.length - 1;

                                // We verify if this page is currently actively animating
                                const isAnimating = pageIdx >= Math.min(prevPageIndex, currentPageIndex) &&
                                    pageIdx < Math.max(prevPageIndex, currentPageIndex);

                                let zIdx = isFlipped ? 10 + pageIdx : 40 - pageIdx;
                                if (isAnimating) {
                                    zIdx = 100;
                                }

                                return (
                                    <motion.div
                                        key={`sheet-${index}`}
                                        className="flip-page-wrapper"
                                        initial={false}
                                        {...getPageAnimation(
                                            pageIdx,
                                            isFlipped,
                                            zIdx,
                                            isAnimating
                                        )}
                                    >
                                        <div className="flip-page-face flip-page-front">
                                            {/* Image (Right side of current spread) */}
                                            <FlipbookPage
                                                pageNumber={(index * 2) + 2}
                                                text={page.text}
                                                overlayText={page.overlayText}
                                                image={page.image}
                                                isLeft={false}
                                                currentWordIndex={currentWordIndex}
                                                wordStartIndex={page.wordStart}
                                                useCursiveFont={useCursiveFont}
                                                isActive={currentPageIndex === index + 2}
                                                grade={story.grade}
                                                isFullscreen={isFullscreen}
                                            />
                                        </div>
                                        <div className="flip-page-face flip-page-back">
                                            {/* Text of NEXT page (Left side of next spread) or FIN text */}
                                            {isLastPage ? (
                                                <div className="bg-gradient-to-r from-[#FDFBF7] to-[#F4F0EA] flex flex-col items-center justify-center p-10 h-full w-full relative select-none">
                                                    <div
                                                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 z-50"
                                                        style={{ backgroundImage: 'url("/spanish-reader-app/assets/images/paper_texture.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
                                                    />
                                                    <div className="text-center w-full flex flex-col items-center justify-center h-full z-10">
                                                        <h2 className="text-5xl font-bold mb-12 text-charcoal">Fin</h2>
                                                        <button
                                                            onClick={() => setShowQuiz(true)}
                                                            className="px-8 py-3 bg-medium-slate-blue hover:bg-gradient-to-r hover:from-medium-slate-blue hover:to-deep-purple text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg"
                                                        >
                                                            Tomar Quiz
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-6 w-full text-center left-0 z-10">
                                                        <span className="text-gray-400 text-sm font-medium">
                                                            Página {(story.pages.length * 2) + 1}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <FlipbookPage
                                                    pageNumber={(index * 2) + 3}
                                                    text={story.pages[index + 1].text}
                                                    image={story.pages[index + 1].image}
                                                    isLeft={true}
                                                    currentWordIndex={currentWordIndex}
                                                    wordStartIndex={story.pages[index + 1].wordStart}
                                                    useCursiveFont={useCursiveFont}
                                                    isActive={currentPageIndex === index + 3}
                                                    grade={story.grade}
                                                    isFullscreen={isFullscreen}
                                                />
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Final Sheet: End Image and Back Cover */}
                            <motion.div
                                className="flip-page-wrapper"
                                initial={false}
                                {...getPageAnimation(
                                    story.pages.length + 2,
                                    currentPageIndex >= exactTotalPages / 2,
                                    currentPageIndex >= exactTotalPages / 2 ? 10 + story.pages.length + 2 : 40 - (story.pages.length + 2),
                                    ((story.pages.length + 2) >= Math.min(prevPageIndex, currentPageIndex) && (story.pages.length + 2) < Math.max(prevPageIndex, currentPageIndex))
                                )}
                            >
                                <div className="flip-page-face flip-page-front">
                                    <div
                                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80 z-20"
                                        style={{ backgroundImage: 'url("/spanish-reader-app/assets/images/paper_texture.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    />
                                    <SmartImage
                                        src={story.endImage || "/spanish-reader-app/assets/images/story-covers/story-1/page-end.png"}
                                        alt="The End"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div
                                    className="flip-page-face flip-page-back shadow-inner overflow-hidden"
                                    style={{ backgroundColor: story.themeColor || '#2D3748' }}
                                >
                                    <div
                                        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-30 z-20"
                                        style={{ backgroundImage: 'url("/spanish-reader-app/assets/images/paper_texture.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                                        <div className="w-24 h-24 mb-6 rounded-full bg-white/10 flex items-center justify-center">
                                            <CheckCircle size={48} className="text-white/40" />
                                        </div>
                                        <h3 className="text-white/60 text-xl font-bold uppercase tracking-widest">Fin de la historia</h3>
                                    </div>

                                    {/* Fake Barcode Card */}
                                    <div className="absolute bottom-8 right-8 bg-white/95 p-3 pt-4 pb-2 rounded shadow-lg flex flex-col items-center z-30 transform hover:scale-105 transition-transform">
                                        <RealisticBarcode code={story.id} />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Stationary Center Fold Overlays — outside the 3D perspective box */}
                        {/* Only visible when the book is open (spread showing both pages) */}
                        {currentPageIndex > 0 && currentPageIndex < Math.floor(exactTotalPages / 2) && (
                            <>
                                {/* Left-side fold depth shadow (text page edge) */}
                                <div className="absolute inset-y-0 left-1/2 -translate-x-full w-16 bg-gradient-to-l from-black/15 via-black/5 to-transparent pointer-events-none" style={{ zIndex: 999 }} />
                                {/* Right-side fold depth shadow (image page edge) */}
                                <div className="absolute inset-y-0 left-1/2 w-12 bg-gradient-to-r from-black/25 via-black/5 to-transparent pointer-events-none" style={{ zIndex: 999 }} />
                                {/* Glossy white highlight bar near the fold */}
                                <div className="absolute inset-y-0 left-1/2 -translate-x-2 w-16 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" style={{ zIndex: 999 }} />
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPreviousPage}
                disabled={currentPageIndex === 0 || isFlipping}
                className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-2xl flex items-center justify-center transition-all active:scale-95 text-charcoal disabled:opacity-40"
            >
                <ChevronLeft size={32} />
            </button>

            <button
                onClick={goToNextPage}
                disabled={currentPageIndex >= Math.floor(exactTotalPages / 2) || isFlipping}
                className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-2xl flex items-center justify-center transition-all active:scale-95 text-charcoal disabled:opacity-40"
            >
                <ChevronRight size={32} />
            </button>

            {/* Audio Controls */}
            {showAudio && (
                <div className={`transition-opacity duration-500 ${isFullscreen ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
                    <FlipbookAudioControls
                        isPlaying={isPlaying}
                        onTogglePlay={togglePlay}
                        progress={progress}
                    />
                </div>
            )}

            {/* Quiz Modal */}
            <AnimatePresence>
                {showQuiz && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 pointer-events-auto"
                    >
                        <QuizModal
                            storyId={story.id}
                            studentId={studentId}
                            onClose={() => {
                                setShowQuiz(false);
                                handleExit();
                            }}
                            studentCollectibles={studentCollectibles}
                            onCollectibleEarned={onCollectibleEarned}
                            collectibleImage={collectibleImage}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
