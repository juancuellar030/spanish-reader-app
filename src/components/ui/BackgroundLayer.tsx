

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Lightning from './Lightning';

export type BackgroundTheme = 'forest' | 'space' | 'desert' | 'underwater' | 'jungle' | 'library';

const ShootingStars = () => {
    const stars = [
        { id: 1, top: "5%", left: "70%", delay: 2, duration: 1.2, repeatDelay: 11 },
        { id: 2, top: "20%", left: "90%", delay: 8, duration: 1.5, repeatDelay: 17 },
        { id: 3, top: "-10%", left: "50%", delay: 15, duration: 1.3, repeatDelay: 13 },
        { id: 4, top: "10%", left: "110%", delay: 4, duration: 1.8, repeatDelay: 19 },
    ];

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute w-[2px] h-[150px] bg-gradient-to-b from-transparent via-white/40 to-white rounded-full"
                    style={{
                        top: star.top,
                        left: star.left,
                        rotate: "45deg",
                        transformOrigin: "center"
                    }}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        x: ["0px", "-800px"],
                        y: ["0px", "800px"],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        repeatDelay: star.repeatDelay,
                        delay: star.delay,
                        ease: "linear"
                    }}
                >
                    {/* Glowing head */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[4px] h-[4px] bg-white rounded-full shadow-[0_0_10px_3px_rgba(255,255,255,1)]" />
                </motion.div>
            ))}
        </div>
    );
};

const Bubbles = () => {
    const bubbleProps = [
        // Left string
        { id: 1, size: 45, left: '10%', delay: 0, duration: 8 },
        { id: 2, size: 20, left: '12%', delay: 2.5, duration: 6 },
        { id: 3, size: 55, left: '8%', delay: 1, duration: 10 },
        { id: 4, size: 25, left: '11%', delay: 4, duration: 7 },
        { id: 5, size: 35, left: '9%', delay: 5.5, duration: 9 },
        { id: 11, size: 15, left: '13%', delay: 7, duration: 5 },

        // Right string
        { id: 6, size: 50, left: '85%', delay: 0.5, duration: 9 },
        { id: 7, size: 25, left: '88%', delay: 3, duration: 7 },
        { id: 8, size: 20, left: '86%', delay: 1.5, duration: 6 },
        { id: 9, size: 40, left: '84%', delay: 4.5, duration: 8 },
        { id: 10, size: 30, left: '87%', delay: 6.5, duration: 7 },
        { id: 12, size: 18, left: '89%', delay: 8, duration: 6 },
    ];

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {bubbleProps.map((bubble) => (
                <motion.div
                    key={bubble.id}
                    className="absolute rounded-full border-[1.5px] border-white/60 bg-white/10 shadow-[0_0_5px_rgba(255,255,255,0.2),inset_0_0_12px_rgba(255,255,255,0.4)] backdrop-blur-[1px]"
                    style={{
                        width: bubble.size,
                        height: bubble.size,
                        left: bubble.left,
                        bottom: "-10%",
                    }}
                    initial={{ y: "0vh", x: "0px", opacity: 0 }}
                    animate={{
                        y: ["0vh", "-120vh"],
                        x: ["0px", "15px", "-15px", "0px"],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        y: { duration: bubble.duration, repeat: Infinity, ease: "linear", delay: bubble.delay },
                        x: { duration: bubble.duration * 0.33, repeat: Infinity, ease: "easeInOut", repeatType: "mirror", delay: bubble.delay },
                        opacity: { duration: bubble.duration, repeat: Infinity, ease: "linear", delay: bubble.delay, times: [0, 0.1, 0.9, 1] }
                    }}
                >
                    {/* Inner highlight to match the reference bubble */}
                    <div className="absolute top-[15%] right-[20%] w-[35%] h-[35%] bg-white/80 rounded-full blur-[1.5px]" />
                </motion.div>
            ))}
        </div>
    );
};

