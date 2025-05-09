
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiD-XIGit7Rj0ERZaXv1GRwMzjQO5Gk2U",
  authDomain: "coinvista-dashboard.firebaseapp.com",
  projectId: "coinvista-dashboard",
  storageBucket: "coinvista-dashboard.appspot.com",
  messagingSenderId: "868826549919",
  appId: "1:868826549919:web:92f1a5976842e04b3a0a1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
