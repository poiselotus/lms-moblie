import CategoryPills from "@/components/CategoryPills";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import FeaturedCourseCard from "@/components/FeaturedCourseCard";
import FilterModal from "@/components/FilterModal";
import SearchBar from "@/components/SearchBar";
import SectionHeader from "@/components/SectionHeader";
import Colors from "@/constants/Colors";
import { useCourses } from "@/src/hooks/useCourses";
import { Course, CourseFilter } from "@/src/types/course";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Default categories if Firebase doesn't return any
const DEFAULT_CATEGORIES = [
  { id: "all", name: "All", icon: "apps", color: "#6C63FF", order: 0 },
  {
    id: "development",
    name: "Development",
    icon: "code-slash",
    color: "#4CAF50",
    order: 1,
  },
  {
    id: "design",
    name: "Design",
    icon: "color-palette",
    color: "#FF6B6B",
    order: 2,
  },
  {
    id: "business",
    name: "Business",
    icon: "briefcase",
    color: "#FFC107",
    order: 3,
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: "megaphone",
    color: "#9C27B0",
    order: 4,
  },
  {
    id: "photography",
    name: "Photography",
    icon: "camera",
    color: "#00BCD4",
    order: 5,
  },
  {
    id: "music",
    name: "Music",
    icon: "musical-notes",
    color: "#FF9800",
    order: 6,
  },
];

// Sample featured courses for demo
const SAMPLE_FEATURED_COURSES: Course[] = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp 2024",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and more",
    instructorId: "inst1",
    instructorName: "Sarah Johnson",
    category: "development",
    level: "beginner",
    duration: 750,
    price: 89.99,
    thumbnail: "https://picsum.photos/seed/course1/400/225",
    enrolledCount: 12500,
    rating: 4.8,
    totalReviews: 2340,
    createdAt: new Date(),
    updatedAt: new Date(),
    isFeatured: true,
    isPublished: true,
    lessonsCount: 85,
  },
  {
    id: "2",
    title: "UI/UX Design Masterclass",
    description: "Master the art of user interface and experience design",
    instructorId: "inst2",
    instructorName: "Michael Chen",
    category: "design",
    level: "intermediate",
    duration: 600,
    price: 79.99,
    thumbnail: "https://picsum.photos/seed/course2/400/225",
    enrolledCount: 8200,
    rating: 4.9,
    totalReviews: 1560,
    createdAt: new Date(),
    updatedAt: new Date(),
    isFeatured: true,
    isPublished: true,
    lessonsCount: 72,
  },
];

// Sample popular courses for demo
const SAMPLE_POPULAR_COURSES: Course[] = [
  {
    id: "3",
    title: "React Native: Build Mobile Apps",
    description: "Create cross-platform mobile applications with React Native",
    instructorId: "inst3",
    instructorName: "Emily Davis",
    category: "development",
    level: "intermediate",
    duration: 750,
    price: 69.99,
    thumbnail: "https://picsum.photos/seed/course3/400/225",
    enrolledCount: 15000,
    rating: 4.7,
    totalReviews: 2340,
    createdAt: new Date(),
    updatedAt: new Date(),
    isFeatured: false,
    isPublished: true,
    lessonsCount: 85,
  },
  {
    id: "4",
    title: "Python for Data Science",
    description: "Learn Python, Pandas, NumPy, and machine learning",
    instructorId: "inst4",
    instructorName: "Dr. Andrew Wilson",
    category: "development",
    level: "beginner",
    duration: 1215,
    price: 94.99,
    thumbnail: "https://picsum.photos/seed/course4/400/225",
    enrolledCount: 25000,
    rating: 4.8,
    totalReviews: 5600,
    createdAt: new Date(),
    updatedAt: new Date(),
    isFeatured: false,
    isPublished: true,
    lessonsCount: 120,
  },
  {
    id: "5",
    title: "Digital Marketing Fundamentals",
    description: "Master digital marketing strategies and techniques",
    instructorId: "inst5",
    instructorName: "Lisa Thompson",
    category: "marketing",
    level: "beginner",
    duration: 525,
    price: 0,
    thumbnail: "https://picsum.photos/seed/course5/400/225",
    enrolledCount: 18000,
    rating: 4.5,
    totalReviews: 1890,
    createdAt: new Date(),
    updatedAt: new Date(),
    isFeatured: false,
    isPublished: true,
    lessonsCount: 52,
  },
  {
    id: "6",
    title: "Adobe Photoshop CC Course",
    description: "Complete Photoshop masterclass for designers",
    instructorId: "inst6",
    instructorName: "James Miller",
    category: "design",
    level: "beginner",
    duration: 920,
    price: 59.99,
    thumbnail: "https://picsum.photos/seed/course6/400/225",
    enrolledCount: 12000,
    rating: 4.6,
    totalReviews: 3200,
    createdAt: new Date(),
    updatedAt: new Date(),
    isFeatured: false,
    isPublished: true,
    lessonsCount: 95,
  },
];

import { useAuth } from "@/src/context/AuthContext";
import EnrollmentService from "@/src/services/EnrollmentService";
import { useEffect } from "react";

