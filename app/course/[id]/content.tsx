import EmptyState from "@/components/EmptyState";
import LessonPlayer from "@/components/LessonPlayer";
import Colors from "@/constants/Colors";
import { useAuth } from "@/src/context/AuthContext";
import { useCourses } from "@/src/hooks/useCourses";
import EnrollmentService from "@/src/services/EnrollmentService";
import ProgressService from "@/src/services/ProgressService";
import QuizService from "@/src/services/QuizService";
import {
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
  Section,
} from "@/src/types/course";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CourseContentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getCourseById, getCourseLessons } = useCourses();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [lessonProgress, setLessonProgress] = useState<
    Record<string, LessonProgress>
  >({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum">(
    "overview",
  );
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    loadCourseData();
  }, [id, user]);

  const loadCourseData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(id),
        getCourseLessons(id),
      ]);

      setCourse(courseData);
      setLessons(lessonsData);

      // Group lessons into sections
      const groupedSections = groupLessonsIntoSections(lessonsData);
      setSections(groupedSections);

      // Expand all sections by default
      const sectionIds = new Set(groupedSections.map((s) => s.id));
      setExpandedSections(sectionIds);

      // Load enrollment if user is logged in
      if (user) {
        const enrollmentData = await EnrollmentService.getEnrollment(
          user.uid,
          id,
        );
        setEnrollment(enrollmentData);

        if (enrollmentData) {
          // Load lesson progress
          const progress = await ProgressService.getCourseProgress(
            user.uid,
            id,
          );
          const progressMap: Record<string, LessonProgress> = {};
          progress.forEach((p) => {
            progressMap[p.lessonId] = p;
          });
          setLessonProgress(progressMap);

          // Find last watched lesson or start from first
          const lastProgress = await ProgressService.getLastWatchedPosition(
            enrollmentData.id,
          );
          if (lastProgress) {
            const lastLesson = lessonsData.find(
              (l) => l.id === lastProgress.lessonId,
            );
            if (lastLesson) {
              setCurrentLesson(lastLesson);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupLessonsIntoSections = (lessons: Lesson[]): Section[] => {
    // If lessons have sectionIds, group them
    const sectionMap = new Map<string, Section>();

    lessons.forEach((lesson) => {
      const sectionId = lesson.sectionId || "default";
      if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, {
          id: sectionId,
          courseId: course?.id || "",
          title: lesson.sectionId ? `Section ${sectionId}` : "Course Content",
          order: 0,
          lessons: [],
        });
      }
      const section = sectionMap.get(sectionId)!;
      section.lessons = section.lessons || [];
      section.lessons.push(lesson);
    });

    return Array.from(sectionMap.values());
  };

  const handleEnroll = async () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to enroll in this course",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/login") },
        ],
      );
      return;
    }

    try {
      const newEnrollment = await EnrollmentService.enrollInCourse(
        user.uid,
        id!,
      );
      setEnrollment(newEnrollment);
      Alert.alert("Success", "You have successfully enrolled in this course!");

      // Start from first lesson
      if (lessons.length > 0) {
        setCurrentLesson(lessons[0]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to enroll in course");
    }
  };

  const handleLessonComplete = useCallback(async () => {
    if (!user || !enrollment || !currentLesson) return;

    try {
      await ProgressService.markLessonCompleted(
        user.uid,
        enrollment.id,
        currentLesson.id,
        course?.id || "",
      );

      // Update local progress
      setLessonProgress((prev) => ({
        ...prev,
        [currentLesson.id]: {
          ...prev[currentLesson.id],
          id: currentLesson.id,
          lessonId: currentLesson.id,
          enrollmentId: enrollment.id,
          userId: user.uid,
          courseId: course?.id || "",
          completed: true,
          videoPosition: 0,
          lastWatchedAt: new Date(),
        },
      }));

      // Auto-play next lesson
      const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  }, [user, enrollment, currentLesson, course, lessons]);

  const handleVideoProgress = useCallback(
    async (position: number) => {
      if (!user || !enrollment || !currentLesson) return;

      try {
        await ProgressService.saveVideoPosition(
          user.uid,
          enrollment.id,
          currentLesson.id,
          course?.id || "",
          position,
        );
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    },
    [user, enrollment, currentLesson, course],
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getCompletedLessonsCount = (): number => {
    return Object.values(lessonProgress).filter((p) => p.completed).length;
  };

  const getQuizForCourse = async () => {
    try {
      // Assuming QuizService has getQuizByCourse
      const quizId = `${id}_quiz`; // or fetch from course data
      const quiz = await QuizService.getQuizByCourse(id);
      return quiz;
    } catch (error) {
      console.error("No quiz for this course");
      return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Course not found"
          message="The course you're looking for doesn't exist"
        />
      </View>
    );
  }

  // If viewing a lesson
  if (currentLesson && enrollment) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.lessonHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentLesson(null)}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.lessonHeaderTitle} numberOfLines={1}>
            {currentLesson.title}
          </Text>
        </View>

        {/* Lesson Player */}
        <View style={styles.lessonContent}>
          <LessonPlayer
            lesson={currentLesson}
            onComplete={handleLessonComplete}
            onNext={() => {
              const currentIndex = lessons.findIndex(
                (l) => l.id === currentLesson.id,
              );
              if (currentIndex < lessons.length - 1) {
                setCurrentLesson(lessons[currentIndex + 1]);
              }
            }}
            hasNext={
              lessons.findIndex((l) => l.id === currentLesson.id) <
              lessons.length - 1
            }
            onProgress={handleVideoProgress}
            initialPosition={
              lessonProgress[currentLesson.id]?.videoPosition || 0
            }
          />
        </View>

        {/* Lesson Info & Actions */}
        <View style={styles.lessonActions}>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
            <Text style={styles.lessonDescription}>
              {currentLesson.description}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.completeButton,
              lessonProgress[currentLesson.id]?.completed &&
                styles.completedButton,
            ]}
            onPress={handleLessonComplete}
          >
            <Ionicons
              name={
                lessonProgress[currentLesson.id]?.completed
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={24}
              color="#fff"
            />
            <Text style={styles.completeButtonText}>
              {lessonProgress[currentLesson.id]?.completed
                ? "Completed"
                : "Mark as Complete"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Course Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course Content</Text>
        </View>

        {/* Course Info */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <View style={styles.progressContainer}>
            {enrollment ? (
              <>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${enrollment.progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {getCompletedLessonsCount()} of {lessons.length} lessons
                  completed ({enrollment.progress}%)
                </Text>
              </>
            ) : (
              <Text style={styles.notEnrolledText}>
                Enroll to start learning
              </Text>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "overview" && styles.activeTab]}
            onPress={() => setActiveTab("overview")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "overview" && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "curriculum" && styles.activeTab]}
            onPress={() => setActiveTab("curriculum")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "curriculum" && styles.activeTabText,
              ]}
            >
              Curriculum
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>About this course</Text>
            <Text style={styles.description}>{course.description}</Text>

            {course.longDescription && (
              <>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{course.longDescription}</Text>
              </>
            )}

            {course.instructorBio && (
              <>
                <Text style={styles.sectionTitle}>Instructor</Text>
                <View style={styles.instructorCard}>
                  <View style={styles.instructorAvatar}>
                    <Text style={styles.instructorInitial}>
                      {course.instructorName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.instructorInfo}>
                    <Text style={styles.instructorName}>
                      {course.instructorName}
                    </Text>
                    <Text style={styles.instructorBio}>
                      {course.instructorBio}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {course.requirements && course.requirements.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Requirements</Text>
                {course.requirements.map((req, index) => (
                  <View key={index} style={styles.listItem}>
                    <Ionicons
                      name="ellipse"
                      size={8}
                      color={Colors.light.textSecondary}
                    />
                    <Text style={styles.listItemText}>{req}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {activeTab === "curriculum" && (
          <View style={styles.tabContent}>
            <>
              {sections.map((section) => (
                <View key={section.id} style={styles.section}>
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(section.id)}
                  >
                    <View style={styles.sectionTitleContainer}>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <Text style={styles.sectionMeta}>
                        {section.lessons?.length || 0} lessons
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        expandedSections.has(section.id)
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={20}
                      color={Colors.light.textSecondary}
                    />
                  </TouchableOpacity>

                  {expandedSections.has(section.id) && section.lessons && (
                    <View style={styles.lessonsList}>
                      {section.lessons.map((lesson, index) => {
                        const isCompleted =
                          lessonProgress[lesson.id]?.completed;
                        const isCurrent = currentLesson?.id === lesson.id;

                        return (
                          <TouchableOpacity
                            key={lesson.id}
                            style={[
                              styles.lessonItem,
                              isCurrent && styles.currentLessonItem,
                            ]}
                            onPress={() => setCurrentLesson(lesson)}
                          >
                            <View style={styles.lessonNumber}>
                              {isCompleted ? (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color={Colors.light.success}
                                />
                              ) : isCurrent ? (
                                <View style={styles.lastWatchedBadge}>
                                  <Ionicons
                                    name="time-outline"
                                    size={14}
                                    color="#fff"
                                  />
                                </View>
                              ) : (
                                <Text style={styles.lessonNumberText}>
                                  {index + 1}
                                </Text>
                              )}
                            </View>
                            <View style={styles.lessonContent}>
                              <Text style={styles.lessonTitle}>
                                {lesson.title}
                                {isCurrent && (
                                  <Text style={styles.lastWatchedText}>
                                    {" "}
                                    (Last watched)
                                  </Text>
                                )}
                              </Text>
                              <View style={styles.lessonMeta}>
                                <Ionicons
                                  name={
                                    lesson.lessonType === "video"
                                      ? "play-circle"
                                      : "document-text"
                                  }
                                  size={14}
                                  color={Colors.light.textSecondary}
                                />
                                <Text style={styles.lessonDuration}>
                                  {formatDuration(lesson.duration)}
                                </Text>
                              </View>
                            </View>
                            {lesson.isFree && (
                              <View style={styles.freeBadge}>
                                <Text style={styles.freeBadgeText}>Free</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}
              {enrollment && (
                <TouchableOpacity
                  style={styles.quizButton}
                  onPress={async () => {
                    const quiz = await getQuizForCourse();
                    if (quiz) {
                      router.push(`/quiz/${quiz.id}`);
                    }
                  }}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color={Colors.light.tint}
                  />
                  <Text style={styles.quizButtonText}>Take Course Quiz</Text>
                </TouchableOpacity>
              )}
            </>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom CTA */}
      {enrollment ? (
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              if (currentLesson) {
                // Already viewing
              } else if (lessons.length > 0) {
                setCurrentLesson(lessons[0]);
              }
            }}
          >
            <Text style={styles.continueButtonText}>Continue Learning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomCTA}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll}>
            <Text style={styles.enrollButtonText}>Enroll Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  courseInfo: {
    padding: 16,
    paddingTop: 0,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  notEnrolledText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  instructorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  instructorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  instructorInitial: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  instructorBio: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
  section: {
    marginBottom: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionMeta: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  currentLessonItem: {
    backgroundColor: Colors.light.tint + "10",
  },
  lessonNumber: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  lastWatchedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  lastWatchedText: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: "500",
    fontStyle: "italic",
  },
  quizButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.tint + "10",
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  quizButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.tint,
    marginLeft: 12,
  },
  lessonListContent: {
    flex: 1,
  },
  lessonListTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  lessonDuration: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  freeBadge: {
    backgroundColor: Colors.light.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    fontSize: 10,
    color: Colors.light.success,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 100,
  },
  bottomCTA: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
  },
  enrollButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  continueButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  // Lesson player styles
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  lessonHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  lessonContent: {
    flex: 1,
  },
  lessonActions: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  lessonInfo: {
    marginBottom: 16,
  },
  lessonCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.success,
    paddingVertical: 14,
    borderRadius: 12,
  },
  completedButton: {
    backgroundColor: Colors.light.tint,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
});
