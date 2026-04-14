import { collection, doc, setDoc, getDoc, getDocs, updateDoc, arrayUnion, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Student, Progress } from '../types';

// ==========================================
// Students
// ==========================================

export const getStudent = async (studentId: string): Promise<Student | null> => {
    const docRef = doc(db, 'students', studentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Student;
    }
    return null;
};

export const getAllStudents = async (): Promise<Student[]> => {
    const snapshot = await getDocs(collection(db, 'students'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
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
    const docRef = doc(db, 'assignments', weekId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
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
