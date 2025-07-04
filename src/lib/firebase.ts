
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getFirestore, serverTimestamp as firestoreTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import bcrypt from "bcryptjs";

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
export const storage = getStorage(app);
export const serverTimestamp = firestoreTimestamp;

// Auth functions
export const registerUser = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email: string, password: string) => {
  try {
    // First try Firebase Auth
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.log("Firebase Auth failed, checking Firestore...", error.code);
    
    // If Firebase Auth fails, check Firestore for custom password
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      try {
        console.log("Attempting Firestore authentication for:", email);
        
        // Query user by email in Firestore
        const usersQuery = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(usersQuery);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          
          console.log("Found user in Firestore, checking password...");
          
          // Check if the password matches the hashed password in Firestore
          if (userData.password && await bcrypt.compare(password, userData.password)) {
            console.log("Firestore password matches! Creating Firebase Auth user...");
            
            // Password matches, now we need to update Firebase Auth with the new password
            // Since we can't update Firebase Auth password without being signed in,
            // we'll create a new user with the same email and new password
            try {
              // Try to create user (this will fail if user already exists in Firebase Auth)
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              console.log("Created new Firebase Auth user");
              return userCredential;
            } catch (createError: any) {
              if (createError.code === 'auth/email-already-in-use') {
                // User exists in Firebase Auth but password doesn't match
                // This is a complex scenario - we need to guide user to reset via Firebase
                throw new Error("Please use the standard password reset option or contact support.");
              }
              throw createError;
            }
          } else {
            console.log("Firestore password doesn't match");
            throw new Error("Invalid email or password.");
          }
        } else {
          console.log("User not found in Firestore");
          throw new Error("Invalid email or password.");
        }
      } catch (firestoreError: any) {
        console.error("Firestore authentication error:", firestoreError);
        throw new Error(firestoreError.message || "Authentication failed.");
      }
    } else {
      // Re-throw the original Firebase error if it's not a credential issue
      throw error;
    }
  }
};

export const logoutUser = async () => {
  return signOut(auth);
};

// Date formatting helper
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Time formatting helper
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date and time
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};
