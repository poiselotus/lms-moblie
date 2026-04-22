import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

export const EnrollmentService = {
  async enrollInCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      // Check if already enrolled
      const q = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return false; // Already enrolled
      }

      // Add enrollment record
      await addDoc(collection(db, 'enrollments'), {
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        status: 'active'
      });

      // Update course enrolled count
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        enrolledCount: increment(1)
      });

      return true;
    } catch (error) {
      console.error('Enrollment error:', error);
      throw error;
    }
  },

  async checkEnrollmentStatus(userId: string, courseId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Check enrollment error:', error);
      return false;
    }
  }
};
