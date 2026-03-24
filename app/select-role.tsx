import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors";
import { db } from "../src/config/firebase";
import { useAuth } from "../src/context/AuthContext";

export default function SelectRoleScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async (role: "student" | "instructor") => {
    if (!user) return;

    setLoading(true);
    try {
      // Update user document
      await updateDoc(doc(db, "users", user.uid), {
        role,
        profileCompleted: true,
      });

      // Update local state
      updateUserProfile({ role, profileCompleted: true });

      // Navigate to dashboard
      if (role === "student") {
        router.replace("/student");
      } else {
        router.replace("/instructor");
      }
    } catch (error) {
      console.error("Role update error:", error);
      Alert.alert("Error", "Failed to save role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="help-circle-outline"
        size={80}
        color={Colors.light.tint}
        style={styles.icon}
      />

      <Text style={styles.title}>Select Your Role</Text>
      <Text style={styles.subtitle}>
        Choose how you want to use this platform
      </Text>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.button, styles.studentButton]}
          onPress={() => handleSelectRole("student")}
          disabled={loading}
        >
          <Ionicons name="school" size={48} color="white" />
          <Text style={styles.buttonTitle}>Student</Text>
          <Text style={styles.buttonSubtitle}>
            Learn new skills and courses
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.instructorButton]}
          onPress={() => handleSelectRole("instructor")}
          disabled={loading}
        >
          <Ionicons name="videocam" size={48} color="white" />
          <Text style={styles.buttonTitle}>Instructor</Text>
          <Text style={styles.buttonSubtitle}>Create and teach courses</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#F8F9FA",
  },
  icon: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 48,
    color: "#6B7280",
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 20,
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  studentButton: {
    backgroundColor: "#3B82F6",
  },
  instructorButton: {
    backgroundColor: "#10B981",
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
});
