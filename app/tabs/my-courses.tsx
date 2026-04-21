import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../src/context/AuthContext";

// Temporary EnrollmentService placeholder
const getEnrollments = async (userId) => {
  return [];
};

export default function MyCoursesScreen() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const enrollments = await getEnrollments(user.uid);
      setEnrolledCourses([]);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCourseTitle = (id) => {
    if (!id) return "Course";
    return id
      .replace(/^course_/, "")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Courses</Text>
        <Text style={styles.subtitle}>Continue your learning journey</Text>
      </View>

      {enrolledCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="book-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No courses yet</Text>
          <Text style={styles.emptyText}>
            Enroll in a course to start learning
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/tabs")}
          >
            <Text style={styles.browseButtonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        enrolledCourses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseCard}
            onPress={() => router.push(`/course/${course.id}`)}
          >
            <View style={styles.courseImage}>
              <Icon name="book-outline" size={32} color="#8B5CF6" />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>
                {formatCourseTitle(course.id)}
              </Text>
              <Text style={styles.courseInstructor}>
                {course.instructorName || "Instructor"}
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${course.progress || 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {course.progress || 0}% complete
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#8B5CF6",
    padding: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF" },
  subtitle: { fontSize: 14, color: "#E9D5FF", marginTop: 4 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#1F2937" },
  emptyText: { fontSize: 14, color: "#6B7280" },
  browseButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  browseButtonText: { color: "#FFFFFF", fontWeight: "600" },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  courseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  courseInfo: { flex: 1 },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  courseInstructor: { fontSize: 13, color: "#6B7280", marginBottom: 8 },
  progressContainer: { gap: 4 },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#8B5CF6", borderRadius: 3 },
  progressText: { fontSize: 11, color: "#9CA3AF" },
});
