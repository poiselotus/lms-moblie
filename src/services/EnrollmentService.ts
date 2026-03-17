import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ContinueLearning, Enrollment, LessonProgress } from "../types/course";

const ENROLLMENTS_COLLECTION = "enrollments";
const PROGRESS_COLLECTION = "lessonProgress";

export class EnrollmentService {
  /**
   * Enroll in a course
   */
  static async enrollInCourse(
    userId: string,
    courseId: string,
  ): Promise<Enrollment> {
    try {
      // Check if already enrolled
      const existingEnrollment = await this.getEnrollment(userId, courseId);
      if (existingEnrollment) {
        throw new Error("Already enrolled in this course");
      }

      const enrollmentData = {
        userId,
        courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        lastAccessedAt: serverTimestamp(),
        isActive: true,
      };

      const docRef = await addDoc(
        collection(db, ENROLLMENTS_COLLECTION),
        enrollmentData,
      );

      return {
        id: docRef.id,
        ...enrollmentData,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
        isActive: true,
        progress: 0,
      } as Enrollment;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw error;
    }
  }

  /**
   * Unenroll from a course
   */
  static async unenrollFromCourse(
    userId: string,
    courseId: string,
  ): Promise<void> {
    try {
      const enrollment = await this.getEnrollment(userId, courseId);
      if (!enrollment) {
        throw new Error("Not enrolled in this course");
      }

      await deleteDoc(doc(db, ENROLLMENTS_COLLECTION, enrollment.id));

      // Also delete all lesson progress for this enrollment
      const progressQuery = query(
        collection(db, PROGRESS_COLLECTION),
        where("enrollmentId", "==", enrollment.id),
      );
      const progressSnap = await getDocs(progressQuery);
      const deletePromises = progressSnap.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error unenrolling from course:", error);
      throw error;
    }
  }

  /**
   * Get enrollment for a specific user and course
   */
  static async getEnrollment(
    userId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    try {
      const q = query(
        collection(db, ENROLLMENTS_COLLECTION),
        where("userId", "==", userId),
        where("courseId", "==", courseId),
        where("isActive", "==", true),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return this.mapDocToEnrollment(doc);
    } catch (error) {
      console.error("Error getting enrollment:", error);
      throw error;
    }
  }

  /**
   * Get all enrollments for a user
   */
  static async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    try {
      const q = query(
        collection(db, ENROLLMENTS_COLLECTION),
        where("userId", "==", userId),
        where("isActive", "==", true),
        orderBy("lastAccessedAt", "desc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => this.mapDocToEnrollment(doc));
    } catch (error) {
      console.error("Error getting user enrollments:", error);
      throw error;
    }
  }

  /**
   * Get user's enrolled course IDs
   */
  static async getEnrolledCourseIds(userId: string): Promise<string[]> {
    try {
      const enrollments = await this.getUserEnrollments(userId);
      return enrollments.map((e) => e.courseId);
    } catch (error) {
      console.error("Error getting enrolled course IDs:", error);
      return [];
    }
  }

  /**
   * Check if user is enrolled in a course
   */
  static async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollment = await this.getEnrollment(userId, courseId);
      return enrollment !== null;
    } catch (error) {
      console.error("Error checking enrollment:", error);
      return false;
    }
  }

  /**
   * Update enrollment progress
   */
  static async updateProgress(
    userId: string,
    courseId: string,
    progress: number,
  ): Promise<void> {
    try {
      const enrollment = await this.getEnrollment(userId, courseId);
      if (!enrollment) {
        throw new Error("Not enrolled in this course");
      }

      await updateDoc(doc(db, ENROLLMENTS_COLLECTION, enrollment.id), {
        progress,
        lastAccessedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  }

  /**
   * Mark course as completed
   */
  static async completeCourse(userId: string, courseId: string): Promise<void> {
    try {
      const enrollment = await this.getEnrollment(userId, courseId);
      if (!enrollment) {
        throw new Error("Not enrolled in this course");
      }

      await updateDoc(doc(db, ENROLLMENTS_COLLECTION, enrollment.id), {
        progress: 100,
        completedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error completing course:", error);
      throw error;
    }
  }

  /**
   * Get continue learning data for user
   */
  static async getContinueLearning(
    userId: string,
  ): Promise<ContinueLearning[]> {
    try {
      const enrollments = await this.getUserEnrollments(userId);
      const continueLearning: ContinueLearning[] = [];

      for (const enrollment of enrollments) {
        if (enrollment.progress < 100) {
          // Get last watched lesson
          const lastProgress = await this.getLastWatchedLesson(enrollment.id);
          if (lastProgress) {
            continueLearning.push({
              courseId: enrollment.courseId,
              courseTitle: "", // Will be populated by caller
              courseThumbnail: "",
              lessonId: lastProgress.lessonId,
              lessonTitle: "", // Will be populated by caller
              progress: enrollment.progress,
              lastAccessedAt: enrollment.lastAccessedAt,
            });
          }
        }
      }

      return continueLearning.slice(0, 5); // Return top 5
    } catch (error) {
      console.error("Error getting continue learning:", error);
      return [];
    }
  }

  /**
   * Get last watched lesson for an enrollment
   */
  private static async getLastWatchedLesson(
    enrollmentId: string,
  ): Promise<LessonProgress | null> {
    try {
      const q = query(
        collection(db, PROGRESS_COLLECTION),
        where("enrollmentId", "==", enrollmentId),
        orderBy("lastWatchedAt", "desc"),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        enrollmentId: data.enrollmentId,
        lessonId: data.lessonId,
        userId: data.userId,
        courseId: data.courseId,
        completed: data.completed || false,
        completedAt: data.completedAt
          ? (data.completedAt as Timestamp).toDate()
          : undefined,
        videoPosition: data.videoPosition || 0,
        lastWatchedAt: data.lastWatchedAt
          ? (data.lastWatchedAt as Timestamp).toDate()
          : new Date(),
      } as LessonProgress;
    } catch (error) {
      console.error("Error getting last watched lesson:", error);
      return null;
    }
  }

  /**
   * Map Firestore document to Enrollment
   */
  private static mapDocToEnrollment(doc: any): Enrollment {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      courseId: data.courseId,
      enrolledAt: data.enrolledAt
        ? (data.enrolledAt as Timestamp).toDate()
        : new Date(),
      progress: data.progress || 0,
      lastAccessedAt: data.lastAccessedAt
        ? (data.lastAccessedAt as Timestamp).toDate()
        : new Date(),
      completedAt: data.completedAt
        ? (data.completedAt as Timestamp).toDate()
        : undefined,
      isActive: data.isActive ?? true,
    };
  }
}

export default EnrollmentService;
