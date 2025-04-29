
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCm8oCRx8QqDZAu2Rwk-6bM3q4pEWtZbOc",
  authDomain: "inventry-884f6.firebaseapp.com",
  projectId: "inventry-884f6",
  storageBucket: "inventry-884f6.firebasestorage.app",
  messagingSenderId: "918277930666",
  appId: "1:918277930666:web:b1cd4c7fd615fd271ddad3",
  measurementId: "G-TQK6JQE1ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const registerUser = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return signOut(auth);
};
