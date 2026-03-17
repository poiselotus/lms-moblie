import EmptyState from "@/components/EmptyState";
import Colors from "@/constants/Colors";
import { useCourses } from "@/src/hooks/useCourses";
import { Enrollment, Course, Lesson, Review } from "@/src/types/course";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getCourseById, getCourseLessons, getCourseReviews } = useCourses();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "lessons" | "reviews"
  >("overview");

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [courseData, lessonsData, reviewsData] = await Promise.all([
        getCourseById(id),
        getCourseLessons(id),
        getCourseReviews(id),
      ]);

      setCourse(courseData);
      setLessons(lessonsData);
      setReviews(reviewsData);

      // Load enrollment and progress if user is logged in
      if (user && courseData) {
        const enrollmentData = await EnrollmentService.getEnrollment(
          user.uid,
          id as string,
        );
        setEnrollment(enrollmentData);

        if (enrollmentData && lessonsData.length > 0) {
          const progressData = await ProgressService.getCompletedLessonsCount(
            user.uid,
            id as string,
            lessonsData.length,
          );
          const totalProgress = Math.round(
            (progressData / lessonsData.length) * 100,
          );
          setCourseProgress(totalProgress);
          setCompletedLessons(progressData);
        }
      }
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price: number): string => {
    if (price === 0) return "Free";
    return `$${price.toFixed(2)}`;
  };

  const renderLessonItem = (lesson: Lesson, index: number) => (
    <View key={lesson.id} style={styles.lessonItem}>
      <View style={styles.lessonNumber}>
        <Text style={styles.lessonNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.lessonContent}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <View style={styles.lessonMeta}>
          <Ionicons
            name="play-circle-outline"
            size={16}
            color={Colors.light.textSecondary}
          />
          <Text style={styles.lessonDuration}>
            {formatDuration(lesson.duration)}
          </Text>
          {lesson.isFree && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>Free</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={20} color={Colors.light.tint} />
      </TouchableOpacity>
    </View>
  );

  const renderReviewItem = (review: Review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerAvatar}>
          <Text style={styles.reviewerInitial}>
            {review.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{review.userName}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= review.rating ? "star" : "star-outline"}
                size={14}
                color="#FFC107"
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
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
          message="The course you're looking for doesn't exist or has been removed."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {course.thumbnail ? (
            <Image source={{ uri: course.thumbnail }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons
                name="play-circle"
                size={64}
                color={Colors.light.tint}
              />
            </View>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Course Info */}
        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{course.category}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{course.level}</Text>
            </View>
          </View>

          <Text style={styles.title}>{course.title}</Text>

          <View style={styles.instructorRow}>
            <Ionicons
              name="person-circle"
              size={20}
              color={Colors.light.textSecondary}
            />
            <Text style={styles.instructorName}>{course.instructorName}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#FFC107" />
              <Text style={styles.statValue}>{course.rating}</Text>
              <Text style={styles.statLabel}>
                ({course.totalReviews} reviews)
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="people"
                size={18}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.statValue}>
                {course.enrolledCount.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>students</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="time-outline"
                size={18}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.statValue}>
                {formatDuration(course.duration)}
              </Text>
            </View>
            {enrollment && (
              <View style={[styles.statItem, styles.progressItem]}>
                <View style={styles.progressBarSmall}>
                  <View
                    style={[
                      styles.progressFillSmall,
                      { width: `${courseProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.statValue}>{courseProgress}% complete</Text>
              </View>
            )}
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
              style={[styles.tab, activeTab === "lessons" && styles.activeTab]}
              onPress={() => setActiveTab("lessons")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "lessons" && styles.activeTabText,
                ]}
              >
                Lessons ({lessons.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
              onPress={() => setActiveTab("reviews")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "reviews" && styles.activeTabText,
                ]}
              >
                Reviews ({reviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>About this course</Text>
              <Text style={styles.description}>{course.description}</Text>

              <Text style={styles.sectionTitle}>What you'll learn</Text>
              <View style={styles.learningPoints}>
                <View style={styles.learningItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.light.tint}
                  />
                  <Text style={styles.learningText}>
                    Build real-world projects
                  </Text>
                </View>
                <View style={styles.learningItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.light.tint}
                  />
                  <Text style={styles.learningText}>
                    Master the fundamentals
                  </Text>
                </View>
                <View style={styles.learningItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.light.tint}
                  />
                  <Text style={styles.learningText}>
                    Get certificate of completion
                  </Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === "lessons" && (
            <View style={styles.tabContent}>
              {lessons.length > 0 ? (
                lessons.map((lesson, index) => renderLessonItem(lesson, index))
              ) : (
                <EmptyState
                  icon="play-circle-outline"
                  title="No lessons yet"
                  message="Lessons will be available soon"
                />
              )}
            </View>
          )}

          {activeTab === "reviews" && (
            <View style={styles.tabContent}>
              {reviews.length > 0 ? (
                reviews.map((review) => renderReviewItem(review))
              ) : (
                <EmptyState
                  icon="star-outline"
                  title="No reviews yet"
                  message="Be the first to review this course"
                />
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        {enrollment ? (
          <TouchableOpacity style={styles.continueButton}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.continueButtonText}>
              Continue Learning ({courseProgress}%)
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatPrice(course.price)}</Text>
            </View>
            <TouchableOpacity style={styles.enrollButton}>
              <Text style={styles.enrollButtonText}>Enroll Now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: width,
    height: 220,
  },
  placeholderImage: {
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: Colors.light.tint + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    color: Colors.light.tint,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  levelBadge: {
    backgroundColor: Colors.light.secondary + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: Colors.light.secondary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  instructorName: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginLeft: 4,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: 16,
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
    paddingBottom: 16,
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
    marginBottom: 16,
  },
  learningPoints: {
    gap: 12,
  },
  learningItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  learningText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  lessonNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.tint + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.tint,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
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
    marginLeft: 8,
  },
  freeBadgeText: {
    fontSize: 10,
    color: Colors.light.success,
    fontWeight: "600",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.tint + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  progressItem: {
    alignItems: "center",
  },
  progressBarSmall: {
    width: 60,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFillSmall: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 2,
  },
});
