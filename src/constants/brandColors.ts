/** Primary UI purple — rgb(147, 51, 234) */
export const BRAND_PRIMARY = '#9333EA';
export const BRAND_PRIMARY_RGB = '147, 51, 234';

/** Faint rounded-square background for stat / info icons (matches Promedio Clase tile) */
export const STAT_ICON_TILE = 'bg-purple-100 brand-text';

/** Faint purple container for stat cards (outer rounded box in detail modal) */
export const STAT_CARD = 'bg-purple-100 rounded-2xl border border-purple-200/40';

/** Lucide / outline icons that sit on charcoal text labels */
export const ICON_BRAND = 'brand-text shrink-0';

/** Hardcoded utility classes (see index.css) — bypass stale Tailwind cache */
export const BRAND_FILL_CLASS = 'brand-fill';
export const BRAND_TEXT_CLASS = 'brand-text';

export const brandInlineBg = { backgroundColor: BRAND_PRIMARY } as const;
export const brandIconStyle = { color: BRAND_PRIMARY, stroke: BRAND_PRIMARY } as const;
