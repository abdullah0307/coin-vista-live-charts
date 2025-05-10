
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPdnfXtWc_UDmmFQQje03i3ajbWnTaRUM",
  authDomain: "pizzachatbot-e85cc.firebaseapp.com",
  projectId: "pizzachatbot-e85cc",
  storageBucket: "pizzachatbot-e85cc.appspot.com",
  messagingSenderId: "866183232347",
  appId: "1:866183232347:web:c164b68cf19881c83ef87e",
  measurementId: "G-JMF4DY9Z0H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure auth settings
auth.useDeviceLanguage(); // Use the device's language for email templates

export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics if in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

/**
 * Send a verification email to a user who isn't logged in yet
 * @param email The email address to send verification to
 */
export const sendVerificationEmailToAddress = async (email: string) => {
  try {
    // First create a temporary authentication session
    const userCredential = await signInWithEmailAndPassword(auth, email, "temporary-password-placeholder");
    // Send verification email
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
      // Sign out the temporary session
      await signOut(auth);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

export { analytics };
export default app;
