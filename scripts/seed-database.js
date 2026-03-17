/**
 * Firebase Database Seed Script
 *
 * This script populates your Firebase database with sample data for testing.
 *
 * Usage:
 * 1. Install Firebase Admin: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Run: node scripts/seed-database.js
 *
 * Or use Firebase Console to manually add data following this structure.
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} = require("firebase/firestore");

// Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data
const sampleData = {
  // Categories
  categories: [
    {
      id: "cat_programming",
      name: "Programming",
      description: "Learn programming languages and development",
      icon: "code-slash",
      color: "#3B82F6",
      courseCount: 2,
      createdAt: new Date(),
    },
    {
      id: "cat_design",
      name: "Design",
      description: "Learn UI/UX design and graphic design",
      icon: "color-palette",
      color: "#EC4899",
      courseCount: 1,
      createdAt: new Date(),
    },
    {
      id: "cat_business",
      name: "Business",
      description: "Learn business and entrepreneurship",
      icon: "briefcase",
      color: "#10B981",
      courseCount: 1,
      createdAt: new Date(),
    },
  ],

  // Sample Courses
  courses: [
    {
      id: "course_react_basic",
      title: "React Native Basics",
      description:
        "Learn the fundamentals of React Native development from scratch. This comprehensive course covers everything from setting up your development environment to building and deploying your first mobile app.",
      shortDescription: "Build mobile apps with React Native",
      instructorId: "user_instructor1",
      instructorName: "Jane Instructor",
      categoryId: "cat_programming",
      thumbnail: "https://picsum.photos/seed/react/800/450",
      previewVideo: null,
      price: 49.99,
      isFree: false,
      isPublished: true,
      level: "beginner",
      duration: 7200,
      totalLessons: 10,
      enrolledCount: 150,
      rating: {
        averageRating: 4.5,
        totalRatings: 30,
        distribution: { 1: 1, 2: 2, 3: 5, 4: 10, 5: 12 },
        lastUpdated: new Date(),
      },
      requirements: [
        "Basic JavaScript knowledge",
        "Computer with internet",
        "Willingness to learn",
      ],
      learningOutcomes: [
        "Build mobile apps for iOS and Android",
        "Understand React Native fundamentals",
        "Work with navigation and state management",
        "Deploy apps to app stores",
      ],
      language: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "course_advanced_js",
      title: "Advanced JavaScript",
      description:
        "Master advanced JavaScript concepts including closures, prototypes, async programming, and design patterns.",
      shortDescription: "Take your JS skills to the next level",
      instructorId: "user_instructor1",
      instructorName: "Jane Instructor",
      categoryId: "cat_programming",
      thumbnail: "https://picsum.photos/seed/javascript/800/450",
      previewVideo: null,
      price: 79.99,
      isFree: false,
      isPublished: true,
      level: "advanced",
      duration: 10800,
      totalLessons: 15,
      enrolledCount: 200,
      rating: {
        averageRating: 4.8,
        totalRatings: 50,
        distribution: { 1: 0, 2: 1, 3: 5, 4: 15, 5: 29 },
        lastUpdated: new Date(),
      },
      requirements: [
        "Solid JavaScript basics",
        "Understanding of HTML/CSS",
        "Experience with web development",
      ],
      learningOutcomes: [
        "Master closures and prototypes",
        "Async programming patterns",
        "Design patterns in JavaScript",
        "Performance optimization",
      ],
      language: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "course_ui_design",
      title: "UI/UX Design Fundamentals",
      description:
        "Learn the principles of user interface and user experience design. Create beautiful, user-friendly designs.",
      shortDescription: "Create stunning user experiences",
      instructorId: "user_instructor2",
      instructorName: "Mike Designer",
      categoryId: "cat_design",
      thumbnail: "https://picsum.photos/seed/design/800/450",
      previewVideo: null,
      price: 59.99,
      isFree: false,
      isPublished: true,
      level: "beginner",
      duration: 5400,
      totalLessons: 8,
      enrolledCount: 80,
      rating: {
        averageRating: 4.3,
        totalRatings: 20,
        distribution: { 1: 1, 2: 1, 3: 4, 4: 8, 5: 6 },
        lastUpdated: new Date(),
      },
      requirements: [
        "No prior design experience needed",
        "Computer with design software (Figma)",
      ],
      learningOutcomes: [
        "Design principles and elements",
        "User research methods",
        "Wireframing and prototyping",
        "Figma mastery",
      ],
      language: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Lessons for React Native course
  lessons: [
    {
      id: "lesson_1",
      courseId: "course_react_basic",
      title: "Introduction to React Native",
      description:
        "Welcome to the course! Learn what React Native is and why it's great for mobile development.",
      type: "video",
      content:
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: 600,
      order: 1,
      isFree: true,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "lesson_2",
      courseId: "course_react_basic",
      title: "Setting Up Your Development Environment",
      description:
        "Install Node.js, React Native CLI, and configure your development environment.",
      type: "video",
      content:
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: 900,
      order: 2,
      isFree: true,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "lesson_3",
      courseId: "course_react_basic",
      title: "Understanding React Components",
      description:
        "Learn about components, props, and the component lifecycle in React Native.",
      type: "text",
      content:
        "# React Native Components\n\nComponents are the building blocks of React Native apps...\n\n## Types of Components\n- Functional Components\n- Class Components",
      duration: 300,
      order: 3,
      isFree: false,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "lesson_4",
      courseId: "course_react_basic",
      title: "Working with State and Props",
      description:
        "Learn how to manage state and pass data between components.",
      type: "video",
      content:
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: 720,
      order: 4,
      isFree: false,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "lesson_5",
      courseId: "course_react_basic",
      title: "Navigation in React Native",
      description:
        "Implement navigation between screens using React Navigation.",
      type: "video",
      content:
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: 840,
      order: 5,
      isFree: false,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "lesson_6",
      courseId: "course_react_basic",
      title: "API Integration",
      description: "Connect your app to REST APIs and handle data fetching.",
      type: "video",
      content:
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: 780,
      order: 6,
      isFree: false,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "lesson_7",
      courseId: "course_react_basic",
      title: "State Management with Context",
      description: "Learn global state management using React Context API.",
      type: "text",
      content: "# State Management\n\nUsing Context API for global state...",
      duration: 420,
      order: 7,
      isFree: false,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "lesson_8",
      courseId: "course_react_basic",
      title: "Working with Native Modules",
      description: "Access native device features through native modules.",
      type: "video",
      content:
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: 660,
      order: 8,
      isFree: false,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "lesson_9",
      courseId: "course_react_basic",
      title: "Publishing Your App",
      description:
        "Learn how to build and submit your app to the App Store and Play Store.",
      type: "video",
      content:
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: 900,
      order: 9,
      isFree: false,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "lesson_10",
      courseId: "course_react_basic",
      title: "Final Project",
      description: "Build a complete mobile app to demonstrate your skills.",
      type: "video",
      content:
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: 1200,
      order: 10,
      isFree: false,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Quiz for React Native course
  quizzes: [
    {
      id: "quiz_1",
      courseId: "course_react_basic",
      title: "React Native Fundamentals Quiz",
      description: "Test your knowledge of React Native basics",
      passingScore: 70,
      timeLimit: 15,
      maxAttempts: 3,
      showCorrectAnswers: true,
      shuffleQuestions: true,
      isPublished: true,
      questions: [
        {
          id: "q1",
          question: "What is React Native?",
          type: "multiple_choice",
          options: [
            "A framework for building iOS apps only",
            "A framework for building mobile apps using React",
            "A programming language",
            "A database system",
          ],
          correctAnswer: 1,
          points: 10,
          explanation:
            "React Native is a framework for building mobile apps using React.",
        },
        {
          id: "q2",
          question: "React Native uses native components for UI.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: 0,
          points: 10,
          explanation:
            "React Native uses actual native iOS and Android components.",
        },
        {
          id: "q3",
          question: "Which hook is used for side effects in React?",
          type: "multiple_choice",
          options: ["useState", "useEffect", "useContext", "useReducer"],
          correctAnswer: 1,
          points: 10,
          explanation:
            "useEffect is used for side effects like data fetching and subscriptions.",
        },
        {
          id: "q4",
          question: "What is JSX?",
          type: "multiple_choice",
          options: [
            "A JavaScript library",
            "A syntax extension that looks like HTML",
            "A database query language",
            "A mobile framework",
          ],
          correctAnswer: 1,
          points: 10,
          explanation:
            "JSX is a syntax extension that allows you to write HTML-like code in JavaScript.",
        },
        {
          id: "q5",
          question: "Which component is used for scrolling in React Native?",
          type: "multiple_choice",
          options: ["div", "ScrollView", "PageView", "WebView"],
          correctAnswer: 1,
          points: 10,
          explanation:
            "ScrollView is the basic scrolling component in React Native.",
        },
        {
          id: "q6",
          question: "Props are mutable in React Native.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: 1,
          points: 10,
          explanation: "Props are read-only and immutable. State is mutable.",
        },
        {
          id: "q7",
          question: "What is the purpose of the FlatList component?",
          type: "multiple_choice",
          options: [
            "To create flat layouts",
            "To render lists efficiently",
            "To style components",
            "To handle navigation",
          ],
          correctAnswer: 1,
          points: 10,
          explanation:
            "FlatList is used for rendering efficient, scrollable lists in React Native.",
        },
        {
          id: "q8",
          question:
            "Which navigation library is commonly used with React Native?",
          type: "multiple_choice",
          options: [
            "React Router",
            "React Navigation",
            "Vue Router",
            "Angular Router",
          ],
          correctAnswer: 1,
          points: 10,
          explanation:
            "React Navigation is the most popular navigation library for React Native.",
        },
        {
          id: "q9",
          question: "What is the purpose of useState hook?",
          type: "multiple_choice",
          options: [
            "To fetch data",
            "To manage component state",
            "To handle routing",
            "To style components",
          ],
          correctAnswer: 1,
          points: 10,
          explanation:
            "useState is used to add state management to functional components.",
        },
        {
          id: "q10",
          question: "Can you use React Native for web apps?",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: 0,
          points: 10,
          explanation:
            "React Native for web (RNW) allows running React Native apps on the web.",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Sample ratings
  ratings: [
    {
      courseId: "course_react_basic",
      userId: "user_student2",
      userName: "Alice Johnson",
      rating: 5,
      review:
        "Excellent course! The instructor explains everything clearly and the projects are hands-on. Highly recommended for beginners!",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      courseId: "course_react_basic",
      userId: "user_student3",
      userName: "Bob Smith",
      rating: 4,
      review:
        "Great content overall. Would love to see more advanced topics in a follow-up course.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      courseId: "course_react_basic",
      userId: "user_student4",
      userName: "Carol Williams",
      rating: 5,
      review:
        "Perfect for someone with no mobile development experience. The step-by-step approach really helped me understand.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      courseId: "course_advanced_js",
      userId: "user_student2",
      userName: "Alice Johnson",
      rating: 5,
      review:
        "Finally understood closures and prototypes! The examples were clear and the exercises were challenging.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      courseId: "course_ui_design",
      userId: "user_student3",
      userName: "Bob Smith",
      rating: 4,
      review:
        "Good introduction to design principles. Figma tutorials were especially helpful.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Sample enrollments
  enrollments: [
    {
      userId: "user_student1",
      courseId: "course_react_basic",
      progress: 30,
      completedLessons: ["lesson_1", "lesson_2", "lesson_3"],
      currentLessonId: "lesson_4",
      enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(),
      completedAt: null,
      isCompleted: false,
    },
    {
      userId: "user_student2",
      courseId: "course_react_basic",
      progress: 100,
      completedLessons: [
        "lesson_1",
        "lesson_2",
        "lesson_3",
        "lesson_4",
        "lesson_5",
        "lesson_6",
        "lesson_7",
        "lesson_8",
        "lesson_9",
        "lesson_10",
      ],
      currentLessonId: null,
      enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isCompleted: true,
    },
    {
      userId: "user_student2",
      courseId: "course_advanced_js",
      progress: 60,
      completedLessons: [
        "lesson_1",
        "lesson_2",
        "lesson_3",
        "lesson_4",
        "lesson_5",
        "lesson_6",
        "lesson_7",
        "lesson_8",
        "lesson_9",
      ],
      currentLessonId: "lesson_10",
      enrolledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(),
      completedAt: null,
      isCompleted: false,
    },
  ],

  // Sample lesson progress
  lessonProgress: [
    {
      userId: "user_student1",
      courseId: "course_react_basic",
      lessonId: "lesson_1",
      watchedDuration: 600,
      totalDuration: 600,
      isCompleted: true,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastPosition: 600,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      userId: "user_student1",
      courseId: "course_react_basic",
      lessonId: "lesson_2",
      watchedDuration: 900,
      totalDuration: 900,
      isCompleted: true,
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      lastPosition: 900,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      userId: "user_student1",
      courseId: "course_react_basic",
      lessonId: "lesson_3",
      watchedDuration: 300,
      totalDuration: 300,
      isCompleted: true,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastPosition: 300,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      userId: "user_student1",
      courseId: "course_react_basic",
      lessonId: "lesson_4",
      watchedDuration: 360,
      totalDuration: 720,
      isCompleted: false,
      completedAt: null,
      lastPosition: 360,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ],

  // Sample quiz attempts
  quizAttempts: [
    {
      userId: "user_student2",
      courseId: "course_react_basic",
      quizId: "quiz_1",
      score: 90,
      passed: true,
      attemptNumber: 1,
      timeSpent: 420,
      answers: [
        {
          questionId: "q1",
          selectedAnswer: 1,
          isCorrect: true,
          pointsEarned: 10,
        },
        {
          questionId: "q2",
          selectedAnswer: 0,
          isCorrect: true,
          pointsEarned: 10,
        },
        {
          questionId: "q3",
          selectedAnswer: 1,
          isCorrect: true,
          pointsEarned: 10,
        },
        {
          questionId: "q4",
          selectedAnswer: 1,
          isCorrect: true,
          pointsEarned: 10,
        },
        {
          questionId: "q5",
          selectedAnswer: 1,
          isCorrect: true,
          pointsEarned: 10,
        },
        {
          questionId: "q6",
          selectedAnswer: 1,
          isCorrect: true,
          pointsEarned: 10,
        },
        {
          questionId: "q7",
          selectedAnswer: 1,
          isCorrect: true,
          pointsEarned: 10,
        },
        {
          questionId: "q8",
          selectedAnswer: 1,
          isCorrect: true,
          pointsEarned: 10,
        },
        {
          questionId: "q9",
          selectedAnswer: 1,
          isCorrect: true,
          pointsEarned: 10,
        },
        {
          questionId: "q10",
          selectedAnswer: 0,
          isCorrect: true,
          pointsEarned: 10,
        },
      ],
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 420000),
    },
  ],

  // Sample certificates
  certificates: [
    {
      certificateNumber: "CERT-RN-2024-001",
      userId: "user_student2",
      courseId: "course_react_basic",
      courseName: "React Native Basics",
      studentName: "Alice Johnson",
      instructorName: "Jane Instructor",
      issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiryDate: null,
      verificationUrl: "https://lms-app.example.com/verify/CERT-RN-2024-001",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ],

  // Sample announcements
  announcements: [
    {
      title: "New Course Available!",
      message:
        "Check out our new Advanced React Native course with advanced topics like animations and native modules.",
      type: "general",
      courseId: null,
      isPublished: true,
      publishedAt: new Date(),
      expiresAt: null,
      createdAt: new Date(),
    },
    {
      title: "React Native Basics Update",
      message:
        "We've added 2 new lessons to the React Native Basics course covering native modules.",
      type: "course",
      courseId: "course_react_basic",
      isPublished: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expiresAt: null,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ],
};

// Function to seed the database
async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Seed categories
    console.log("Seeding categories...");
    for (const category of sampleData.categories) {
      await setDoc(doc(db, "categories", category.id), category);
      console.log(`  - Created category: ${category.name}`);
    }

    // Seed courses
    console.log("Seeding courses...");
    for (const course of sampleData.courses) {
      await setDoc(doc(db, "courses", course.id), course);
      console.log(`  - Created course: ${course.title}`);
    }

    // Seed lessons
    console.log("Seeding lessons...");
    for (const lesson of sampleData.lessons) {
      const courseRef = doc(
        db,
        "courses",
        lesson.courseId,
        "lessons",
        lesson.id,
      );
      await setDoc(courseRef, lesson);
      console.log(`  - Created lesson: ${lesson.title}`);
    }

    // Seed quizzes
    console.log("Seeding quizzes...");
    for (const quiz of sampleData.quizzes) {
      const courseRef = doc(db, "courses", quiz.courseId, "quizzes", quiz.id);
      await setDoc(courseRef, quiz);
      console.log(`  - Created quiz: ${quiz.title}`);
    }

    // Seed ratings
    console.log("Seeding ratings...");
    for (const rating of sampleData.ratings) {
      const ratingRef = doc(collection(db, "ratings"));
      await setDoc(ratingRef, rating);
      console.log(`  - Created rating by: ${rating.userName}`);
    }

    // Seed enrollments
    console.log("Seeding enrollments...");
    for (const enrollment of sampleData.enrollments) {
      const enrollRef = doc(collection(db, "enrollments"));
      await setDoc(enrollRef, enrollment);
      console.log(`  - Created enrollment for course: ${enrollment.courseId}`);
    }

    // Seed lesson progress
    console.log("Seeding lesson progress...");
    for (const progress of sampleData.lessonProgress) {
      const progressRef = doc(collection(db, "lessonProgress"));
      await setDoc(progressRef, progress);
      console.log(`  - Created progress for lesson: ${progress.lessonId}`);
    }

    // Seed quiz attempts
    console.log("Seeding quiz attempts...");
    for (const attempt of sampleData.quizAttempts) {
      const attemptRef = doc(collection(db, "quizAttempts"));
      await setDoc(attemptRef, attempt);
      console.log(`  - Created quiz attempt for: ${attempt.quizId}`);
    }

    // Seed certificates
    console.log("Seeding certificates...");
    for (const cert of sampleData.certificates) {
      const certRef = doc(collection(db, "certificates"));
      await setDoc(certRef, cert);
      console.log(`  - Created certificate: ${cert.certificateNumber}`);
    }

    // Seed announcements
    console.log("Seeding announcements...");
    for (const announcement of sampleData.announcements) {
      const announceRef = doc(collection(db, "announcements"));
      await setDoc(announceRef, announcement);
      console.log(`  - Created announcement: ${announcement.title}`);
    }

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📋 Test Accounts (create in Firebase Auth):");
    console.log("   - Student: student@test.com / password123");
    console.log("   - Instructor: instructor@test.com / password123");
    console.log("   - Admin: admin@test.com / password123");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase();
