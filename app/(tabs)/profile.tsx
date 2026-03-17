import Colors from "@/constants/Colors";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <Text
        style={[styles.title, { color: Colors[colorScheme ?? "light"].text }]}
      >
        Profile
      </Text>
      <Ionicons
        name="person-circle-outline"
        size={100}
        color={Colors[colorScheme ?? "light"].textSecondary}
      />
      <Text
        style={[
          styles.subtitle,
          { color: Colors[colorScheme ?? "light"].textSecondary },
        ]}
      >
        Coming Soon
      </Text>
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
  },
});
