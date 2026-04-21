import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  console.log("🔴 INDEX PAGE - loading:", loading, "user:", user?.email);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // If user is logged in, go to tabs
  if (user) {
    console.log("🔴 INDEX - User found, redirecting to /tabs");
    return <Redirect href="/tabs" />;
  }

  // If not logged in, go to login
  console.log("🔴 INDEX - No user, redirecting to /login");
  return <Redirect href="/login" />;
}
