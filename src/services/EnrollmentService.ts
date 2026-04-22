import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const EnrollmentService = {
  async enrollInCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      // Check if already enrolled
      const q = query(
        collection(db, "enrollments"),
        where("userId", "==", userId),
        where("courseId", "==", courseId),
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return false; // Already enrolled
      }

      // Add enrollment record
      await addDoc(collection(db, "enrollments"), {
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        status: "active",
        lastAccessedAt: new Date().toISOString(),
      });

      // Update course enrolled count
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, {
        enrolledCount: increment(1),
      });

      return true;
    } catch (error) {
      console.error("Enrollment error:", error);
      throw error;
    }
  },

  async checkEnrollmentStatus(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    try {
      const q = query(
        collection(db, "enrollments"),
        where("userId", "==", userId),
        where("courseId", "==", courseId),
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Check enrollment error:", error);
      return false;
    }
  },

  async getEnrollment(userId: string, courseId: string) {
    try {
      const q = query(
        collection(db, "enrollments"),
        where("userId", "==", userId),
        where("courseId", "==", courseId),
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const data = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        ...data,
      };
    } catch (error) {
      console.error("Get enrollment error:", error);
      return null;
    }
  },

  async updateProgress(userId: string, courseId: string, progress: number) {
    try {
      const q = query(
        collection(db, "enrollments"),
        where("userId", "==", userId),
        where("courseId", "==", courseId),
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;
      const enrollmentRef = doc(db, "enrollments", snapshot.docs[0].id);
      await updateDoc(enrollmentRef, {
        progress,
        lastAccessedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Update progress error:", error);
    }
  },
};
