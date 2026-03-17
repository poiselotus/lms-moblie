import * as SecureStore from "expo-secure-store";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth, db } from "../config/firebase";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "student" | "instructor" | "admin";
  profileCompleted: boolean;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    role?: "student" | "instructor",
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserProfile: (data: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "lms_user_data";

// Helper function to safely interact with SecureStore
// This handles platform differences and provides fallback for web
const secureStore = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof SecureStore.deleteItemAsync !== "function") {
        console.warn(
          "SecureStore.deleteItemAsync not available, using localStorage fallback",
        );
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn("SecureStore.getItemAsync failed:", error);
      // Fallback to localStorage on web
      if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof SecureStore.setItemAsync !== "function") {
        console.warn(
          "SecureStore.setItemAsync not available, using localStorage fallback",
        );
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn("SecureStore.setItemAsync failed:", error);
      // Fallback to localStorage on web
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, value);
      }
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      if (typeof SecureStore.deleteItemAsync !== "function") {
        console.warn(
          "SecureStore.deleteItemAsync not available, using localStorage fallback",
        );
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn("SecureStore.deleteItemAsync failed:", error);
      // Fallback to localStorage on web
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(key);
      }
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored user on mount
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await secureStore.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading stored user:", error);
      }
    };

    loadStoredUser();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: userData.role || "student",
            profileCompleted: userData.profileCompleted || false,
            emailVerified: firebaseUser.emailVerified,
          };
          setUser(authUser);
          // Store user data securely
          await secureStore.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
        }
      } else {
        setUser(null);
        await secureStore.deleteItem(USER_STORAGE_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "student" | "instructor" = "student",
  ) => {
    try {
      setLoading(true);

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Update profile with name
      await updateProfile(firebaseUser, { displayName: name });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create user document in Firestore
      const userData: Omit<AuthUser, "email" | "displayName" | "photoURL"> = {
        uid: firebaseUser.uid,
        role: role,
        profileCompleted: false,
        emailVerified: false,
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userData,
        email: email,
        name: name,
        createdAt: serverTimestamp(),
      });

      // Update local state
      const authUser: AuthUser = {
        ...userData,
        email: email,
        displayName: name,
        photoURL: null,
      };
      setUser(authUser);
      await secureStore.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      await secureStore.deleteItem(USER_STORAGE_KEY);
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle Firestore sync
      console.log("Google sign-in successful:", result.user.email);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
    } catch (error: any) {
      console.error("Send verification email error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const updateUserProfile = async (data: Partial<AuthUser>) => {
    try {
      if (!auth.currentUser) throw new Error("No user logged in");

      await setDoc(doc(db, "users", auth.currentUser.uid), data, {
        merge: true,
      });

      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        await secureStore.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(updatedUser),
        );
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut: signOutUser,
        resetPassword,
        sendVerificationEmail,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/operation-not-allowed":
      return "Operation not allowed";
    case "auth/weak-password":
      return "Password is too weak";
    case "auth/user-disabled":
      return "This account has been disabled";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/invalid-credential":
      return "Invalid email or password";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later";
    case "auth/network-request-failed":
      return "Network error. Please check your connection";
    case "auth/invalid-action-code":
      return "Invalid or expired reset link";
    default:
      return "An error occurred. Please try again";
  }
}
