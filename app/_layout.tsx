import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

// Separate component to handle conditional routing
function RootLayoutContent() {
  const { user, loading } = useAuth();

  console.log("🎯 RootLayoutContent - loading:", loading, "user:", user?.email);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // If user is logged in, show tabs
  if (user) {
    console.log("🎯 User logged in - showing tabs");
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="tabs" />
        <Stack.Screen name="change-password" />
      </Stack>
    );
  }

  // If not logged in, show auth screens
  console.log("🎯 No user - showing auth screens");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
