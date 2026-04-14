import {
  collection,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { FirestoreCategory, FirestoreCourse, Course, CourseFilter, deriveCourseTitle } from '../types/firestoreCourse';
import type { Category, Lesson, Review } from '../types/course';

const COURSES_COLLECTION = "courses";
const CATEGORIES_COLLECTION = "categories";
const LESSONS_COLLECTION = "lessons";
const REVIEWS_COLLECTION = "reviews";
const PAGE_SIZE = 10;

export class CourseService {
  /**
   * Get all published courses with pagination
   */
static async getCourses(
    page: number = 1,
    filter?: CourseFilter,
  ): Promise<{
    courses: Course[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    try {
      let q = query(
        collection(db, COURSES_COLLECTION),
        where("isPublished", "==", true),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE),
      );

      // Apply category filter
      if (filter?.category && filter.category !== "all") {
        q = query(q, where("categoryId", "==", filter.category));
      }

      const snapshot = await getDocs(q);
      const courses: Course[] = snapshot.docs.map((doc) => this.mapDocToCourse(doc));

      return {
        courses,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  }

  /**
   * Get featured courses
   */
  static async getFeaturedCourses(): Promise<Course[]> {
    try {
      const q = query(
        collection(db, COURSES_COLLECTION),
        where("isPublished", "==", true),
        where("isFeatured", "==", true),
        orderBy("rating", "desc"),
        limit(5),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => this.mapDocToCourse(doc));
    } catch (error) {
      console.error("Error fetching featured courses:", error);
      throw error;
    }
  }

  /**
   * Get popular courses by enrollment count
   */
  static async getPopularCourses(limit: number = 10): Promise<Course[]> {
    try {
      const q = query(
        collection(db, COURSES_COLLECTION),
        where("isPublished", "==", true),
        orderBy("enrolledCount", "desc"),
        limit(limit),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => this.mapDocToCourse(doc));
    } catch (error) {
      console.error("Error fetching popular courses:", error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  static async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const q = query(
        collection(db, COURSES_COLLECTION),
        where("__name__", "==", courseId),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      return this.mapDocToCourse(snapshot.docs[0]);
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  }

  /**
   * Get courses by category
   */
  static async getCoursesByCategory(categoryId: string): Promise<Course[]> {
    try {
      const q = query(
        collection(db, COURSES_COLLECTION),
        where("isPublished", "==", true),
        where("category", "==", categoryId),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => this.mapDocToCourse(doc));
    } catch (error) {
      console.error("Error fetching courses by category:", error);
      throw error;
    }
  }

  /**
   * Search courses by title/description
   */
  static async searchCourses(searchQuery: string): Promise<Course[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // For production, consider using Algolia or similar
      // Here we're doing a simple prefix match on title
      const q = query(
        collection(db, COURSES_COLLECTION),
        where("isPublished", "==", true),
        orderBy("title"),
        limit(20),
      );

      const snapshot = await getDocs(q);
      const courses = snapshot.docs
        .map((doc) => this.mapDocToCourse(doc))
        .filter(
          (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        );

      return courses;
    } catch (error) {
      console.error("Error searching courses:", error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
static async getCategories(): Promise<FirestoreCategory[]> {
    try {
      const q = query(
        collection(db, CATEGORIES_COLLECTION),
        orderBy("courseCount", "desc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as FirestoreCategory));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Get lessons for a course
   */
  static async getCourseLessons(courseId: string): Promise<Lesson[]> {
    try {
      const q = query(
        collection(db, LESSONS_COLLECTION),
        where("courseId", "==", courseId),
        orderBy("order", "asc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Lesson,
      );
    } catch (error) {
      console.error("Error fetching lessons:", error);
      throw error;
    }
  }

  /**
   * Get reviews for a course
   */
  static async getCourseReviews(courseId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where("courseId", "==", courseId),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Review,
      );
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  }

  /**
   * Map Firestore document to Course type
   */
private static mapDocToCourse(
    doc: QueryDocumentSnapshot<DocumentData>,
  ): Course {
    const data = doc.data() as FirestoreCourse;
    return {
      id: doc.id,
      title: deriveCourseTitle(doc.id),
      description: data.description,
      instructorName: data.instructorName,
      duration: data.duration,
      enrolledCount: data.enrolledCount,
      isFree: data.isFree,
      isPublished: data.isPublished,
      createdAt: data.createdAt,
      categoryId: data.categoryId,
    };
  }
}

export default CourseService;
