export interface CollectibleGlowTheme {
    ringGradient: string;
    ringBorder: string;
    imageFilter: string;
    sparkleColor: string;
    accentTextClass: string;
    buttonClass: string;
    confettiColors: string[];
}

const DEFAULT_GLOW: CollectibleGlowTheme = {
    ringGradient: 'radial-gradient(circle, rgba(250,204,21,0.35) 0%, transparent 70%)',
    ringBorder: 'rgba(253, 224, 71, 0.4)',
    imageFilter: 'drop-shadow(0 0 20px rgba(250,204,21,0.8))',
    sparkleColor: '#fde047',
    accentTextClass: 'text-yellow-300',
    buttonClass: 'bg-yellow-400 hover:bg-yellow-300 text-gray-900 shadow-yellow-500/40',
    confettiColors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#F97316'],
};

/** Glow palettes keyed by collectible image filename */
const GLOW_BY_FILENAME: Record<string, CollectibleGlowTheme> = {
    'red-bean-collectible.png': {
        ringGradient: 'radial-gradient(circle, rgba(244, 63, 94, 0.45) 0%, rgba(251, 113, 133, 0.15) 45%, transparent 70%)',
        ringBorder: 'rgba(251, 113, 133, 0.55)',
        imageFilter: 'drop-shadow(0 0 28px rgba(244, 63, 94, 0.85)) drop-shadow(0 0 48px rgba(251, 113, 133, 0.45))',
        sparkleColor: '#fb7185',
        accentTextClass: 'text-rose-300',
        buttonClass: 'bg-rose-400 hover:bg-rose-300 text-white shadow-rose-500/40',
        confettiColors: ['#fb7185', '#f43f5e', '#fda4af', '#fecdd3', '#e11d48'],
    },
    'bottle_message_collectible.png': {
        ringGradient: 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, rgba(6, 182, 212, 0.15) 45%, transparent 70%)',
        ringBorder: 'rgba(34, 211, 238, 0.5)',
        imageFilter: 'drop-shadow(0 0 28px rgba(34, 211, 238, 0.85)) drop-shadow(0 0 48px rgba(6, 182, 212, 0.4))',
        sparkleColor: '#22d3ee',
        accentTextClass: 'text-cyan-300',
        buttonClass: 'bg-cyan-400 hover:bg-cyan-300 text-gray-900 shadow-cyan-500/40',
        confettiColors: ['#22d3ee', '#06b6d4', '#67e8f9', '#a5f3fc', '#0891b2'],
    },
    "bear_cub's_glasses_collectible.png": {
        ringGradient: 'radial-gradient(circle, rgba(214, 180, 137, 0.45) 0%, rgba(232, 213, 183, 0.2) 45%, transparent 70%)',
        ringBorder: 'rgba(214, 180, 137, 0.55)',
        imageFilter: 'drop-shadow(0 0 28px rgba(214, 180, 137, 0.9)) drop-shadow(0 0 48px rgba(180, 140, 90, 0.35))',
        sparkleColor: '#e8d5b7',
        accentTextClass: 'text-amber-100',
        buttonClass: 'bg-amber-200 hover:bg-amber-100 text-amber-950 shadow-amber-600/30',
        confettiColors: ['#e8d5b7', '#d6b489', '#f5e6d3', '#c4a574', '#a67c52'],
    },
    'Robot_head_collectible.png': DEFAULT_GLOW,
    'Cat_face_mask_cape_collectible.png': {
        ringGradient: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.15) 45%, transparent 70%)',
        ringBorder: 'rgba(255, 255, 255, 0.45)',
        imageFilter: 'drop-shadow(0 0 28px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 48px rgba(226, 232, 240, 0.5))',
        sparkleColor: '#f8fafc',
        accentTextClass: 'text-white/90',
        buttonClass: 'bg-white hover:bg-slate-100 text-slate-900 shadow-white/30',
        confettiColors: ['#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8'],
    },
};

export function getCollectibleGlowTheme(imagePath: string): CollectibleGlowTheme {
    const filename = imagePath.split('/').pop() ?? '';
    return GLOW_BY_FILENAME[filename] ?? DEFAULT_GLOW;
}
