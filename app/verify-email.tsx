import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors";
import { useAuth } from "../src/context/AuthContext";

export default function VerifyEmailScreen() {
  const { user, sendVerificationEmail, loading } = useAuth();
  const colorScheme = "light";

  const handleResendEmail = async () => {
    try {
      await sendVerificationEmail();
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: Colors[colorScheme].tint + "20" },
          ]}
        >
          <Ionicons
            name="mail-unread"
            size={48}
            color={Colors[colorScheme].tint}
          />
        </View>

        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
          Verify Your Email
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: Colors[colorScheme].textSecondary },
          ]}
        >
          We've sent a verification email to{"\n"}
          <Text style={{ fontWeight: "600", color: Colors[colorScheme].text }}>
            {user?.email}
          </Text>
        </Text>

        <Text
          style={[
            styles.instructions,
            { color: Colors[colorScheme].textSecondary },
          ]}
        >
          Please check your inbox and click the verification link to activate
          your account.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: Colors[colorScheme].tint },
            pressed && styles.pressed,
          ]}
          onPress={handleResendEmail}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Resend Verification Email"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.signOutButton}
          onPress={() => {
            // Sign out and go back to login
            router.replace("/login");
          }}
        >
          <Text
            style={[
              styles.signOutText,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            Sign Out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  signOutButton: {
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 14,
  },
});
