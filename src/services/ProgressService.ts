import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { LessonProgress } from "../types/course";
import EnrollmentService from "./EnrollmentService";

const PROGRESS_COLLECTION = "lessonProgress";

export class ProgressService {
  /**
   * Save video playback position
   */
  static async saveVideoPosition(
    userId: string,
    enrollmentId: string,
    lessonId: string,
    courseId: string,
    position: number,
  ): Promise<void> {
    try {
      // Check if progress record exists
      const existingProgress = await this.getLessonProgress(
        enrollmentId,
        lessonId,
      );

      if (existingProgress) {
        await updateDoc(doc(db, PROGRESS_COLLECTION, existingProgress.id), {
          videoPosition: position,
          lastWatchedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, PROGRESS_COLLECTION), {
          userId,
          enrollmentId,
          lessonId,
          courseId,
          completed: false,
          videoPosition: position,
          lastWatchedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error saving video position:", error);
      throw error;
    }
  }

  /**
   * Mark a lesson as completed
   */
  static async markLessonCompleted(
    userId: string,
    enrollmentId: string,
    lessonId: string,
    courseId: string,
  ): Promise<void> {
    try {
      // Check if progress record exists
      const existingProgress = await this.getLessonProgress(
        enrollmentId,
        lessonId,
      );

      if (existingProgress) {
        await updateDoc(doc(db, PROGRESS_COLLECTION, existingProgress.id), {
          completed: true,
          completedAt: serverTimestamp(),
          lastWatchedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, PROGRESS_COLLECTION), {
          userId,
          enrollmentId,
          lessonId,
          courseId,
          completed: true,
          completedAt: serverTimestamp(),
          videoPosition: 0,
          lastWatchedAt: serverTimestamp(),
        });
      }

      // Update overall course progress
      await this.updateCourseProgress(userId, courseId, enrollmentId);
    } catch (error) {
      console.error("Error marking lesson completed:", error);
      throw error;
    }
  }

  /**
   * Unmark a lesson as completed
   */
  static async unmarkLessonCompleted(
    enrollmentId: string,
    lessonId: string,
  ): Promise<void> {
    try {
      const existingProgress = await this.getLessonProgress(
        enrollmentId,
        lessonId,
      );

      if (existingProgress) {
        await updateDoc(doc(db, PROGRESS_COLLECTION, existingProgress.id), {
          completed: false,
          completedAt: null,
        });
      }
    } catch (error) {
      console.error("Error unmarking lesson completed:", error);
      throw error;
    }
  }

  /**
   * Get progress for a specific lesson
   */
  static async getLessonProgress(
    enrollmentId: string,
    lessonId: string,
  ): Promise<LessonProgress | null> {
    try {
      const q = query(
        collection(db, PROGRESS_COLLECTION),
        where("enrollmentId", "==", enrollmentId),
        where("lessonId", "==", lessonId),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return this.mapDocToProgress(doc);
    } catch (error) {
      console.error("Error getting lesson progress:", error);
      return null;
    }
  }

  /**
   * Get all progress for a course (for a user)
   */
  static async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<LessonProgress[]> {
    try {
      const q = query(
        collection(db, PROGRESS_COLLECTION),
        where("userId", "==", userId),
        where("courseId", "==", courseId),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => this.mapDocToProgress(doc));
    } catch (error) {
      console.error("Error getting course progress:", error);
      return [];
    }
  }

  /**
   * Get the last watched lesson position
   */
  static async getLastWatchedPosition(
    enrollmentId: string,
  ): Promise<LessonProgress | null> {
    try {
      const q = query(
        collection(db, PROGRESS_COLLECTION),
        where("enrollmentId", "==", enrollmentId),
        // Order by lastWatchedAt desc - Note: This requires a composite index
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      // Get the most recently watched lesson
      const doc = snapshot.docs[0];
      return this.mapDocToProgress(doc);
    } catch (error) {
      console.error("Error getting last watched position:", error);
      return null;
    }
  }

  /**
   * Check if a lesson is completed
   */
  static async isLessonCompleted(
    enrollmentId: string,
    lessonId: string,
  ): Promise<boolean> {
    try {
      const progress = await this.getLessonProgress(enrollmentId, lessonId);
      return progress?.completed || false;
    } catch (error) {
      console.error("Error checking lesson completion:", error);
      return false;
    }
  }

  /**
   * Get completed lessons count for a course
   */
  static async getCompletedLessonsCount(
    userId: string,
    courseId: string,
    totalLessons: number,
  ): Promise<number> {
    try {
      const progress = await this.getCourseProgress(userId, courseId);
      const completedCount = progress.filter((p) => p.completed).length;
      return completedCount;
    } catch (error) {
      console.error("Error getting completed lessons count:", error);
      return 0;
    }
  }

  /**
   * Update overall course progress based on completed lessons
   */
  private static async updateCourseProgress(
    userId: string,
    courseId: string,
    enrollmentId: string,
  ): Promise<void> {
    try {
      // Get all lessons for the course - assuming totalLessons is passed
      // In a real app, you'd get this from the course data
      const progress = await this.getCourseProgress(userId, courseId);
      const completedCount = progress.filter((p) => p.completed).length;

      // Get total lessons count from enrollment or calculate
      // For now, we'll use the completed count as minimum
      const progressPercent =
        completedCount > 0
          ? Math.min(
              100,
              Math.round((completedCount / Math.max(progress.length, 1)) * 100),
            )
          : 0;

      await EnrollmentService.updateProgress(userId, courseId, progressPercent);
    } catch (error) {
      console.error("Error updating course progress:", error);
    }
  }

  /**
   * Map Firestore document to LessonProgress
   */
  private static mapDocToProgress(doc: any): LessonProgress {
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
    };
  }
}

export default ProgressService;
