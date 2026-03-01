import CategoryPills from "@/components/CategoryPills";
import CourseCard from "@/components/CourseCard";
import FeaturedCourseCard from "@/components/FeaturedCourseCard";
import SearchBar from "@/components/SearchBar";
import SectionHeader from "@/components/SectionHeader";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Sample data
const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "development", name: "Development" },
  { id: "design", name: "Design" },
  { id: "business", name: "Business" },
  { id: "marketing", name: "Marketing" },
  { id: "photography", name: "Photography" },
  { id: "music", name: "Music" },
];

const FEATURED_COURSES = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp 2024",
    instructor: "Sarah Johnson",
    rating: 4.8,
    students: 12500,
    price: "$89.99",
    badge: "Bestseller",
  },
  {
    id: "2",
    title: "UI/UX Design Masterclass",
    instructor: "Michael Chen",
    rating: 4.9,
    students: 8200,
    price: "$79.99",
    badge: "New",
  },
];

const POPULAR_COURSES = [
  {
    id: "1",
    title: "React Native: Build Mobile Apps",
    instructor: "Emily Davis",
    rating: 4.7,
    reviews: 2340,
    price: "$69.99",
    duration: "12h 30m",
    lessons: 85,
  },
  {
    id: "2",
    title: "Python for Data Science",
    instructor: "Dr. Andrew Wilson",
    rating: 4.8,
    reviews: 5600,
    price: "$94.99",
    duration: "20h 15m",
    lessons: 120,
  },
  {
    id: "3",
    title: "Digital Marketing Fundamentals",
    instructor: "Lisa Thompson",
    rating: 4.5,
    reviews: 1890,
    price: "Free",
    duration: "8h 45m",
    lessons: 52,
  },
  {
    id: "4",
    title: "Adobe Photoshop CC Course",
    instructor: "James Miller",
    rating: 4.6,
    reviews: 3200,
    price: "$59.99",
    duration: "15h 20m",
    lessons: 95,
  },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = "light";

  const renderFeaturedItem = ({
    item,
  }: {
    item: (typeof FEATURED_COURSES)[0];
  }) => (
    <FeaturedCourseCard
      title={item.title}
      instructor={item.instructor}
      rating={item.rating}
      students={item.students}
      price={item.price}
      badge={item.badge}
      onPress={() => console.log("Featured course pressed:", item.id)}
    />
  );

  const renderPopularItem = ({
    item,
  }: {
    item: (typeof POPULAR_COURSES)[0];
  }) => (
    <View style={styles.popularCardWrapper}>
      <CourseCard
        title={item.title}
        instructor={item.instructor}
        rating={item.rating}
        reviews={item.reviews}
        price={item.price}
        duration={item.duration}
        lessons={item.lessons}
        onPress={() => console.log("Course pressed:", item.id)}
      />
    </View>
  );

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
        </View>

        {/* Search Bar */}
        <SearchBar
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => console.log("Filter pressed")}
        />

        {/* Category Pills */}
        <CategoryPills
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Featured Courses Section */}
        <SectionHeader
          title="Featured Courses"
          onSeeAllPress={() => console.log("See all featured")}
        />
        <FlatList
          data={FEATURED_COURSES}
          renderItem={renderFeaturedItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        />

        {/* Popular Courses Section */}
        <SectionHeader
          title="Popular Courses"
          onSeeAllPress={() => console.log("See all popular")}
        />
        <FlatList
          data={POPULAR_COURSES}
          renderItem={renderPopularItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.popularList}
        />

        {/* Extra space at bottom */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    position: "relative",
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
