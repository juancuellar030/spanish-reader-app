/** Accent-insensitive, case-insensitive substring match for student name search */
export function normalizeForSearch(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '');
}

export function studentMatchesSearch(studentName: string, query: string): boolean {
    const q = query.trim();
    if (!q) return true;
    return normalizeForSearch(studentName).includes(normalizeForSearch(q));
}
