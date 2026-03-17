import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Quiz, QuizAttempt, QuizQuestion, QuizResult } from "../types/course";

const QUIZZES_COLLECTION = "quizzes";
const QUIZ_ATTEMPTS_COLLECTION = "quizAttempts";

export class QuizService {
  /**
   * Get quiz by ID
   */
  static async getQuiz(quizId: string): Promise<Quiz | null> {
    try {
      const quizDoc = await getDoc(doc(db, QUIZZES_COLLECTION, quizId));
      if (!quizDoc.exists()) return null;

      const data = quizDoc.data();
      return {
        id: quizDoc.id,
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        questions: data.questions || [],
        passingScore: data.passingScore || 70,
        timeLimit: data.timeLimit,
        maxAttempts: data.maxAttempts,
        shuffleQuestions: data.shuffleQuestions || false,
        showCorrectAnswers: data.showCorrectAnswers || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting quiz:", error);
      return null;
    }
  }

  /**
   * Get quiz by course ID
   */
  static async getQuizByCourse(courseId: string): Promise<Quiz | null> {
    try {
      const q = query(
        collection(db, QUIZZES_COLLECTION),
        where("courseId", "==", courseId),
        limit(1),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const quizDoc = snapshot.docs[0];
      const data = quizDoc.data();
      return {
        id: quizDoc.id,
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        questions: data.questions || [],
        passingScore: data.passingScore || 70,
        timeLimit: data.timeLimit,
        maxAttempts: data.maxAttempts,
        shuffleQuestions: data.shuffleQuestions || false,
        showCorrectAnswers: data.showCorrectAnswers || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting quiz by course:", error);
      return null;
    }
  }

  /**
   * Submit quiz attempt
   */
  static async submitAttempt(
    userId: string,
    courseId: string,
    quizId: string,
    answers: {
      questionId: string;
      selectedAnswer: string | number;
      isCorrect: boolean;
      pointsEarned: number;
    }[],
    startedAt: Date,
  ): Promise<QuizAttempt> {
    try {
      const quiz = await this.getQuiz(quizId);
      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Calculate score
      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      const earnedPoints = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed = score >= quiz.passingScore;

      // Get attempt number
      const attemptCount = await this.getAttemptCount(userId, quizId);
      const attemptNumber = attemptCount + 1;

      // Check if max attempts reached
      if (
        quiz.maxAttempts &&
        quiz.maxAttempts > 0 &&
        attemptNumber > quiz.maxAttempts
      ) {
        throw new Error(`Maximum ${quiz.maxAttempts} attempts allowed`);
      }

      const completedAt = new Date();
      const timeSpent = Math.floor(
        (completedAt.getTime() - startedAt.getTime()) / 1000,
      );

      const attemptData = {
        userId,
        courseId,
        quizId,
        answers,
        score,
        passed,
        startedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        timeSpent,
        attemptNumber,
      };

      const docRef = await addDoc(
        collection(db, QUIZ_ATTEMPTS_COLLECTION),
        attemptData,
      );

      return {
        id: docRef.id,
        ...attemptData,
        score,
        passed,
        startedAt,
        completedAt,
        timeSpent,
        attemptNumber,
      };
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      throw error;
    }
  }

  /**
   * Get user's quiz attempts
   */
  static async getUserAttempts(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt[]> {
    try {
      const q = query(
        collection(db, QUIZ_ATTEMPTS_COLLECTION),
        where("userId", "==", userId),
        where("quizId", "==", quizId),
        orderBy("completedAt", "desc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          courseId: data.courseId,
          quizId: data.quizId,
          answers: data.answers || [],
          score: data.score || 0,
          passed: data.passed || false,
          startedAt: data.startedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || new Date(),
          timeSpent: data.timeSpent || 0,
          attemptNumber: data.attemptNumber || 1,
        };
      });
    } catch (error) {
      console.error("Error getting user attempts:", error);
      return [];
    }
  }

  /**
   * Get user's best attempt for a quiz
   */
  static async getBestAttempt(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt | null> {
    try {
      const attempts = await this.getUserAttempts(userId, quizId);
      if (attempts.length === 0) return null;

      return attempts.reduce((best, current) =>
        current.score > best.score ? current : best,
      );
    } catch (error) {
      console.error("Error getting best attempt:", error);
      return null;
    }
  }

  /**
   * Get attempt count for a user and quiz
   */
  private static async getAttemptCount(
    userId: string,
    quizId: string,
  ): Promise<number> {
    try {
      const q = query(
        collection(db, QUIZ_ATTEMPTS_COLLECTION),
        where("userId", "==", userId),
        where("quizId", "==", quizId),
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting attempt count:", error);
      return 0;
    }
  }

  /**
   * Check if user can attempt quiz
   */
  static async canAttemptQuiz(
    userId: string,
    quizId: string,
  ): Promise<{
    canAttempt: boolean;
    remainingAttempts?: number;
    reason?: string;
  }> {
    try {
      const quiz = await this.getQuiz(quizId);
      if (!quiz) {
        return { canAttempt: false, reason: "Quiz not found" };
      }

      if (!quiz.maxAttempts || quiz.maxAttempts === -1) {
        return { canAttempt: true };
      }

      const attemptCount = await this.getAttemptCount(userId, quizId);
      const remaining = quiz.maxAttempts - attemptCount;

      if (remaining <= 0) {
        return {
          canAttempt: false,
          remainingAttempts: 0,
          reason: `Maximum ${quiz.maxAttempts} attempts reached`,
        };
      }

      return { canAttempt: true, remainingAttempts: remaining };
    } catch (error) {
      console.error("Error checking quiz attempt eligibility:", error);
      return { canAttempt: false, reason: "Error checking eligibility" };
    }
  }

  /**
   * Get quiz results for a user (all quizzes attempted)
   */
  static async getUserQuizResults(
    userId: string,
    courseId?: string,
  ): Promise<QuizResult[]> {
    try {
      let q = query(
        collection(db, QUIZ_ATTEMPTS_COLLECTION),
        where("userId", "==", userId),
        orderBy("completedAt", "desc"),
      );

      if (courseId) {
        q = query(
          collection(db, QUIZ_ATTEMPTS_COLLECTION),
          where("userId", "==", userId),
          where("courseId", "==", courseId),
          orderBy("completedAt", "desc"),
        );
      }

      const snapshot = await getDocs(q);
      const attemptsByQuiz = new Map<string, QuizAttempt[]>();

      // Group attempts by quiz
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const quizId = data.quizId;
        if (!attemptsByQuiz.has(quizId)) {
          attemptsByQuiz.set(quizId, []);
        }
        attemptsByQuiz.get(quizId)!.push({
          id: doc.id,
          userId: data.userId,
          courseId: data.courseId,
          quizId: data.quizId,
          answers: data.answers || [],
          score: data.score || 0,
          passed: data.passed || false,
          startedAt: data.startedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || new Date(),
          timeSpent: data.timeSpent || 0,
          attemptNumber: data.attemptNumber || 1,
        });
      });

      // Get best attempt for each quiz
      const results: QuizResult[] = [];
      for (const [quizId, attempts] of attemptsByQuiz) {
        const quiz = await this.getQuiz(quizId);
        const best = attempts.reduce((b, a) => (a.score > b.score ? a : b));
        results.push({
          quizId,
          quizTitle: quiz?.title || "Unknown Quiz",
          bestScore: best.score,
          passed: best.passed,
          attempts: attempts.length,
          lastAttemptAt: best.completedAt,
        });
      }

      return results;
    } catch (error) {
      console.error("Error getting user quiz results:", error);
      return [];
    }
  }

  /**
   * Grade a quiz answer
   */
  static gradeAnswer(
    question: QuizQuestion,
    selectedAnswer: string | number,
  ): { isCorrect: boolean; pointsEarned: number } {
    let isCorrect = false;

    if (
      question.questionType === "multiple_choice" ||
      question.questionType === "true_false"
    ) {
      // Compare with correct answer index
      if (
        typeof question.correctAnswer === "number" &&
        typeof selectedAnswer === "number"
      ) {
        isCorrect = question.correctAnswer === selectedAnswer;
      } else if (
        typeof question.correctAnswer === "string" &&
        typeof selectedAnswer === "string"
      ) {
        isCorrect =
          question.correctAnswer.toLowerCase().trim() ===
          selectedAnswer.toLowerCase().trim();
      }
    } else if (question.questionType === "fill_blank") {
      // For fill in the blank, check if answer contains the correct answer
      if (
        typeof question.correctAnswer === "string" &&
        typeof selectedAnswer === "string"
      ) {
        isCorrect = question.correctAnswer
          .toLowerCase()
          .trim()
          .includes(selectedAnswer.toLowerCase().trim());
      }
    }

    return {
      isCorrect,
      pointsEarned: isCorrect ? question.points : 0,
    };
  }
}

export default QuizService;
