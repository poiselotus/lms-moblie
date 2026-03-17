import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Rating {
  id?: string;
  courseId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

class RatingService {
  private ratingsCollection = "ratings";
  private coursesCollection = "courses";

  // Submit a rating for a course
  async submitRating(
    courseId: string,
    userId: string,
    userName: string,
    rating: number,
    review: string,
  ): Promise<Rating> {
    try {
      // Check if user already rated this course
      const existingRating = await this.getUserRating(courseId, userId);

      const ratingData: Rating = {
        courseId,
        userId,
        userName,
        rating: Math.round(rating), // Ensure it's 1-5
        review: review.trim(),
        createdAt: existingRating?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (existingRating) {
        // Update existing rating
        const ratingRef = doc(db, this.ratingsCollection, existingRating.id!);
        await setDoc(ratingRef, ratingData, { merge: true });
        ratingData.id = existingRating.id;
      } else {
        // Create new rating
        const ratingsRef = collection(db, this.ratingsCollection);
        const newRatingRef = doc(ratingsRef);
        ratingData.id = newRatingRef.id;
        await setDoc(newRatingRef, ratingData);
      }

      // Update course aggregate rating
      await this.updateCourseRating(courseId);

      return ratingData;
    } catch (error) {
      console.error("Error submitting rating:", error);
      throw error;
    }
  }

  // Get user's rating for a specific course
  async getUserRating(
    courseId: string,
    userId: string,
  ): Promise<Rating | null> {
    try {
      const q = query(
        collection(db, this.ratingsCollection),
        where("courseId", "==", courseId),
        where("userId", "==", userId),
        limit(1),
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Rating;
    } catch (error) {
      console.error("Error getting user rating:", error);
      return null;
    }
  }

  // Get all ratings for a course
  async getCourseRatings(
    courseId: string,
    maxResults: number = 10,
  ): Promise<Rating[]> {
    try {
      const q = query(
        collection(db, this.ratingsCollection),
        where("courseId", "==", courseId),
        orderBy("createdAt", "desc"),
        limit(maxResults),
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          }) as Rating,
      );
    } catch (error) {
      console.error("Error getting course ratings:", error);
      return [];
    }
  }

  // Get rating statistics for a course
  async getCourseRatingStats(courseId: string): Promise<CourseRatingStats> {
    try {
      const q = query(
        collection(db, this.ratingsCollection),
        where("courseId", "==", courseId),
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const ratings = snapshot.docs.map((doc) => doc.data() as Rating);
      const totalRatings = ratings.length;

      // Calculate average
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = Math.round((sum / totalRatings) * 10) / 10;

      // Calculate distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach((r) => {
        if (distribution[r.rating as keyof typeof distribution] !== undefined) {
          distribution[r.rating as keyof typeof distribution]++;
        }
      });

      return {
        averageRating,
        totalRatings,
        ratingDistribution: distribution,
      };
    } catch (error) {
      console.error("Error getting course rating stats:", error);
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  }

  // Update course's aggregate rating
  private async updateCourseRating(courseId: string): Promise<void> {
    try {
      const stats = await this.getCourseRatingStats(courseId);

      const courseRef = doc(db, this.coursesCollection, courseId);
      await updateDoc(courseRef, {
        "rating.averageRating": stats.averageRating,
        "rating.totalRatings": stats.totalRatings,
        "rating.distribution": stats.ratingDistribution,
        "rating.lastUpdated": new Date(),
      });
    } catch (error) {
      console.error("Error updating course rating:", error);
    }
  }

  // Get courses with best ratings
  async getTopRatedCourses(
    maxResults: number = 10,
  ): Promise<
    { courseId: string; averageRating: number; totalRatings: number }[]
  > {
    try {
      const q = query(
        collection(db, this.coursesCollection),
        where("rating.totalRatings", ">", 0),
        orderBy("rating.averageRating", "desc"),
        limit(maxResults),
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        courseId: doc.id,
        averageRating: doc.data().rating?.averageRating || 0,
        totalRatings: doc.data().rating?.totalRatings || 0,
      }));
    } catch (error) {
      console.error("Error getting top rated courses:", error);
      return [];
    }
  }

  // Get user's rating history
  async getUserRatingHistory(
    userId: string,
    maxResults: number = 20,
  ): Promise<Rating[]> {
    try {
      const q = query(
        collection(db, this.ratingsCollection),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(maxResults),
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          }) as Rating,
      );
    } catch (error) {
      console.error("Error getting user rating history:", error);
      return [];
    }
  }

  // Delete a rating
  async deleteRating(ratingId: string, courseId: string): Promise<void> {
    try {
      const ratingRef = doc(db, this.ratingsCollection, ratingId);
      await setDoc(
        ratingRef,
        {
          deleted: true,
          deletedAt: new Date(),
        },
        { merge: true },
      );

      // Update course rating stats
      await this.updateCourseRating(courseId);
    } catch (error) {
      console.error("Error deleting rating:", error);
      throw error;
    }
  }
}

export default new RatingService();
