import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const firebaseConfig = {
    apiKey: "AIzaSyDmc0MkglkDZ5zjMiauLmOXE09c9ODd8VU",
    authDomain: "spanish-reader-app.firebaseapp.com",
    projectId: "spanish-reader-app",
    storageBucket: "spanish-reader-app.firebasestorage.app",
    messagingSenderId: "44205987838",
    appId: "1:44205987838:web:be78fd70dba382f723d2af"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
    console.log('Reading students.json...');
    const studentsPath = join(__dirname, '..', 'src', 'data', 'students.json');
    const studentsData = JSON.parse(readFileSync(studentsPath, 'utf8'));

    console.log(`Found ${studentsData.length} students to seed.`);

    let successCount = 0;
    for (const student of studentsData) {
        try {
            // Add a default points and theme if they don't exist
            const studentDoc = {
                ...student,
                points: 0,
                theme: 'var(--medium-slate-blue)'
            };

            await setDoc(doc(db, 'students', student.id), studentDoc);
            console.log(`✓ Seeded student: ${student.name}`);
            successCount++;
        } catch (error) {
            console.error(`✗ Error seeding student ${student.name}:`, error);
        }
    }

    console.log(`Seeding complete. Successfully migrated ${successCount}/${studentsData.length} students.`);
    process.exit(0);
}

seed();
