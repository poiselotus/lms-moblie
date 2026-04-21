import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../../src/config/firebase";

export default function HomeScreen() {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriesRef = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);

      const coursesRef = collection(db, "courses");
      const q = query(coursesRef, where("isPublished", "==", true));
      const coursesSnapshot = await getDocs(q);
      const coursesData = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCourseTitle = (id) => {
    return id
      .replace(/^course_/, "")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getIconName = (iconName) => {
    const icons = {
      briefcase: "briefcase-outline",
      "bar-chart": "bar-chart-outline",
      palette: "color-palette-outline",
      megaphone: "megaphone-outline",
      "code-slash": "code-outline",
    };
    return icons[iconName] || "book-outline";
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatCourseTitle(course.id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>Poise lotus!</Text>
        <Text style={styles.headerSubtitle}>
          Continue your learning journey
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Categories Section with Icons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { backgroundColor: category.color + "15" },
              ]}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color },
                ]}
              >
                <Icon
                  name={getIconName(category.icon)}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>
                {category.courseCount || 0} courses
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Courses Section with Image Placeholders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Courses</Text>
        <View style={styles.coursesGrid}>
          {filteredCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseCard}
              onPress={() => router.push(`/course/${course.id}`)}
            >
              {/* Course Image Placeholder - This was working before! */}
              <View style={styles.courseImageContainer}>
                <View
                  style={[
                    styles.courseImagePlaceholder,
                    { backgroundColor: "#8B5CF6" },
                  ]}
                >
                  <Icon name="book-outline" size={32} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.courseTitle}>
                {formatCourseTitle(course.id)}
              </Text>
              <Text style={styles.courseDescription} numberOfLines={2}>
                {course.description}
              </Text>

              <View style={styles.courseFooter}>
                <Text style={styles.courseInstructor}>
                  {course.instructorName}
                </Text>
                <View
                  style={[styles.priceBadge, course.isFree && styles.freeBadge]}
                >
                  <Text style={styles.priceText}>
                    {course.isFree
                      ? "Free"
                      : `₦${((course.price || 49.99) * 1500).toLocaleString()}`}
                  </Text>
                </View>
              </View>
              <Text style={styles.enrolledCount}>
                {course.enrolledCount || 0} students
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {filteredCourses.length === 0 && (
          <Text style={styles.noResults}>No courses found</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#8B5CF6",
    padding: 24,
    paddingTop: Platform.OS === "web" ? 24 : 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: { fontSize: 14, color: "#E9D5FF" },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 4,
  },
  headerSubtitle: { fontSize: 14, color: "#E9D5FF", marginTop: 8 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: "#1F2937" },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  categoriesScroll: { flexDirection: "row" },
  categoryCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  categoryCount: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  coursesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  courseCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  courseImageContainer: {
    width: "100%",
    height: 100,
    backgroundColor: "#F3F4F6",
  },
  courseImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
    paddingHorizontal: 12,
  },
  courseDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  courseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  courseInstructor: { fontSize: 12, color: "#6B7280" },
  priceBadge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeBadge: { backgroundColor: "#D1FAE5" },
  priceText: { fontSize: 12, fontWeight: "600", color: "#8B5CF6" },
  enrolledCount: {
    fontSize: 11,
    color: "#9CA3AF",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  noResults: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 32,
    fontSize: 16,
  },
});
