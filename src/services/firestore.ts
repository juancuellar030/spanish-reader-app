import { collection, doc, setDoc, getDoc, getDocs, updateDoc, arrayUnion, Timestamp, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, app } from './firebase';
import type { Student, Progress } from '../types';

// #region agent log
const debugLog = (location: string, message: string, data: Record<string, unknown>, hypothesisId: string, runId = 'pre-fix') => {
    const payload = { sessionId: 'cbfc31', location, message, data, hypothesisId, timestamp: Date.now(), runId };
    console.info('[debug cbfc31]', payload);
    fetch('http://127.0.0.1:7623/ingest/d6025ec4-1902-461d-ae6d-4b4976ec2ce2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cbfc31' },
        body: JSON.stringify(payload),
    }).catch(() => {});
};

const firestoreContext = () => {
    const auth = getAuth(app);
    return {
        projectId: app.options.projectId,
        authUid: auth.currentUser?.uid ?? null,
        isAuthenticated: !!auth.currentUser,
        online: typeof navigator !== 'undefined' ? navigator.onLine : null,
    };
};
// #endregion

// ==========================================
// Students
// ==========================================

/** Normalize Firestore docs (handles missing arrays, string grades, Name vs name) */
export function normalizeStudentDoc(id: string, data: Record<string, unknown>): Student {
    const rawGrade = data.grade ?? data.Grad;
    let grade = 0;
    if (typeof rawGrade === 'string') {
        grade = parseInt(rawGrade, 10);
    } else if (typeof rawGrade === 'number') {
        grade = rawGrade;
    }

    const name = String(data.name ?? data.Name ?? '').trim();
    const assignedStories = Array.isArray(data.assignedStories)
        ? (data.assignedStories as string[])
        : [];

    return {
        id,
        name,
        grade: Number.isFinite(grade) ? grade : 0,
        password: String(data.password ?? ''),
        assignedStories,
        points: typeof data.points === 'number' ? data.points : 0,
        collectibles: Array.isArray(data.collectibles) ? (data.collectibles as string[]) : [],
        lastAssignedWeek: typeof data.lastAssignedWeek === 'string' ? data.lastAssignedWeek : undefined,
    };
}

export const getStudent = async (studentId: string): Promise<Student | null> => {
    // #region agent log
    debugLog('firestore.ts:getStudent:entry', 'getStudent called', { studentId, ...firestoreContext() }, 'H2');
    // #endregion
    try {
        const docRef = doc(db, 'students', studentId);
        const docSnap = await getDoc(docRef);
        // #region agent log
        debugLog('firestore.ts:getStudent:success', 'getStudent completed', { studentId, exists: docSnap.exists(), ...firestoreContext() }, 'H2');
        // #endregion
        if (docSnap.exists()) {
            return normalizeStudentDoc(docSnap.id, docSnap.data() as Record<string, unknown>);
        }
        return null;
    } catch (err: unknown) {
        const e = err as { code?: string; message?: string };
        // #region agent log
        debugLog('firestore.ts:getStudent:error', 'getStudent failed', { studentId, code: e?.code, message: e?.message, ...firestoreContext() }, 'H1,H2,H4,H5');
        // #endregion
        throw err;
    }
};

export const getAllStudents = async (): Promise<Student[]> => {
    // #region agent log
    debugLog('firestore.ts:getAllStudents:entry', 'getAllStudents called', { collection: 'students', ...firestoreContext() }, 'H1,H2,H5');
    // #endregion
    try {
        const snapshot = await getDocs(collection(db, 'students'));
        // #region agent log
        debugLog('firestore.ts:getAllStudents:success', 'getAllStudents completed', { count: snapshot.size, ...firestoreContext() }, 'H1,H2,H5');
        // #endregion
        const students = snapshot.docs.map((docSnap) =>
            normalizeStudentDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
        );
        const newStudents = students.filter((s) => s.id === 'student-94' || s.id === 'student-95');
        // #region agent log
        debugLog(
            'firestore.ts:getAllStudents:normalized',
            'Normalized student list probe',
            {
                total: students.length,
                newStudents: newStudents.map((s) => ({
                    id: s.id,
                    name: s.name,
                    grade: s.grade,
                    assignedStoriesLen: s.assignedStories.length,
                    hasPassword: !!s.password,
                })),
            },
            'H1,H3,H4',
            'student-search'
        );
        // #endregion
        return students;
    } catch (err: unknown) {
        const e = err as { code?: string; message?: string };
        // #region agent log
        debugLog('firestore.ts:getAllStudents:error', 'getAllStudents failed', { code: e?.code, message: e?.message, ...firestoreContext() }, 'H1,H2,H4,H5');
        // #endregion
        throw err;
    }
};

