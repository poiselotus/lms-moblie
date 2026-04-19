"use client";

import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Colors from "../constants/Colors";
import { useAuth } from "../src/context/AuthContext";

export default function RoleRouter() {
  // SSR-safe: Skip render on server
  if (typeof window === "undefined") {
    return null;
  }

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
      }, 100);
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

    const isTabs = pathname?.startsWith("/(tabs)") || pathname === "/";
    const isLogin = pathname === "/login";
    const isVerifyEmail = pathname === "/verify-email";

    if (isTabs || isLogin || isVerifyEmail) return;

    if (!user) {
      navigateSafely("/login");
    } else if (!user.emailVerified) {
      navigateSafely("/verify-email");
    } else if (!user.role) {
      navigateSafely("/select-role");
    } else if (user.role === "student") {
      navigateSafely("/student");
    } else {
      navigateSafely("/instructor");
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