interface ContinueLearning {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  progress: number;
}

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<CourseFilter>({});
  const [continueLearning, setContinueLearning] = useState<ContinueLearning[]>(
    [],
  );
  const colorScheme = "light";

  useEffect(() => {
    if (user) {
      loadContinueLearning();
    } else {
      setContinueLearning([]);
    }
  }, [user]);

  const loadContinueLearning = async () => {
    try {
      const data = await EnrollmentService.getContinueLearning(user!.uid);
      setContinueLearning(data);
    } catch (error) {
      console.error("Error loading continue learning:", error);
    }
  };

  // Use the useCourses hook - but fall back to sample data for demo
  const {
    courses,
    featuredCourses,
    popularCourses,
    categories,
    loading,
    loadingMore,
    error,
    hasMore,
    filter,
    refresh,
    setFilter,
    setSearchQuery: setFirebaseSearchQuery,
  } = useCourses();

  // Use sample data for demo purposes (remove in production)
  const displayFeaturedCourses =
    featuredCourses.length > 0 ? featuredCourses : SAMPLE_FEATURED_COURSES;
  const displayPopularCourses =
    popularCourses.length > 0 ? popularCourses : SAMPLE_POPULAR_COURSES;
  const displayCategories =
    categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      setCurrentFilter({});
      setFilter({});
    } else {
      const newFilter = { ...currentFilter, category: categoryId };
      setCurrentFilter(newFilter);
      setFilter(newFilter);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setFirebaseSearchQuery(text);
  };

  const handleFilterApply = (newFilter: CourseFilter) => {
    setCurrentFilter(newFilter);
    setFilter(newFilter);
  };

  const handleCoursePress = (course: Course) => {
    router.push(`/course/${course.id}`);
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

  const renderFeaturedItem = ({ item }: { item: Course }) => (
    <FeaturedCourseCard
      title={item.title}
      instructor={item.instructorName}
      rating={item.rating}
      students={item.enrolledCount}
      price={formatPrice(item.price)}
      badge={item.isFeatured ? "Featured" : undefined}
      image={item.thumbnail}
      onPress={() => handleCoursePress(item)}
    />
  );

  const renderPopularItem = ({ item }: { item: Course }) => (
    <View style={styles.popularCardWrapper}>
      <CourseCard
        title={item.title}
        instructor={item.instructorName}
        rating={item.rating}
        reviews={item.totalReviews}
        price={formatPrice(item.price)}
        duration={formatDuration(item.duration)}
        lessons={item.lessonsCount}
        image={item.thumbnail}
        onPress={() => handleCoursePress(item)}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <Text
            style={[
              styles.loadingText,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            Loading courses...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors[colorScheme].background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors[colorScheme].tint}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.greeting,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              Hello, Welcome back! 👋
            </Text>
            <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
              Let's learn something new today
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors[colorScheme].text}
            />
            <View style={styles.notificationBadge} />
          </Pressable>
          {user && (
            <Pressable
              style={({ pressed }) => [
                styles.notificationButton,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                Alert.alert(
                  "Sign Out",
                  "Are you sure you want to sign out?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Sign Out", 
                      style: "destructive", 
                      onPress: signOut 
                    }
                  ]
                );
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={Colors[colorScheme].text}
              />
            </Pressable>
          )}
        </View>

        {/* Search Bar */}
        <SearchBar
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFilterPress={() => setFilterModalVisible(true)}
        />

        {/* Category Pills */}
        <CategoryPills
          categories={displayCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Featured Courses Section */}
        <SectionHeader
          title="Featured Courses"
          onSeeAllPress={() => router.push("/courses")}
        />
        {displayFeaturedCourses.length > 0 ? (
          <FlatList
            data={displayFeaturedCourses}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        ) : (
          <EmptyState
            icon="book-outline"
            title="No featured courses"
            message="Check back later for featured courses"
          />
        )}

        {/* Popular Courses Section */}
        <SectionHeader
          title="Popular Courses"
          onSeeAllPress={() => router.push("/courses")}
        />
        {displayPopularCourses.length > 0 ? (
          <FlatList
            data={displayPopularCourses}
            renderItem={renderPopularItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.popularList}
          />
        ) : (
          <EmptyState
            icon="book-outline"
            title="No courses found"
            message="Try adjusting your filters"
          />
        )}

        {continueLearning.length > 0 && (
          <>
            <SectionHeader
              title="Continue Learning"
              onSeeAllPress={() => router.push("/courses")}
            />
            <FlatList
              data={continueLearning}
              renderItem={({ item }) => (
                <View style={styles.popularCardWrapper}>
                  <CourseCard
                    title={item.courseTitle}
                    instructor="Your Instructor"
                    rating={4.5}
                    reviews={120}
                    price="₦49,999"
                    duration="12h 30m"
                    lessons={25}
                    progress={item.progress}
                    image={item.courseThumbnail}
                    onPress={() => router.push(`/course/${item.courseId}`)}
                  />
                </View>
              )}
              keyExtractor={(item) => item.courseId}
              scrollEnabled={false}
              contentContainerStyle={styles.popularList}
            />
          </>
        )}

        {/* Extra space at bottom */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filter={currentFilter}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    ...(("web" as any) === "web"
      ? { boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }
      : {}),
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
  },
  pressed: {
    opacity: 0.8,
  },
  featuredList: {
    paddingLeft: 16,
    paddingBottom: 8,
  },
  popularList: {
    paddingHorizontal: 16,
  },
  popularCardWrapper: {
    marginBottom: 0,
  },
  bottomSpacer: {
    height: 20,
  },
});
