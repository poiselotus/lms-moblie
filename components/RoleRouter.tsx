import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Colors from "../constants/Colors";
import { useAuth } from "../src/context/AuthContext";

export default function RoleRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateSafely = useCallback(
    (path: string) => {
      if (isNavigating || pathname === path) return;

      setIsNavigating(true);
      console.log(`→ Debounced redirect to ${path}`);

      setTimeout(() => {
        router.replace(path as any);
        setIsNavigating(false);
      }, 500);
    },
    [isNavigating, pathname, router],
  );

  useEffect(() => {
    if (loading || isNavigating) return;

    console.log("RoleRouter state:", {
      user: user?.uid,
      verified: user?.emailVerified,
      pathname,
    });

    if (pathname?.startsWith("/(tabs)") || pathname === "/") return;

    if (!user) {
      navigateSafely("/login");
    } else if (!user.emailVerified) {
      navigateSafely("/verify-email");
    } else {
      navigateSafely("/(tabs)");
    }
  }, [user?.uid, user?.emailVerified, loading, navigateSafely]);

  if (loading || isNavigating) {
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
