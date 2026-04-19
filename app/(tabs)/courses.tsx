import Colors from "@/constants/Colors";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function CoursesScreen() {
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
        Courses
      </Text>
      <Text
        style={{
          color: Colors[colorScheme ?? "light"].textSecondary,
          padding: 20,
        }}
      >
        Courses list coming soon.{" "}
        <Link href="/(tabs)/index">
          <Text style={{ color: Colors[colorScheme ?? "light"].tint }}>
            Go Home
          </Text>
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
