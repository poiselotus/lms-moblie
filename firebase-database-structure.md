# Firebase Firestore Database Structure

This document provides the complete Firestore database structure needed to test all LMS features.

## Collections Overview

```
/users/{userId}
/courses/{courseId}
  /lessons/{lessonId}
  /quizzes/{quizId}
/categories/{categoryId}
/enrollments/{enrollmentId}
/lessonProgress/{progressId}
/ratings/{ratingId}
/quizAttempts/{attemptId}
/certificates/{certificateId}
/pushTokens/{userId}
/announcements/{announcementId}
```

---

## 1. USERS Collection

**Path:** `/users/{userId}`

**Required Fields:**

```
json
{
  "uid": "user123",
  "email": "john@example.com",
  "displayName": "John Doe",
  "photoURL": "https://example.com/avatar.jpg",
  "role": "student",  // "student" | "instructor" | "admin"
  "bio": "Software developer learning new skills",
  "profileCompleted": true,
  "emailVerified": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Sample Users:**

- `user_student1` - Student account
- `user_instructor1` - Instructor account (role: "instructor")
- `user_admin1` - Admin account (role: "admin")

---

## 2. CATEGORIES Collection

**Path:** `/categories/{categoryId}`

**Required Fields:**

```
json
{
  "id": "cat_programming",
  "name": "Programming",
  "description": "Learn programming languages and development",
  "icon": "code-slash",
  "color": "#3B82F6",
  "courseCount": 5,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Sample Categories:**

- `cat_programming` - Programming
- `cat_design` - Design
- `cat_business` - Business
- `cat_marketing` - Marketing
- `cat_data science` - Data Science

---

## 3. COURSES Collection

**Path:** `/courses/{courseId}`

**Required Fields:**

```
json
{
  "id": "course_react_basic",
  "title": "React Native Basics",
  "description": "Learn the fundamentals of React Native development",
  "shortDescription": "Build mobile apps with React Native",
  "instructorId": "user_instructor1",
  "instructorName": "Jane Instructor",
  "categoryId": "cat_programming",
  "thumbnail": "https://example.com/course-thumb.jpg",
  "previewVideo": "https://example.com/preview.mp4",
  "price": 49.99,
  "isFree": false,
  "isPublished": true,
  "level": "beginner",  // "beginner" | "intermediate" | "advanced"
  "duration": 3600,  // in seconds
  "totalLessons": 10,
  "enrolledCount": 150,
  "rating": {
    "averageRating": 4.5,
    "totalRatings": 30,
    "distribution": {
      "1": 1,
      "2": 2,
      "3": 5,
      "4": 10,
      "5": 12
    },
    "lastUpdated": "2024-01-20T00:00:00Z"
  },
  "requirements": ["Basic JavaScript knowledge", "Computer with internet"],
  "learningOutcomes": ["Build mobile apps", "Understand React Native", "Deploy to stores"],
  "language": "en",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-20T00:00:00Z"
}
```

**Sample Courses:**

- `course_react_basic` - React Native Basics (published)
- `course_advanced_js` - Advanced JavaScript (published)
- `course_ui_design` - UI/UX Design Fundamentals (published)
- `course_python` - Python for Beginners (draft)

---

## 4. LESSONS Subcollection

**Path:** `/courses/{courseId}/lessons/{lessonId}`

**Required Fields:**

```
json
{
  "id": "lesson_1",
  "courseId": "course_react_basic",
  "title": "Introduction to React Native",
  "description": "Getting started with React Native",
  "type": "video",  // "video" | "text" | "pdf" | "quiz" | "external"
  "content": "https://example.com/video.mp4",
  "duration": 600,  // in seconds
  "order": 1,
  "isFree": true,
  "isPublished": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Sample Lessons for course_react_basic:**

- `lesson_1` - Introduction (video, free)
- `lesson_2` - Setting Up Environment (video)
- `lesson_3` - Components Basics (text)
- `lesson_4` - State and Props (video)
- `lesson_5` - Navigation (video)
- `lesson_6` - API Integration (video)
- `lesson_7` - State Management (text)
- `lesson_8` - Native Modules (video)
- `lesson_9` - Publishing (video)
- `lesson_10` - Final Project (project)

---

## 5. QUIZZES Subcollection

**Path:** `/courses/{courseId}/quizzes/{quizId}`

**Required Fields:**

```
json
{
  "id": "quiz_1",
  "courseId": "course_react_basic",
  "title": "React Native Fundamentals Quiz",
  "description": "Test your knowledge of React Native basics",
  "passingScore": 70,
  "timeLimit": 15,  // in minutes, null for no limit
  "maxAttempts": 3,
  "showCorrectAnswers": true,
  "shuffleQuestions": true,
  "isPublished": true,
  "questions": [
    {
      "id": "q1",
      "question": "What is React Native?",
      "type": "multiple_choice",
      "options": [
        "A framework for building iOS apps",
        "A framework for building mobile apps using React",
        "A programming language",
        "A database system"
      ],
      "correctAnswer": 1,
      "points": 10,
      "explanation": "React Native is a framework for building mobile apps using React."
    },
    {
      "id": "q2",
      "question": "React Native uses native components.",
      "type": "true_false",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "points": 10,
      "explanation": "React Native uses native iOS and Android components."
    },
    {
      "id": "q3",
      "question": "What hook is used for side effects?",
      "type": "multiple_choice",
      "options": ["useState", "useEffect", "useContext", "useReducer"],
      "correctAnswer": 1,
      "points": 10,
      "explanation": "useEffect is used for side effects like data fetching."
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## 6. ENROLLMENTS Collection

**Path:** `/enrollments/{enrollmentId}`

**Required Fields:**

```
json
{
  "id": "enroll_1",
  "userId": "user_student1",
  "courseId": "course_react_basic",
  "progress": 30,  // percentage 0-100
  "completedLessons": ["lesson_1", "lesson_2", "lesson_3"],
  "currentLessonId": "lesson_4",
  "enrolledAt": "2024-01-10T00:00:00Z",
  "lastAccessedAt": "2024-01-15T10:00:00Z",
  "completedAt": null,
  "isCompleted": false
}
```

**Sample Enrollments:**

- Student enrolled in React Native course (30% complete)
- Student enrolled in JavaScript course (100% complete)

---

## 7. LESSON PROGRESS Collection

**Path:** `/lessonProgress/{progressId}`

**Required Fields:**

```
json
{
  "id": "progress_1",
  "userId": "user_student1",
  "courseId": "course_react_basic",
  "lessonId": "lesson_1",
  "watchedDuration": 300,  // seconds watched
  "totalDuration": 600,    // total video duration
  "isCompleted": true,
  "completedAt": "2024-01-10T10:30:00Z",
  "lastPosition": 600,  // for resuming video
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:30:00Z"
}
```

---

## 8. RATINGS Collection

**Path:** `/ratings/{ratingId}`

**Required Fields:**

```
json
{
  "id": "rating_1",
  "courseId": "course_react_basic",
  "userId": "user_student1",
  "userName": "John Doe",
  "rating": 5,
  "review": "Excellent course! Very well explained concepts.",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Sample Ratings:**

- 5 stars - "Excellent course!"
- 4 stars - "Great content, would recommend"
- 3 stars - "Good course, could use more examples"

---

## 9. QUIZ ATTEMPTS Collection

**Path:** `/quizAttempts/{attemptId}`

**Required Fields:**

```
json
{
  "id": "attempt_1",
  "userId": "user_student1",
  "courseId": "course_react_basic",
  "quizId": "quiz_1",
  "score": 80,
  "passed": true,
  "attemptNumber": 1,
  "timeSpent": 480,  // seconds
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": 1,
      "isCorrect": true,
      "pointsEarned": 10
    },
    {
      "questionId": "q2",
      "selectedAnswer": 0,
      "isCorrect": true,
      "pointsEarned": 10
    },
    {
      "questionId": "q3",
      "selectedAnswer": 1,
      "isCorrect": true,
      "pointsEarned": 10
    }
  ],
  "startedAt": "2024-01-15T10:00:00Z",
  "completedAt": "2024-01-15T10:08:00Z"
}
```

---

## 10. CERTIFICATES Collection

**Path:** `/certificates/{certificateId}`

**Required Fields:**

```
json
{
  "id": "cert_1",
  "certificateNumber": "CERT-RN-2024-001",
  "userId": "user_student1",
  "courseId": "course_react_basic",
  "courseName": "React Native Basics",
  "studentName": "John Doe",
  "instructorName": "Jane Instructor",
  "issueDate": "2024-01-20T00:00:00Z",
  "expiryDate": null,  // null for no expiry
  "verificationUrl": "https://example.com/verify/cert_1",
  "createdAt": "2024-01-20T00:00:00Z"
}
```

---

## 11. PUSH TOKENS Collection

**Path:** `/pushTokens/{userId}`

**Required Fields:**

```
json
{
  "userId": "user_student1",
  "token": "ExponentPushToken[xxxxxxx]",
  "deviceId": "device_abc123",
  "platform": "ios",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## 12. ANNOUNCEMENTS Collection

**Path:** `/announcements/{announcementId}`

**Required Fields:**

```
json
{
  "id": "announce_1",
  "title": "New Course Available!",
  "message": "Check out our new Advanced React Native course.",
  "type": "general",  // "general" | "course" | "system"
  "courseId": null,
  "isPublished": true,
  "publishedAt": "2024-01-20T00:00:00Z",
  "expiresAt": null,
  "createdAt": "2024-01-20T00:00:00Z"
}
```

---

## Testing Checklist

Use this checklist to verify all features:

### Authentication

- [ ] User can sign up as student/instructor
- [ ] User can log in
- [ ] User can reset password
- [ ] Email verification works

### Course Browsing

- [ ] Courses display on home screen
- [ ] Categories filter works
- [ ] Course search works
- [ ] Course detail page shows all info

### Course Progress

- [ ] User can enroll in a course
- [ ] Video player tracks progress
- [ ] Progress bar updates correctly
- [ ] Lesson completion is tracked
- [ ] Course completion percentage updates

### Quiz System

- [ ] Quiz loads in course
- [ ] Timer works (if enabled)
- [ ] Answers are graded correctly
- [ ] Results show pass/fail
- [ ] Attempts are tracked

### Ratings & Reviews

- [ ] Rating modal appears after course completion
- [ ] 5-star rating works
- [ ] Review text saves
- [ ] Rating appears on course
- [ ] Average rating updates

### Notifications

- [ ] Permission request works
- [ ] Push token saves to Firestore
- [ ] Local notifications schedule correctly

### Certificates

- [ ] Certificate generates on course completion
- [ ] Certificate has unique number
- [ ] Verification works

---

## Quick Setup Script

To quickly populate your database, you can use the Firebase Console or run a script. Here's the order:

1. Create Categories first
2. Create an Instructor user (role: "instructor")
3. Create Courses with the instructor ID
4. Add Lessons to courses
5. Add Quizzes to courses
6. Create Student users
7. Create Enrollments
8. Create some Lesson Progress
9. Create sample Ratings
10. Create sample Quiz Attempts
