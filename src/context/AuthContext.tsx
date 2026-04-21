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
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("📌 Setting up auth listener");

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("📌 Auth state changed:", firebaseUser?.email || "null");

      if (firebaseUser) {
        // Simplified - NO Firestore
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "student",
        };
        setUser(authUser);
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

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}
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
