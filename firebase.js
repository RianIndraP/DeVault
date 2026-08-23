// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBbydb9YwXQer_tgOqN4pCjfDZFzEdJ9XM",
    authDomain: "devault-8349b.firebaseapp.com",
    projectId: "devault-8349b",
    storageBucket: "devault-8349b.firebasestorage.app",
    messagingSenderId: "755592110712",
    appId: "1:755592110712:web:55adb4fec5cebd6bd4c38d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);