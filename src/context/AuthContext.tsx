import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
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

// SecureStore helpers
const secureStore = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn("SecureStore.getItemAsync failed:", error);
      return await AsyncStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn("SecureStore.setItemAsync failed:", error);
      await AsyncStorage.setItem(key, value);
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn("SecureStore.deleteItemAsync failed:", error);
      await AsyncStorage.removeItem(key);
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUserStr = await secureStore.getItem(USER_STORAGE_KEY);
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Error loading stored user:", error);
      }
    };

    loadStoredUser();

    console.log("Setting up auth listener");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "Auth state changed:",
        firebaseUser ? firebaseUser.email : "signed out",
      );
      if (firebaseUser) {
        try {
          const uid = firebaseUser.uid;
          const userDocRef = doc(db, "users", uid);
          const userDoc = await getDoc(userDocRef);

          let userData: any = {};
          let role = "student";

          if (userDoc.exists()) {
            userData = userDoc.data();
            role = userData.role || "student";
            console.log("User doc found:", role);
          } else {
            // Create default profile
            console.log("No user doc, creating default");
            const defaultData = {
              uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "User",
              role,
              profileCompleted: true,
              emailVerified: firebaseUser.emailVerified || false,
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, defaultData);

            userData = defaultData;
            console.log("Default user doc created");
          }

          const authUser: AuthUser = {
            uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role,
            profileCompleted: userData.profileCompleted || true,
            emailVerified: firebaseUser.emailVerified,
          };

          setUser(authUser);
          await secureStore.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
          console.log("User state set:", authUser.role, authUser.emailVerified);
        } catch (error) {
          console.error("Listener error:", error);
        }
      } else {
        console.log("User signed out");
        setUser(null);
        await secureStore.deleteItem(USER_STORAGE_KEY);
      }
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const promptRoleSelection = (uid: string, currentUser: AuthUser) => {
    Alert.alert(
      "Select Role",
      "Choose your account type:",
      [
        {
          text: "Student",
          onPress: () => selectAndSaveRole("student", uid, currentUser),
        },
        {
          text: "Instructor (Teacher)",
          onPress: () => selectAndSaveRole("instructor", uid, currentUser),
        },
      ],
      { cancelable: false },
    );
  };

  const selectAndSaveRole = async (
    role: "student" | "instructor",
    uid: string,
    currentUser: AuthUser,
  ) => {
    try {
      const updateData = {
        role,
        profileCompleted: true,
      };

      // Update main users/uid
      await updateDoc(doc(db, "users", uid), updateData);

      // Update role-specific
      await setDoc(
        doc(db, `users/${role}`, uid),
        {
          ...currentUser,
          ...updateData,
        },
        { merge: true },
      );

      // Update local
      const updatedUser: AuthUser = {
        ...currentUser,
        role,
        profileCompleted: true,
      };
      setUser(updatedUser);
      await secureStore.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      console.log("Role updated:", role);
    } catch (error) {
      console.error("Role save error:", error);
      Alert.alert("Error", "Failed to save role. Please try again.");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "student" | "instructor" = "student",
  ) => {
    try {
      setLoading(true);
      console.log("Signup:", email, role);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });
      await sendEmailVerification(firebaseUser);

      const userData = {
        uid: firebaseUser.uid,
        email,
        displayName: name,
        role,
        profileCompleted: false,
        emailVerified: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      await setDoc(doc(db, `users/${role}`, firebaseUser.uid), userData);

      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
        photoURL: firebaseUser.photoURL,
        role,
        profileCompleted: false,
        emailVerified: false,
      };

      setUser(authUser);
      await secureStore.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
      console.log("Signup complete");
    } catch (error: any) {
      console.error("Signup error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Sign in attempt:", email);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign in Firebase success");
    } catch (error: any) {
      console.error("Sign in Firebase error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("Google sign in");
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      console.log("Google Firebase success");
    } catch (error: any) {
      console.error("Google sign in error:", error);
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

      const uid = auth.currentUser.uid;
      await setDoc(doc(db, "users", uid), data, { merge: true });

      if (user?.role) {
        await setDoc(doc(db, `users/${user.role}`, uid), data, { merge: true });
      }

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
