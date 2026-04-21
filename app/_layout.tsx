import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

<<<<<<< Updated upstream
// Separate component to handle conditional routing
function RootLayoutContent() {
  const { user, loading } = useAuth();
=======
import useColorScheme from '@/hooks/useColorScheme';
import { AuthProvider } from "../src/context/AuthContext";
import { ProfileProvider } from "../src/context/ProfileContext";
>>>>>>> Stashed changes

  console.log("🎯 RootLayoutContent - loading:", loading, "user:", user?.email);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Use conditional groups - ONLY ONE navigator renders at a time
  if (user) {
    console.log("🎯 User logged in - showing tabs");
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="tabs" />
      </Stack>
    );
  }

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
