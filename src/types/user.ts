export interface FirestoreUser {
  uid: string;
  bio?: string;
  phone?: string;
  notificationPreferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    courseUpdates: boolean;
    quizReminders: boolean;
  };
  language?: string;
  createdAt: Date;
  displayName: string;
  email: string;
  emailVerified: boolean;
  photoURL?: string;
  profileCompleted: boolean;
  role: "student" | "instructor" | "admin";
  updatedAt: Date;
}

export interface UserProfile extends FirestoreUser {
  preferences?: {
    notifications?: boolean;
    language?: string;
    darkMode?: boolean;
  };
}
