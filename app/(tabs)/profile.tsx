import { router } from "expo-router";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const userRole = user?.role || "Student";

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/login");
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.displayName || "Not set"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{userRole}</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { padding: 24, backgroundColor: "#8B5CF6" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 5,
    boxShadow:
      Platform.OS === "web" ? "0px 2px 4px rgba(0,0,0,0.1)" : undefined,
    shadowColor: Platform.OS !== "web" ? "#000" : undefined,
    shadowOffset: Platform.OS !== "web" ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS !== "web" ? 0.25 : undefined,
    shadowRadius: Platform.OS !== "web" ? 3.84 : undefined,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 4,
  },
  value: { fontSize: 16, color: "#1F2937" },
  signOutButton: {
    marginTop: 24,
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  signOutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
