import { getStudentProgress } from '../services/firestore';
import type { Student } from '../types';

/**
 * Class average = mean of each student's completion rate on their assigned stories.
 * Skips test accounts (grade 0) and students with no assignments.
 */
export async function computeClassAverageCompletion(students: Student[]): Promise<number | null> {
    const eligible = students.filter((s) => s.grade !== 0 && (s.assignedStories?.length ?? 0) > 0);
    if (eligible.length === 0) return null;

    const rates = await Promise.all(
        eligible.map(async (student) => {
            try {
                const progress = await getStudentProgress(student.id);
                const completed = progress.filter(
                    (p) => student.assignedStories.includes(p.storyId) && p.completed
                ).length;
                return (completed / student.assignedStories.length) * 100;
            } catch {
                return 0;
            }
        })
    );

    return Math.round(rates.reduce((sum, r) => sum + r, 0) / rates.length);
}
