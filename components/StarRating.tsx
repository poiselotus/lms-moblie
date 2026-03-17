import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  showCount?: number;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  color = "#F59E0B",
  emptyColor = "#E5E7EB",
  showCount,
}: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < maxRating; i++) {
    if (i < fullStars) {
      stars.push(<Ionicons key={i} name="star" size={size} color={color} />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Ionicons key={i} name="star-half" size={size} color={color} />,
      );
    } else {
      stars.push(
        <Ionicons key={i} name="star-outline" size={size} color={emptyColor} />,
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.stars}>{stars}</View>
      {showCount !== undefined && (
        <View style={styles.countContainer}>
          <Ionicons name="people-outline" size={14} color="#6B7280" />
          <View style={styles.countText}>
            {/* Rating count would go here */}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  stars: {
    flexDirection: "row",
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  countText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6B7280",
  },
});
