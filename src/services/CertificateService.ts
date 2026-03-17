import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Certificate } from "../types/course";
import EnrollmentService from "./EnrollmentService";
import ProgressService from "./ProgressService";
import QuizService from "./QuizService";

const CERTIFICATES_COLLECTION = "certificates";

export class CertificateService {
  /**
   * Generate a unique certificate number
   */
  private static generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  }

  /**
   * Check if user is eligible for a certificate
   */
  static async checkEligibility(
    userId: string,
    courseId: string,
  ): Promise<{
    eligible: boolean;
    completedLessons: number;
    totalLessons: number;
    quizPassed: boolean;
    issues: string[];
  }> {
    try {
      const issues: string[] = [];

      // Get enrollment
      const enrollment = await EnrollmentService.getEnrollment(
        userId,
        courseId,
      );
      if (!enrollment) {
        return {
          eligible: false,
          completedLessons: 0,
          totalLessons: 0,
          quizPassed: false,
          issues: ["Not enrolled in this course"],
        };
      }

      // Check if course is completed (progress >= 95%)
      if (enrollment.progress < 95) {
        issues.push(`Course progress is ${enrollment.progress}%, need 95%`);
      }

      // Get lesson progress
      const lessonProgress = await ProgressService.getCourseProgress(
        userId,
        courseId,
      );
      const completedLessons = lessonProgress.filter((p) => p.completed).length;
      const totalLessons = lessonProgress.length;

      if (completedLessons < totalLessons) {
        issues.push(
          `Only ${completedLessons} of ${totalLessons} lessons completed`,
        );
      }

      // Check if quiz is passed (if exists)
      const quiz = await QuizService.getQuizByCourse(courseId);
      let quizPassed = true;

      if (quiz) {
        const bestAttempt = await QuizService.getBestAttempt(userId, quiz.id);
        if (!bestAttempt?.passed) {
          quizPassed = false;
          issues.push("Quiz not passed");
        }
      }

      const eligible = issues.length === 0;

      return {
        eligible,
        completedLessons,
        totalLessons,
        quizPassed,
        issues,
      };
    } catch (error) {
      console.error("Error checking certificate eligibility:", error);
      return {
        eligible: false,
        completedLessons: 0,
        totalLessons: 0,
        quizPassed: false,
        issues: ["Error checking eligibility"],
      };
    }
  }

  /**
   * Issue a certificate to user
   */
  static async issueCertificate(
    userId: string,
    courseId: string,
    courseTitle: string,
    instructorName: string,
    studentName: string,
  ): Promise<Certificate> {
    try {
      // Check eligibility
      const eligibility = await this.checkEligibility(userId, courseId);
      if (!eligibility.eligible) {
        throw new Error(`Not eligible: ${eligibility.issues.join(", ")}`);
      }

      // Check if certificate already exists
      const existing = await this.getCertificate(userId, courseId);
      if (existing) {
        return existing;
      }

      const certificateNumber = this.generateCertificateNumber();
      const issueDate = new Date();

      const certificateData = {
        userId,
        courseId,
        courseTitle,
        instructorName,
        studentName,
        issueDate: serverTimestamp(),
        certificateNumber,
        verificationUrl: `https://lms.example.com/verify/${certificateNumber}`,
      };

      const docRef = await addDoc(
        collection(db, CERTIFICATES_COLLECTION),
        certificateData,
      );

      return {
        id: docRef.id,
        ...certificateData,
        issueDate,
      };
    } catch (error) {
      console.error("Error issuing certificate:", error);
      throw error;
    }
  }

  /**
   * Get user's certificate for a course
   */
  static async getCertificate(
    userId: string,
    courseId: string,
  ): Promise<Certificate | null> {
    try {
      const q = query(
        collection(db, CERTIFICATES_COLLECTION),
        where("userId", "==", userId),
        where("courseId", "==", courseId),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        instructorName: data.instructorName,
        studentName: data.studentName,
        issueDate: data.issueDate
          ? (data.issueDate as Timestamp).toDate()
          : new Date(),
        certificateNumber: data.certificateNumber,
        verificationUrl: data.verificationUrl,
      };
    } catch (error) {
      console.error("Error getting certificate:", error);
      return null;
    }
  }

  /**
   * Get all certificates for a user
   */
  static async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      const q = query(
        collection(db, CERTIFICATES_COLLECTION),
        where("userId", "==", userId),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          courseId: data.courseId,
          courseTitle: data.courseTitle,
          instructorName: data.instructorName,
          studentName: data.studentName,
          issueDate: data.issueDate
            ? (data.issueDate as Timestamp).toDate()
            : new Date(),
          certificateNumber: data.certificateNumber,
          verificationUrl: data.verificationUrl,
        };
      });
    } catch (error) {
      console.error("Error getting user certificates:", error);
      return [];
    }
  }

  /**
   * Verify a certificate by certificate number
   */
  static async verifyCertificate(
    certificateNumber: string,
  ): Promise<Certificate | null> {
    try {
      const q = query(
        collection(db, CERTIFICATES_COLLECTION),
        where("certificateNumber", "==", certificateNumber),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        instructorName: data.instructorName,
        studentName: data.studentName,
        issueDate: data.issueDate
          ? (data.issueDate as Timestamp).toDate()
          : new Date(),
        certificateNumber: data.certificateNumber,
        verificationUrl: data.verificationUrl,
      };
    } catch (error) {
      console.error("Error verifying certificate:", error);
      return null;
    }
  }

  /**
   * Generate certificate data for PDF generation
   */
  static getCertificateDataForPDF(certificate: Certificate): {
    title: string;
    subtitle: string;
    recipientName: string;
    courseName: string;
    instructorName: string;
    date: string;
    certificateNumber: string;
  } {
    const dateStr = certificate.issueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      title: "Certificate of Completion",
      subtitle: "This is to certify that",
      recipientName: certificate.studentName,
      courseName: certificate.courseTitle,
      instructorName: certificate.instructorName,
      date: dateStr,
      certificateNumber: certificate.certificateNumber,
    };
  }
}

export default CertificateService;
