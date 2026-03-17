export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type LessonType = "video" | "text" | "pdf" | "external";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

export interface Instructor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: number;
  videoUrl?: string;
  content?: string; // For text lessons
  pdfUrl?: string; // For PDF lessons
  externalUrl?: string; // For external link lessons
  order: number;
  isFree: boolean;
  lessonType: LessonType;
  sectionId?: string;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons?: Lesson[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  instructorId: string;
  instructorName: string;
  instructorBio?: string;
  category: string;
  level: CourseLevel;
  duration: number;
  price: number;
  thumbnail: string;
  enrolledCount: number;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
  isFeatured: boolean;
  isPublished: boolean;
  lessonsCount?: number;
  categoryName?: string;
  requirements?: string[];
  learningPoints?: string[];
  sections?: Section[];
}

export interface CourseFilter {
  category?: string;
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  priceRange?: "free" | "paid" | "all";
}

export interface PaginatedCourses {
  courses: Course[];
  lastDoc: any;
  hasMore: boolean;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  progress: number; // 0-100
  lastAccessedAt: Date;
  completedAt?: Date;
  isActive: boolean;
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  userId: string;
  courseId: string;
  completed: boolean;
  completedAt?: Date;
  videoPosition: number; // in seconds
  lastWatchedAt: Date;
}

// Video Player Types
export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  playbackRate: number;
  isLoading: boolean;
  error?: string;
}

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

// Continue Learning Types
export interface ContinueLearning {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  lessonId: string;
  lessonTitle: string;
  progress: number;
  lastAccessedAt: Date;
}

// ==================== QUIZ TYPES ====================

export type QuestionType = "multiple_choice" | "true_false" | "fill_blank";

export interface QuizQuestion {
  id: string;
  question: string;
  questionType: QuestionType;
  options: string[]; // For multiple choice
  correctAnswer: string | number; // string for text, number for option index
  explanation?: string;
  points: number;
  order: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number; // Percentage
  timeLimit?: number; // in minutes, optional
  maxAttempts?: number; // -1 for unlimited
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  courseId: string;
  quizId: string;
  answers: {
    questionId: string;
    selectedAnswer: string | number;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
  score: number; // Percentage
  passed: boolean;
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // in seconds
  attemptNumber: number;
}

export interface QuizResult {
  quizId: string;
  quizTitle: string;
  bestScore: number;
  passed: boolean;
  attempts: number;
  lastAttemptAt: Date;
}

// ==================== CERTIFICATE TYPES ====================

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  studentName: string;
  issueDate: Date;
  certificateNumber: string;
  verificationUrl?: string;
}

// ==================== COURSE WITH PROGRESS ====================

export interface CourseWithProgress extends Course {
  enrollment?: Enrollment;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  lastWatchedLesson?: Lesson;
  certificate?: Certificate;
}
