
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  AuthError
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  sendVerificationEmail: (user: User) => Promise<boolean>;
  updateProfilePicture: (file: File) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const storage = getStorage();

  // Send verification email using Firebase's built-in functionality
  const sendVerificationEmail = async (user: User) => {
    try {
      await sendEmailVerification(user);
      
      toast({
        title: "Verification email sent",
        description: `A verification email has been sent to ${user.email}. Please check both your inbox and spam folders.`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to send verification email. Please try again later.";
      
      if (error?.code === 'auth/too-many-requests') {
        errorMessage = "Too many verification requests. Please wait a while before trying again.";
      } else if (error?.code === 'auth/internal-error') {
        errorMessage = "Server error. Please try again later or contact support.";
      }
      
      toast({
        title: "Email verification failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Sign up function
  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendVerificationEmail(user);
      
      toast({
        title: "Account created successfully",
        description: "Please verify your email before logging in. Check both your inbox and spam folder.",
      });
      
      return user;
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Provide more specific error messages based on Firebase error codes
      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please log in or use a different email.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid. Please check and try again.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      }
      
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        // Send a fresh verification email if not verified
        await sendVerificationEmail(user);
        
        // Force sign out since email isn't verified
        await signOut(auth);
        
        throw new Error("email-not-verified");
      }
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back to CoinVista Dashboard!",
      });
      
      return user;
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Provide more specific error messages based on Firebase error codes
      let errorMessage = error.message;
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      } else if (error.message === "email-not-verified") {
        errorMessage = "Email not verified. Please check your inbox and spam folder for the verification link.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Update profile picture
  const updateProfilePicture = async (file: File) => {
    try {
      if (!currentUser) {
        throw new Error("No user is logged in");
      }

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update the user's profile
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });
      
      // Refresh the user object
      setCurrentUser({ ...currentUser, photoURL: downloadURL });
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
      
      return downloadURL;
    } catch (error: any) {
      toast({
        title: "Failed to update profile picture",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    sendVerificationEmail,
    updateProfilePicture
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
