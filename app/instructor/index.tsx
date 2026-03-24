import Colors from "@/constants/Colors";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InstructorDashboard() {
  const colorScheme = useColorScheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <Ionicons
        name="school-outline"
        size={80}
        color={Colors[colorScheme ?? "light"].tint}
      />
      <Text
        style={[styles.title, { color: Colors[colorScheme ?? "light"].text }]}
      >
        Instructor Dashboard
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: Colors[colorScheme ?? "light"].textSecondary },
        ]}
      >
        Manage your courses, students, and analytics here
      </Text>
      <Text style={styles.comingSoon}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  comingSoon: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
