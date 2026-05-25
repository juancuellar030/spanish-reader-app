import type { BackgroundTheme } from '../components/ui/BackgroundLayer';

export const TEACHER_THEME_STORAGE_KEY = 'theme_teacher';

export const isBackgroundTheme = (value: string | null): value is BackgroundTheme =>
    value === 'library' ||
    value === 'forest' ||
    value === 'space' ||
    value === 'desert' ||
    value === 'underwater' ||
    value === 'jungle';

export const loadStoredTeacherTheme = (): BackgroundTheme => {
    const saved = localStorage.getItem(TEACHER_THEME_STORAGE_KEY);
    return isBackgroundTheme(saved) ? saved : 'library';
};

export const saveTeacherTheme = (theme: BackgroundTheme) => {
    localStorage.setItem(TEACHER_THEME_STORAGE_KEY, theme);
};
