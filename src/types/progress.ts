export interface LessonProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  lastPosition?: number;
  lastAccessedAt?: string;
}

export interface EnrollmentProgress {
  progress: number;
  lastAccessedAt: string;
  lastAccessedLessonId?: string;
}
