import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { auth, db } from "../config/firebase";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  bio?: string;
  phone?: string;
  notificationPreferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    courseUpdates: boolean;
    quizReminders: boolean;
  };
  language?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("📌 Setting up auth listener");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("📌 Auth state changed:", firebaseUser?.email || "null");

      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        const baseUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "Student",
          photoURL: firebaseUser.photoURL,
          role: "student",
        };

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            ...baseUser,
            ...(data as Partial<AuthUser>),
          });
        } else {
          setUser(baseUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
      console.log("📌 Loading false");
    });

    return () => {
      console.log("📌 Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("📌 signIn called:", email);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log("📌 signUp called");
    const result = await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    console.log("📌 signOut called");
    await firebaseSignOut(auth);
  };

  const getAuthErrorMessage = (code: string) => {
    switch (code) {
      case "auth/user-not-found":
        return "No account found with this email";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/email-already-in-use":
        return "Email already in use";
      case "auth/popup-closed-by-user":
        return "Sign in cancelled";
      case "auth/popup-blocked":
        return "Popup blocked. Please allow popups";
      default:
        return "Authentication failed. Please try again.";
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("🔵 Starting Google Sign In");
      const provider = new GoogleAuthProvider();

      // For web, use popup
      if (Platform.OS === "web") {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("🔵 Google Sign In successful:", user.email);

        // Check if user exists in Firestore, if not create
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: "student",
            profileCompleted: true,
            emailVerified: user.emailVerified,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        // For mobile, use redirect
        await signInWithRedirect(auth, provider);
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("🔵 Google Sign In successful:", result.user.email);
        }
      }
    } catch (error: any) {
      console.error("🔴 Google Sign In error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const updateUserProfile = async (data: Partial<AuthUser>) => {
    try {
      if (!auth.currentUser) throw new Error("No user logged in");

      const uid = auth.currentUser.uid;
      await setDoc(doc(db, "users", uid), data, { merge: true });

      // Update local state
      if (user) {
        setUser({ ...user, ...data });
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(getAuthErrorMessage(error.code || "unknown"));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
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