const FallingLeaves = () => {
    const leaves = [
        { id: 1, src: "leaf1.png", size: "w-24 h-24", blur: "blur-[2px]", delay: 0, duration: 12, startX: 100, endX: -20, swayDur: 3, rotDur: 4 },
        { id: 2, src: "leaf2.png", size: "w-12 h-12", blur: "blur-[1px]", delay: 3, duration: 15, startX: 120, endX: 10, swayDur: 4, rotDur: 5 },
        { id: 3, src: "leaf2.png", size: "w-6 h-6", blur: "blur-none", delay: 7, duration: 18, startX: 80, endX: -10, swayDur: 2.5, rotDur: 3.5 },
        { id: 4, src: "leaf3.png", size: "w-16 h-16", blur: "blur-[1.5px]", delay: 10, duration: 14, startX: 110, endX: 0, swayDur: 3.5, rotDur: 4.5 },
        { id: 5, src: "leaf1.png", size: "w-20 h-20", blur: "blur-[1.5px]", delay: 5, duration: 11, startX: 90, endX: -30, swayDur: 2.8, rotDur: 3.8 },
        { id: 6, src: "leaf2.png", size: "w-8 h-8", blur: "blur-[0.5px]", delay: 1, duration: 20, startX: 130, endX: 20, swayDur: 4.5, rotDur: 6 },
        { id: 7, src: "leaf2.png", size: "w-10 h-10", blur: "blur-[1px]", delay: 12, duration: 16, startX: 70, endX: -40, swayDur: 3.2, rotDur: 4 },
        { id: 8, src: "leaf4.png", size: "w-14 h-14", blur: "blur-[1.5px]", delay: 15, duration: 13, startX: 105, endX: -15, swayDur: 3.7, rotDur: 5.5 },
    ];

    return (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {leaves.map((leaf) => (
                <motion.div
                    key={leaf.id}
                    className="absolute top-0 left-0"
                    initial={{ y: "-20vh", x: `${leaf.startX}vw` }}
                    animate={{
                        y: ["-20vh", "120vh"],
                        x: [`${leaf.startX}vw`, `${leaf.endX}vw`]
                    }}
                    transition={{
                        duration: leaf.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: leaf.delay
                    }}
                >
                    <motion.div
                        className={`${leaf.size} ${leaf.blur} origin-center`}
                        animate={{
                            x: ["-3vw", "3vw", "-3vw"],
                            rotate: [0, 360]
                        }}
                        transition={{
                            x: { duration: leaf.swayDur, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: leaf.rotDur, repeat: Infinity, ease: "linear" }
                        }}
                    >
                        <img
                            src={`/spanish-reader-app/assets/images/backgrounds/${leaf.src}`}
                            alt="Falling leaf"
                            className="w-full h-full object-contain drop-shadow-xl"
                        />
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
};

const RandomizedLightning = () => {
    interface StrikeState {
        x: number;
        opacity: number;
        intensity: number;
    }
    const [strike, setStrike] = useState<StrikeState>({ x: 0, opacity: 0, intensity: 0 });
    const timerRef = useRef<any>(null);

    useEffect(() => {
        const triggerStrike = () => {
            // Random position (-1.2 to 1.2)
            const newX = (Math.random() * 2.4) - 1.2;
            const newIntensity = 1.2 + Math.random() * 2.5;

            // Strike ON
            setStrike({ x: newX, opacity: 1, intensity: newIntensity });

            // Strike OFF after 200ms
            setTimeout(() => {
                setStrike(prev => ({ ...prev, opacity: 0 }));

                // Double strike chance
                if (Math.random() > 0.8) {
                    setTimeout(() => {
                        setStrike(prev => ({ ...prev, opacity: 1 }));
                        setTimeout(() => {
                            setStrike(prev => ({ ...prev, opacity: 0 }));
                        }, 200);
                    }, 200);
                }
            }, 500);

            // Schedule next strike
            const nextDelay = 2000 + Math.random() * 5000;
            timerRef.current = setTimeout(triggerStrike, nextDelay);
        };

        // First strike after 1 second for faster feedback
        timerRef.current = setTimeout(triggerStrike, 1000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <div
            className="absolute inset-0 z-[1] mix-blend-screen pointer-events-none transition-opacity duration-75"
            style={{ opacity: strike.opacity }}
        >
            {/* Main Sharp Bolt */}
            <Lightning
                hue={280}
                xOffset={strike.x}
                speed={0.3}
                intensity={strike.intensity}
                size={2.3}
            />

            {/* Glow / Bloom Layer */}
            <div className="absolute inset-0 blur-[20px] opacity-80">
                <Lightning
                    hue={260}
                    xOffset={strike.x}
                    speed={0.3}
                    intensity={strike.intensity * 0.9}
                    size={3.3}
                />
            </div>

            {/* Secondary softer glow */}
            <div className="absolute inset-0 blur-[60px] opacity-40">
                <Lightning
                    hue={290}
                    xOffset={strike.x}
                    speed={0.3}
                    intensity={strike.intensity * 0.5}
                    size={5.3}
                />
            </div>
        </div>
    );
};

interface BackgroundLayerProps {
    theme: BackgroundTheme;
    showIntro?: boolean;
}

export const BackgroundLayer = ({ theme, showIntro = true }: BackgroundLayerProps) => {

    const floatAnimation = {
        y: [0, -20, 0],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    };

    const flyAnimation = {
        x: ["0vw", "110vw"],
        y: ["0vh", "-45vh"],
        scale: [1, 0.5],
        transition: {
            duration: 15,
            repeat: Infinity,
            ease: "linear" as const,
            times: [0, 0.1, 0.9, 1]
        }
    };

    const getThemeContent = () => {
        switch (theme) {
            case 'forest':
                return (
                    <motion.div
                        key="forest"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Main Background */}
                        <div
                            className="absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-1000"
                            style={{ backgroundImage: "url('/spanish-reader-app/assets/images/backgrounds/forest.png')" }}
                        />
                        {/* Overlay: Princess Dragon */}
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            <div className="absolute left-0 -top-[10%] w-full h-[120%] translate-y-12">
                                <motion.div
                                    className="w-full h-full"
                                    animate={floatAnimation}
                                >
                                    <img
                                        src="/spanish-reader-app/assets/images/backgrounds/princess-dragon.png"
                                        alt="Princess and Dragon"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'space':
                return (
                    <motion.div
                        key="space"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-1000"
                            style={{ backgroundImage: "url('/spanish-reader-app/assets/images/backgrounds/alien-planet.png')" }}
                        />
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            {/* Shooting Stars Behind other elements */}
                            <ShootingStars />

                            {/* Planet - Standard Float */}
                            <motion.div
                                className="absolute inset-0 w-full h-full"
                                animate={floatAnimation}
                            >
                                <img
                                    src="/spanish-reader-app/assets/images/backgrounds/planet.png"
                                    alt="Planet"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Astronaut - Shifted Down Float */}
                            <div className="absolute inset-0 w-full h-full translate-y-12">
                                <motion.div
                                    className="w-full h-full"
                                    animate={floatAnimation}
                                >
                                    <img
                                        src="/spanish-reader-app/assets/images/backgrounds/astronaut.png"
                                        alt="Astronaut"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'desert':
                return (
                    <motion.div
                        key="desert"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-1000"
                            style={{ backgroundImage: "url('/spanish-reader-app/assets/images/backgrounds/desert.png')" }}
                        />
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            {/* Eagle with specific flight path */}
                            {/* Tip: Use arbitrary values like w-[100px] h-[100px] to tweak the size specifically */}
                            <div className="absolute top-[40%] left-[-10%] w-[130px] h-[130px] z-10">
                                <motion.div
                                    className="w-full h-full"
                                    animate={flyAnimation}
                                >
                                    <img
                                        src="/spanish-reader-app/assets/images/backgrounds/eagle.png"
                                        alt="Eagle"
                                        className="w-full h-full object-contain flip-horizontal"
                                    />
                                </motion.div>
                            </div>

                            {/* Cactus Foreground Layer */}
                            <div
                                className="absolute inset-0 bg-cover bg-center z-20 transition-opacity duration-1000"
                                style={{ backgroundImage: "url('/spanish-reader-app/assets/images/backgrounds/desert-cactus.png')" }}
                            />

                            {/* Cowboy Floating */}
                            <div className="absolute inset-0 w-full h-full translate-y-12 z-30">
                                <motion.div
                                    className="w-full h-full"
                                    animate={floatAnimation}
                                >
                                    <img
                                        src="/spanish-reader-app/assets/images/backgrounds/cowboy.png"
                                        alt="Cowboy"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'underwater':
                return (
                    <motion.div
                        key="underwater"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Base Background */}
                        <div
                            className="absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-1000"
                            style={{ backgroundImage: "url('/spanish-reader-app/assets/images/backgrounds/underwater.png')" }}
                        />
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            {/* Bubbles behind Mermaid */}
                            <Bubbles />

                            {/* Mermaid and Coral Reef - Float Animation */}
                            <div className="absolute inset-0 w-full h-full translate-y-12 z-10">
                                <motion.div
                                    className="w-full h-full"
                                    animate={floatAnimation}
                                >
                                    <img
                                        src="/spanish-reader-app/assets/images/backgrounds/mermaid-coral-reef.png"
                                        alt="Mermaid and Coral Reef"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'jungle':
                return (
                    <motion.div
                        key="jungle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Base Background */}
                        <div
                            className="absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-1000"
                            style={{ backgroundImage: "url('/spanish-reader-app/assets/images/backgrounds/jungle-temple.png')" }}
                        />

                        {/* Falling Leaves */}
                        <FallingLeaves />

                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            {/* Monkey Liana */}
                            <motion.div
                                className="absolute -top-[10%] -right-[2%] w-[35vw] max-w-[210px] origin-top"
                                animate={{
                                    rotate: [-5, 8, -3, 5, -5],
                                }}
                                transition={{
                                    duration: 12,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <img
                                    src="/spanish-reader-app/assets/images/backgrounds/monkey-liana.png"
                                    alt="Monkey on liana"
                                    className="w-full h-auto object-contain drop-shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                );

            case 'library':
                return (
                    <motion.div
                        key="library"
                        initial={showIntro ? { opacity: 0 } : { opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: showIntro ? 1 : 0 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* 1. Magical Sky */}
                        <div
                            className="absolute top-[-35%] inset-0 bg-cover bg-center z-0"
                            style={{ backgroundImage: "url('/spanish-reader-app/assets/images/backgrounds/magical-sky.png')" }}
                        />

                        {/* 2. Randomized Lightning Effect */}
                        <RandomizedLightning />

                        {/* 3. Clouds (moved up and smaller to sway side to side) */}
                        <div className="absolute inset-0 z-[2] flex items-start justify-center pointer-events-none">
                            <motion.div
                                className="absolute top-[-35%]"
                                style={{ width: '95%', height: '95%' }}
                                animate={{ x: ["-3%", "3%", "-3%"] }}
                                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <img
                                    src="/spanish-reader-app/assets/images/backgrounds/clouds.png"
                                    alt="Clouds"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        </div>

                        {/* 4. Library */}
                        <div
                            className="absolute inset-0 bg-cover bg-center z-[3] duration-1000 pointer-events-none"
                            style={{ backgroundImage: "url('/spanish-reader-app/assets/images/backgrounds/library.png')" }}
                        />

                        {/* 5. Children Pedestal */}
                        <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
                            <motion.div
                                className="absolute -bottom-[8%] -right-[-4%] w-[40vw] max-w-[470px]"
                                animate={floatAnimation}
                            >
                                <img
                                    src="/spanish-reader-app/assets/images/backgrounds/children-pedestal.png"
                                    alt="Children reading on pedestal"
                                    className="w-full h-auto object-contain drop-shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full -z-10 bg-gray-900 transition-colors duration-500">
            <AnimatePresence mode="wait">
                {getThemeContent()}
            </AnimatePresence>
        </div>
    );
};
