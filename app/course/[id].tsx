import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/config/firebase";
import { useAuth } from "../../src/context/AuthContext";

export default function CoursePreviewScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseRef = doc(db, "courses", id);
      const courseDoc = await getDoc(courseRef);

      if (courseDoc.exists()) {
        setCourse({ id: courseDoc.id, ...courseDoc.data() });
      }

      // Fetch lessons
      const lessonsRef = collection(db, `courses/${id}/lessons`);
      const lessonsSnapshot = await getDocs(lessonsRef);
      const lessonsData = lessonsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.order - b.order);
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCourseTitle = (courseId) => {
    return courseId
      .replace(/^course_/, "")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleEnroll = () => {
    Alert.alert("Enroll", "Enrollment feature coming soon");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Course not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="book" size={64} color="#FFFFFF" />
        </View>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Course Info */}
      <View style={styles.content}>
        <Text style={styles.title}>{formatCourseTitle(course.id)}</Text>
        <Text style={styles.description}>{course.description}</Text>

        {/* Instructor */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>By {course.instructorName}</Text>
        </View>

        {/* Duration */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            Duration: {formatDuration(course.duration)}
          </Text>
        </View>

        {/* Lessons Count */}
        <View style={styles.infoRow}>
          <Ionicons name="library-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>{lessons.length} lessons</Text>
        </View>

        {/* Students */}
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            {course.enrolledCount || 0} students enrolled
          </Text>
        </View>

        {/* Rating */}
        <View style={styles.infoRow}>
          <Ionicons name="star-outline" size={20} color="#F59E0B" />
          <Text style={styles.infoText}>4.8 (124 ratings)</Text>
        </View>

        {/* Price */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Course Price</Text>
          <Text style={styles.priceValue}>
            {course.isFree ? "Free" : "$49.99"}
          </Text>
          {!course.isFree && (
            <Text style={styles.priceNote}>
              One-time payment, lifetime access
            </Text>
          )}
        </View>

        {/* Enroll Button */}
        <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll}>
          <Text style={styles.enrollButtonText}>
            {isEnrolled ? "Continue Learning" : "Enroll Now"}
          </Text>
        </TouchableOpacity>

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Learn</Text>
          <View style={styles.learnItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.learnText}>
              Master core concepts and techniques
            </Text>
          </View>
          <View style={styles.learnItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.learnText}>Build real-world projects</Text>
          </View>
          <View style={styles.learnItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.learnText}>Get certified upon completion</Text>
          </View>
        </View>

        {/* Course Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Content</Text>
          {lessons.map((lesson, index) => (
            <View key={lesson.id} style={styles.lessonItem}>
              <Ionicons name="play-circle-outline" size={20} color="#8B5CF6" />
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonDuration}>
                  {formatDuration(lesson.duration)}
                </Text>
              </View>
            </View>
          ))}
          {lessons.length === 0 && (
            <Text style={styles.noLessons}>Course content coming soon</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  errorText: { fontSize: 18, color: "#6B7280" },
  backButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: { color: "#FFFFFF", fontWeight: "600" },
  imageContainer: {
    height: 200,
    backgroundColor: "#8B5CF6",
    position: "relative",
  },
  imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  backIcon: {
    position: "absolute",
    top: 48,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  content: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  infoText: { fontSize: 14, color: "#6B7280" },
  priceCard: {
    backgroundColor: "#F3E8FF",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  priceLabel: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  priceValue: { fontSize: 28, fontWeight: "bold", color: "#8B5CF6" },
  priceNote: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  enrollButton: {
    backgroundColor: "#8B5CF6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  enrollButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  learnItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  learnText: { fontSize: 14, color: "#1F2937", flex: 1 },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: "500", color: "#1F2937" },
  lessonDuration: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  noLessons: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 20,
  },
});
