import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

async function addTestStudent() {
    const studentRef = doc(db, "students", "tester-special");
    await setDoc(studentRef, {
        name: "Estudiante de Prueba",
        grade: 0,
        password: "🤖🚀🌟",
        assignedStories: [],
        points: 0
    });

    console.log("Test student added to Firestore!");
    process.exit(0);
}

addTestStudent().catch(console.error);
