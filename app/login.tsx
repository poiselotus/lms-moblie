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

import { Redirect } from "expo-router";

export default function LoginScreen() {
  const { user, loading: authLoading } = useAuth();

  // If already logged in, redirect to tabs
  if (!authLoading && user) {
    return <Redirect href="/tabs" />;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { signIn, signInWithGoogle } = useAuth();
  const colorScheme = "light";

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    console.log("1️⃣ Sign In button pressed");
    console.log("2️⃣ Email:", email);
    console.log("3️⃣ Password length:", password.length);

    const isValid = validateForm();
    console.log("4️⃣ Form valid:", isValid);

    if (!isValid) {
      console.log("5️⃣ Form validation failed");
      return;
    }

    console.log("6️⃣ Setting loading to true");
    setLoading(true);

    try {
      console.log("7️⃣ Calling signIn with:", email.trim());
      await signIn(email.trim(), password);
      console.log("8️⃣ Sign in successful - should navigate");
    } catch (error: any) {
      console.error("9️⃣ Sign in error:", error.message);
      Alert.alert("Error", error.message);
    } finally {
      console.log("🔟 Setting loading to false");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("🟢 Google sign in pressed");
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("🟡 Google sign in error:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  const handleForgotPassword = () => {
    console.log("🔗 Forgot password pressed");
    router.push("/forgot-password");
  };

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
          <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
            Welcome Back
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            Sign in to continue your learning journey
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
              Email
            </Text>
            <View
              style={[styles.inputWrapper, errors.email && styles.inputError]}
            >
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
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
                Password
              </Text>
              <Pressable onPress={handleForgotPassword}>
                <Text
                  style={[
                    styles.forgotText,
                    { color: Colors[colorScheme].tint },
                  ]}
                >
                  Forgot Password?
                </Text>
              </Pressable>
            </View>
            <View
              style={[
                styles.inputWrapper,
                errors.password && styles.inputError,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors[colorScheme].textSecondary}
              />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Enter your password"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors[colorScheme].textSecondary}
                />
              </Pressable>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Sign In Button */}
          <Pressable
            style={({ pressed }) => [
              styles.signInButton,
              { backgroundColor: Colors[colorScheme].tint },
              pressed && styles.pressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: Colors[colorScheme].border },
              ]}
            />
            <Text
              style={[
                styles.dividerText,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              or continue with
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: Colors[colorScheme].border },
              ]}
            />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <Pressable style={styles.socialButton} onPress={handleGoogleSignIn}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text
              style={[
                styles.signUpText,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/signup")}>
              <Text
                style={[styles.signUpLink, { color: Colors[colorScheme].tint }]}
              >
                Sign Up
              </Text>
            </Pressable>
          </View>
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
    marginBottom: 32,
  },
  backButton: {
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "500",
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
  signInButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
