
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
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
  sendVerificationCode: (email: string) => Promise<boolean>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
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

// For demo purposes, we'll store the verification codes in memory
// In a real app, these would be stored in a database
const verificationCodes: Record<string, { code: string, timestamp: number }> = {};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const storage = getStorage();

  // Generate a 6-digit code and store it
  const sendVerificationCode = async (email: string) => {
    try {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code with a timestamp (expires in 10 minutes)
      verificationCodes[email] = { 
        code, 
        timestamp: Date.now() + 10 * 60 * 1000 
      };
      
      // In a real app, you would send an email here
      console.log(`Verification code for ${email}: ${code}`);
      
      toast({
        title: "Verification code sent",
        description: `A verification code has been sent to ${email}`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to send verification code",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Verify the code
  const verifyCode = async (email: string, code: string) => {
    try {
      const storedData = verificationCodes[email];
      
      if (!storedData) {
        throw new Error("No verification code found for this email");
      }
      
      if (Date.now() > storedData.timestamp) {
        throw new Error("Verification code has expired");
      }
      
      if (storedData.code !== code) {
        throw new Error("Incorrect verification code");
      }
      
      // Code verified successfully
      delete verificationCodes[email]; // Clean up
      
      toast({
        title: "Verification successful",
        description: "Your email has been verified",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Sign up function
  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Account created successfully",
        description: "Welcome to CoinVista Dashboard!",
      });
      return userCredential.user;
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Logged in successfully",
        description: "Welcome back to CoinVista Dashboard!",
      });
      return userCredential.user;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
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
    sendVerificationCode,
    verifyCode,
    updateProfilePicture
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
