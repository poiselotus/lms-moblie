import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface CourseCardProps {
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: string;
  image?: string;
  duration?: string;
  lessons?: number;
  progress?: number;
  onPress?: () => void;
}

export default function CourseCard({
  title,
  instructor,
  rating,
  reviews,
  price,
  image,
  duration,
  lessons,
  onPress,
}: CourseCardProps) {
  const colorScheme = "light"; // You can make this dynamic with useColorScheme

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: Colors[colorScheme].card },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <View style={styles.progressContainer}>
          {/* Progress bar placeholder - install react-native-progress if needed */}
        </View>
        {image ? (
          <Image source={{ uri: image }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Ionicons
              name="play-circle"
              size={40}
              color={Colors[colorScheme].tint}
            />
          </View>
        )}
        {duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        )}
        {/* Progress overlay - pass progress prop when available */}
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
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={[styles.rating, { color: Colors[colorScheme].text }]}>
              {rating}
            </Text>
            <Text
              style={[
                styles.reviews,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              ({reviews})
            </Text>
          </View>

          {/* Lessons count */}
          {lessons && (
            <View style={styles.lessonsContainer}>
              <Ionicons
                name="play-outline"
                size={12}
                color={Colors[colorScheme].textSecondary}
              />
              <Text
                style={[
                  styles.lessons,
                  { color: Colors[colorScheme].textSecondary },
                ]}
              >
                {lessons} lessons
              </Text>
            </View>
          )}
        </View>

        {/* Price */}
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
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    ...(('web' as any) === 'web' ? { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' } : {}),
  },
  progressContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    zIndex: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  thumbnailContainer: {
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderThumbnail: {
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructor: {
    fontSize: 13,
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
    marginRight: 12,
  },
  rating: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    marginLeft: 2,
  },
  lessonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessons: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginRight: 6,
    overflow: "hidden",
  },
  progressBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: Colors.light.tint,
  },
  progressText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
});
