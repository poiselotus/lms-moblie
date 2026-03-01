import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Colors from "../constants/Colors";
import { useAuth } from "../src/context/AuthContext";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const { resetPassword } = useAuth();
  const colorScheme = "light";

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    setError("");
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setEmailSent(true);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <View style={styles.successContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors[colorScheme].tint + "20" },
            ]}
          >
            <Ionicons name="mail" size={40} color={Colors[colorScheme].tint} />
          </View>
          <Text
            style={[styles.successTitle, { color: Colors[colorScheme].text }]}
          >
            Check Your Email
          </Text>
          <Text
            style={[
              styles.successText,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            We've sent a password reset link to{"\n"}
            <Text
              style={{ fontWeight: "600", color: Colors[colorScheme].text }}
            >
              {email}
            </Text>
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: Colors[colorScheme].tint },
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors[colorScheme].text}
            />
          </Pressable>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors[colorScheme].tint + "20" },
            ]}
          >
            <Ionicons
              name="lock-closed"
              size={32}
              color={Colors[colorScheme].tint}
            />
          </View>
          <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
            Forgot Password?
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            Enter your email address and we'll send you a link to reset your
            password
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
              Email
            </Text>
            <View style={[styles.inputWrapper, error && styles.inputError]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors[colorScheme].textSecondary}
              />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Enter your email"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Reset Button */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: Colors[colorScheme].tint },
              pressed && styles.pressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </Pressable>

          {/* Back to Login */}
          <Pressable
            style={styles.backLinkContainer}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={16}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.backLinkText, { color: Colors[colorScheme].tint }]}
            >
              Back to Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    height: "100%",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  backLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
});
