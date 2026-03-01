import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Colors from "../constants/Colors";
import { useAuth } from "../src/context/AuthContext";

export default function RoleRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.replace("/login");
      } else if (!user.emailVerified) {
        // Email not verified, show verification prompt
        router.replace("/verify-email");
      } else if (!user.profileCompleted) {
        // Profile not completed
        router.replace("/complete-profile");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
});