export const updateStudentPoints = async (studentId: string, newPoints: number): Promise<void> => {
    const docRef = doc(db, 'students', studentId);
    await updateDoc(docRef, { points: newPoints });
};

// Award a collectible to a student (idempotent - arrayUnion won't duplicate)
export const awardCollectible = async (studentId: string, storyId: string): Promise<void> => {
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, {
        collectibles: arrayUnion(storyId)
    });
};

// ==========================================
// Progress (Subcollection: students/{id}/progress)
// ==========================================

export const getStudentProgress = async (studentId: string): Promise<Progress[]> => {
    const progressRef = collection(db, 'students', studentId, 'progress');
    const snapshot = await getDocs(progressRef);
    return snapshot.docs.map(doc => ({ storyId: doc.id, ...doc.data() } as Progress));
};

export const updateStoryProgress = async (studentId: string, storyId: string, data: Partial<Progress>): Promise<void> => {
    const progressRef = doc(db, 'students', studentId, 'progress', storyId);

    // Use setDoc with merge: true to avoid errors if the document doesn't exist yet
    await setDoc(progressRef, {
        ...data,
        lastUpdatedAt: Timestamp.now()
    }, { merge: true });
};

// ==========================================
// Assignments
// ==========================================

export const getWeeklyAssignments = async (weekId: string) => {
    // #region agent log
    debugLog('firestore.ts:getWeeklyAssignments:entry', 'getWeeklyAssignments called', { weekId, collection: 'assignments', ...firestoreContext() }, 'H1,H3,H5');
    // #endregion
    try {
        const docRef = doc(db, 'assignments', weekId);
        const docSnap = await getDoc(docRef);
        // #region agent log
        debugLog('firestore.ts:getWeeklyAssignments:success', 'getWeeklyAssignments completed', { weekId, exists: docSnap.exists(), ...firestoreContext() }, 'H1,H3,H5');
        // #endregion
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (err: unknown) {
        const e = err as { code?: string; message?: string };
        // #region agent log
        debugLog('firestore.ts:getWeeklyAssignments:error', 'getWeeklyAssignments failed', { weekId, code: e?.code, message: e?.message, ...firestoreContext() }, 'H1,H3,H4,H5');
        // #endregion
        throw err;
    }
};

export const saveWeeklyAssignments = async (weekId: string, assignments: Record<number, string[]>) => {
    // Save the global assignment record
    const assignmentRef = doc(db, 'assignments', weekId);
    await setDoc(assignmentRef, {
        ...assignments,
        updatedAt: Timestamp.now()
    }, { merge: true });

    // Propagate to all students based on their grade
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    const allStudents = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));

    for (const student of allStudents) {
        // If the student is the special test student (grade 0), they get all assigned stories from all grades
        const gradeStories = student.grade === 0
            ? Object.values(assignments).flat()
            : assignments[student.grade] || [];

        // 1. Update the student's assignedStories array on their main doc, also stamp the week
        await updateDoc(doc(db, 'students', student.id), {
            assignedStories: gradeStories,
            lastAssignedWeek: weekId
        });

        // 2. Initialize progress documents for any NEW stories they were assigned this week
        for (const storyId of gradeStories) {
            const progressRef = doc(db, 'students', student.id, 'progress', storyId);
            const pDoc = await getDoc(progressRef);

            if (!pDoc.exists()) {
                await setDoc(progressRef, {
                    status: 'new',
                    assignedWeek: weekId,
                    percentage: 0,
                    completed: false,
                    lastUpdatedAt: Timestamp.now()
                });
            } else {
                // If it already exists but was locked/expired, maybe reactivate it? 
                // For now, if it exists, we just ensure it's marked with the current week.
                const data = pDoc.data();
                if (data.status === 'locked') {
                    await updateDoc(progressRef, {
                        status: 'new',
                        assignedWeek: weekId,
                        lastUpdatedAt: Timestamp.now()
                    });
                }
            }
        }
    }
};

// ==========================================
// Data Reset
// ==========================================

export const resetStudentData = async (studentId: string): Promise<void> => {
    // 1. Reset points, collectibles and lastAssignedWeek on student doc
    const studentRef = doc(db, 'students', studentId);

    // 2. Delete all progress documents
    const progressRef = collection(db, 'students', studentId, 'progress');
    const snapshot = await getDocs(progressRef);

    const batch = writeBatch(db);
    batch.update(studentRef, { points: 0, collectibles: [], lastAssignedWeek: null });

    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
};

export const deleteStudent = async (studentId: string): Promise<void> => {
    // 1. Reference to student
    const studentRef = doc(db, 'students', studentId);

    // 2. Delete all progress documents
    const progressRef = collection(db, 'students', studentId, 'progress');
    const snapshot = await getDocs(progressRef);

    const batch = writeBatch(db);

    // Delete progress docs
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // Delete student doc
    batch.delete(studentRef);

    await batch.commit();
};
