import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface FeaturedCourseCardProps {
  title: string;
  instructor: string;
  rating: number;
  students: number;
  price: string;
  image?: string;
  badge?: string;
  progress?: number;
  onPress?: () => void;
}

export default function FeaturedCourseCard({
  title,
  instructor,
  rating,
  students,
  price,
  image,
  badge,
  onPress,
}: FeaturedCourseCardProps) {
  const colorScheme = "light";
  const cardWidth = width - 32;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { width: cardWidth },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {/* Background Image */}
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="play-circle" size={60} color="#fff" />
          </View>
        )}
        {/* Overlay gradient effect */}
        <View style={styles.overlay} />

        {/* Badge */}
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        {/* Progress indicator */}
{/* Progress indicator - pass progress prop for featured courses with progress */}


        {/* Play button */}
        <View style={styles.playButton}>
          <Ionicons name="play" size={24} color="#fff" />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: Colors[colorScheme].text }]}
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.instructor,
            { color: Colors[colorScheme].textSecondary },
          ]}
        >
          {instructor}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={[styles.rating, { color: Colors[colorScheme].text }]}>
              {rating}
            </Text>
          </View>
          <View style={styles.studentsContainer}>
            <Ionicons
              name="people"
              size={14}
              color={Colors[colorScheme].textSecondary}
            />
            <Text
              style={[
                styles.students,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              {students.toLocaleString()} students
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: Colors[colorScheme].tint }]}>
            {price}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  progressIndicator: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircle: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.light.tint + "60",
  },
  progressArc: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    borderTopWidth: 0,
    transform: [{ rotateZ: "0deg" }],
  },
  progressPercent: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.text,
    position: "absolute",
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: "relative",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(108, 99, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  instructor: {
    fontSize: 14,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  rating: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  studentsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  students: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
  },
});
