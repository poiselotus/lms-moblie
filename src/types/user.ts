export interface FirestoreUser {
  uid: string;
  bio?: string;
  createdAt: Date;
  displayName: string;
  email: string;
  emailVerified: boolean;
  photoURL?: string;
  profileCompleted: boolean;
  role: 'student' | 'instructor' | 'admin';
  updatedAt: Date;
}

export interface UserProfile extends FirestoreUser {
  preferences?: {
    notifications?: boolean;
    language?: string;
    darkMode?: boolean;
  };
}
