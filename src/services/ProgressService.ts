import { db } from '../config/firebase';
import { 
  doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where 
} from 'firebase/firestore';
import { LessonProgress, EnrollmentProgress } from '../types/progress';

export const ProgressService = {
  // Mark a lesson as completed
  async markLessonCompleted(
    userId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<void> {
    const progressId = `${userId}_${courseId}_${lessonId}`;
    const progressRef = doc(db, 'lessonProgress', progressId);
    
    await setDoc(progressRef, {
      userId,
      courseId,
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    }, { merge: true });
    
    // Update overall course progress
    await this.updateCourseProgress(userId, courseId);
  },

  // Mark a lesson as incomplete (if needed)
  async markLessonIncomplete(
    userId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<void> {
    const progressId = `${userId}_${courseId}_${lessonId}`;
    const progressRef = doc(db, 'lessonProgress', progressId);
    
    await setDoc(progressRef, {
      completed: false,
      completedAt: null,
    }, { merge: true });
    
    await this.updateCourseProgress(userId, courseId);
  },

  // Get progress for a specific lesson
  async getLessonProgress(
    userId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<LessonProgress | null> {
    const progressId = `${userId}_${courseId}_${lessonId}`;
    const progressRef = doc(db, 'lessonProgress', progressId);
    const snapshot = await getDoc(progressRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as LessonProgress;
    }
    return null;
  },

  // Get all lesson progress for a course
  async getCourseProgress(
    userId: string, 
    courseId: string
  ): Promise<LessonProgress[]> {
    const q = query(
      collection(db, 'lessonProgress'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonProgress));
  },

  // Update overall course progress in enrollment record
  async updateCourseProgress(userId: string, courseId: string): Promise<void> {
    const progressList = await this.getCourseProgress(userId, courseId);
    const completedCount = progressList.filter(p => p.completed).length;
    
    // Get total lessons count
    const lessonsRef = collection(db, `courses/${courseId}/lessons`);
    const lessonsSnapshot = await getDocs(lessonsRef);
    const totalLessons = lessonsSnapshot.size;
    
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    
    // Update enrollment record
    const enrollmentQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    
    if (!enrollmentSnapshot.empty) {
      const enrollmentDoc = enrollmentSnapshot.docs[0];
      await updateDoc(doc(db, 'enrollments', enrollmentDoc.id), {
        progress: progressPercent,
        lastAccessedAt: new Date().toISOString(),
      });
    }
  },

  // Update last accessed lesson
  async updateLastAccessed(
    userId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<void> {
    const enrollmentQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    
    if (!enrollmentSnapshot.empty) {
      const enrollmentDoc = enrollmentSnapshot.docs[0];
      await updateDoc(doc(db, 'enrollments', enrollmentDoc.id), {
        lastAccessedAt: new Date().toISOString(),
        lastAccessedLessonId: lessonId,
      });
    }
    
    // Also update lesson progress last accessed
    const progressId = `${userId}_${courseId}_${lessonId}`;
    const progressRef = doc(db, 'lessonProgress', progressId);
    await setDoc(progressRef, {
      lastAccessedAt: new Date().toISOString(),
    }, { merge: true });
  },

  // Get last accessed lesson for a course
  async getLastAccessedLesson(
    userId: string, 
    courseId: string
  ): Promise<string | null> {
    const enrollmentQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    
    if (!enrollmentSnapshot.empty) {
      const enrollment = enrollmentSnapshot.docs[0].data();
      return enrollment.lastAccessedLessonId || null;
    }
    return null;
  },

  // Get first lesson ID for a course
  async getFirstLesson(courseId: string): Promise<string | null> {
    const lessonsRef = collection(db, `courses/${courseId}/lessons`);
    const lessonsSnapshot = await getDocs(lessonsRef);
    const lessons = lessonsSnapshot.docs.map(doc => ({ id: doc.id, order: doc.data().order }));
    
    if (lessons.length === 0) return null;
    
    lessons.sort((a, b) => a.order - b.order);
    return lessons[0].id;
  },

  // Get next lesson ID
  async getNextLesson(courseId: string, currentLessonId: string): Promise<string | null> {
    const lessonsRef = collection(db, `courses/${courseId}/lessons`);
    const lessonsSnapshot = await getDocs(lessonsRef);
    const lessons = lessonsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      order: doc.data().order 
    }));
    
    lessons.sort((a, b) => a.order - b.order);
    const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
    
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      return lessons[currentIndex + 1].id;
    }
    return null;
  },
};

