import { router } from "expo-router";
import { signOut as firebaseSignOut, getAuth } from "firebase/auth";
import {
  Alert,
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

  const handleSignOut = () => {
    console.log("1️⃣ Sign out button pressed");
    console.log("2️⃣ signOut function exists?", typeof signOut);

    // FIXED: Use confirm() for web, Alert for native
    if (typeof window !== "undefined" && window.confirm) {
      // Web fallback
      const confirmed = window.confirm("Are you sure you want to sign out?");
      console.log("3️⃣ Web confirm result:", confirmed);
      if (confirmed) {
        performSignOut();
      }
    } else {
      // Native Alert
      Alert.alert("Sign Out", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            console.log("3️⃣ Alert onPress triggered");
            performSignOut();
          },
        },
      ]);
    }
  };

  const performSignOut = async () => {
    console.log("4️⃣ Starting sign out process");
    try {
      console.log("5️⃣ Calling context signOut...");
      await signOut();
      console.log("6️⃣ Context signOut completed");
      console.log("7️⃣ Navigating to login...");
      router.replace("/login");
    } catch (contextError) {
      console.error("8️⃣ Context signOut failed:", contextError);
      console.log("9️⃣ Trying direct Firebase signOut...");
      try {
        const auth = getAuth();
        await firebaseSignOut(auth);
        console.log("🔟 Direct Firebase signOut successful");
        localStorage.removeItem("lms_user_data");
        router.replace("/login");
      } catch (firebaseError) {
        console.error("1️⃣1️⃣ Both signOut methods failed:", firebaseError);
        alert("Failed to sign out. Please restart the app.");
      }
    }
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
