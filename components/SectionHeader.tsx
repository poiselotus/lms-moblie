import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  onSeeAllPress?: () => void;
  seeAllText?: string;
}

export default function SectionHeader({
  title,
  onSeeAllPress,
  seeAllText = "See All",
}: SectionHeaderProps) {
  const colorScheme = "light";

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
        {title}
      </Text>
      {onSeeAllPress && (
        <Pressable
          style={({ pressed }) => [
            styles.seeAllButton,
            pressed && styles.pressed,
          ]}
          onPress={onSeeAllPress}
        >
          <Text
            style={[styles.seeAllText, { color: Colors[colorScheme].tint }]}
          >
            {seeAllText}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors[colorScheme].tint}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.6,
  },
});
