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
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    console.log("🔴 SIGN OUT BUTTON PRESSED");

    // Use window.confirm for web, Alert for native
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to sign out?");
      console.log("🔴 Web confirm result:", confirmed);
      if (confirmed) {
        performSignOut();
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: performSignOut,
        },
      ]);
    }
  };

  const performSignOut = async () => {
    console.log("🔴 PERFORMING SIGN OUT");
    try {
      await signOut();
      console.log("🔴 SIGN OUT SUCCESSFUL");
      router.replace("/login");
    } catch (error) {
      console.error("🔴 SIGN OUT ERROR:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Icon name="person" size={50} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.displayName || "Not set"}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    padding: 24,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#1F2937",
  },
  signOutButton: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
