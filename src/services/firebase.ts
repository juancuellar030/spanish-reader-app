import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDmc0MkglkDZ5zjMiauLmOXE09c9ODd8VU",
    authDomain: "spanish-reader-app.firebaseapp.com",
    projectId: "spanish-reader-app",
    storageBucket: "spanish-reader-app.firebasestorage.app",
    messagingSenderId: "44205987838",
    appId: "1:44205987838:web:be78fd70dba382f723d2af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Multiple tabs open, offline persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence.');
    }
});

export { app, db };
