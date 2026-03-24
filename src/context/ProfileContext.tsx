import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth, db, storage } from "../config/firebase";
import { useAuth } from "./AuthContext";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  role: "student" | "instructor" | "admin";
  preferences: {
    notifications: boolean;
    language: string;
    darkMode: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  uploadProfilePicture: (uri: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser } = useAuth();

  const getProfilePath = () => {
    if (!authUser?.role || !auth.currentUser)
      return `users/${auth.currentUser.uid}`;
    return `users/${authUser.role}/${auth.currentUser.uid}`;
  };

  const fallbackPath = () => `users/${auth.currentUser?.uid || ""}`;

  const fetchProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const rolePath = doc(db, getProfilePath());
      let userDoc = await getDoc(rolePath);

      // Fallback to main users collection
      if (!userDoc.exists()) {
        userDoc = await getDoc(doc(db, fallbackPath()));
      }

      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setProfile(profileData);
      } else {
        // Create default in both
        const defaultProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "User",
          photoURL: user.photoURL || null,
          bio: "",
          role: authUser?.role || "student",
          preferences: {
            notifications: true,
            language: "en",
            darkMode: false,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(rolePath, defaultProfile);
        await setDoc(doc(db, fallbackPath()), defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authUser]);

  const uploadProfilePicture = async (uri: string) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(
        storage,
        `users/${user.uid}/profilePicture/profile.jpg`,
      );

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });

      const updateData = {
        photoURL: downloadURL,
        updatedAt: new Date().toISOString(),
      };

      const rolePath = doc(db, getProfilePath());
      await updateDoc(rolePath, updateData);
      const fallbackPathDoc = doc(db, fallbackPath());
      await updateDoc(fallbackPathDoc, updateData);

      await fetchProfile();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      if (data.displayName && data.displayName !== user.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }

      const rolePathDoc = doc(db, getProfilePath());
      await updateDoc(rolePathDoc, updateData);
      const fallbackDoc = doc(db, fallbackPath());
      await updateDoc(fallbackDoc, updateData);

      await fetchProfile();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Not authenticated");

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Not authenticated");

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete storage folder
      try {
        const storageRef = ref(storage, `users/${user.uid}/profilePicture`);
        await deleteObject(storageRef);
      } catch {}

      // Delete both paths
      await deleteDoc(doc(db, getProfilePath()));
      await deleteDoc(doc(db, fallbackPath()));

      await deleteUser(user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        uploadProfilePicture,
        updateProfileData,
        updateUserPassword,
        deleteAccount,
        refreshProfile,
        clearError,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
