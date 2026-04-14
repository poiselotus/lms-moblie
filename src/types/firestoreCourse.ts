export interface FirestoreCourse {
  categoryId: string;
  description: string;
  duration: number;
  enrolledCount: number;
  id: string;
  instructorId: string;
  instructorName: string;
  isFree: boolean;
  isPublished: boolean;
  createdAt: Date;
}

export function deriveCourseTitle(courseId: string): string {
  return courseId
    .replace(/^course_/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// UI Course type with derived fields
export interface Course {
  id: string;
  title: string;
  description: string;
  duration: number;
  enrolledCount: number;
  instructorName: string;
  isFree: boolean;
  isPublished: boolean;
  createdAt: Date;
  categoryId: string;
  rating?: number;
  categoryName?: string;
  categoryColor?: string;
}
