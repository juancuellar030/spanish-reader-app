export interface Student {
    id: string;
    name: string;
    grade: number;
    password: string;
    assignedStories: string[];
    points?: number;
    collectibles?: string[];      // storyIds for which a collectible was earned
    lastAssignedWeek?: string;    // week ID when assignedStories was last set by teacher
    assignmentDeadline?: number;  // timestamp (ms) for the deadline of the current assignments
}

export interface Story {
    id: string;
    title: string;
    grade: number;
    type?: string; // 'flipbook' or undefined for karaoke
    coverImage: string;
    previewImage3D?: string;
    audioFile: string;
    timestampFile: string;
    text: string;
    wordCount: number;
    collectibleImage?: string;    // path to the collectible PNG earned on perfect score
    collectibleName?: string;     // human-readable collectible name
}

export interface Progress {
    storyId: string;
    studentId: string;
    completed: boolean;
    percentage: number;
    lastReadPosition?: number;
    completedAt?: any;

    // New Phase 2 fields
    status?: 'new' | 'in-progress' | 'completed' | 'locked';
    assignedWeek?: string;
    openedAt?: any;
    totalReadTimeMs?: number;
    pointsEarned?: number;
    quizAttempts?: any[];
    pointsAwarded?: boolean;
}

export type ReaderMode = 'karaoke' | 'practice';
