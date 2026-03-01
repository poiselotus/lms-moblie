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

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { signUp } = useAuth();
  const colorScheme = "light";

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim(), role);
      Alert.alert(
        "Success",
        "Account created! Please check your email to verify your account.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
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
            Create Account
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            Join us and start learning today
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
              Full Name
            </Text>
            <View
              style={[styles.inputWrapper, errors.name && styles.inputError]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors[colorScheme].textSecondary}
              />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Enter your full name"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

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
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
              Password
            </Text>
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
                placeholder="Create a password"
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
              Confirm Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                errors.confirmPassword && styles.inputError,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors[colorScheme].textSecondary}
              />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Confirm your password"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Role Selection */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
              I want to
            </Text>
            <View style={styles.roleContainer}>
              <Pressable
                style={[
                  styles.roleButton,
                  role === "student" && {
                    backgroundColor: Colors[colorScheme].tint,
                  },
                ]}
                onPress={() => setRole("student")}
              >
                <Ionicons
                  name="school"
                  size={24}
                  color={
                    role === "student"
                      ? "#fff"
                      : Colors[colorScheme].textSecondary
                  }
                />
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        role === "student" ? "#fff" : Colors[colorScheme].text,
                    },
                  ]}
                >
                  Learn
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.roleButton,
                  role === "instructor" && {
                    backgroundColor: Colors[colorScheme].tint,
                  },
                ]}
                onPress={() => setRole("instructor")}
              >
                <Ionicons
                  name="videocam"
                  size={24}
                  color={
                    role === "instructor"
                      ? "#fff"
                      : Colors[colorScheme].textSecondary
                  }
                />
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        role === "instructor"
                          ? "#fff"
                          : Colors[colorScheme].text,
                    },
                  ]}
                >
                  Teach
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Sign Up Button */}
          <Pressable
            style={({ pressed }) => [
              styles.signUpButton,
              { backgroundColor: Colors[colorScheme].tint },
              pressed && styles.pressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
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

          {/* Social Login Buttons (Commented out for future) */}
          {/* 
          <View style={styles.socialContainer}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color="#000" />
            </Pressable>
          </View>
          */}

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text
              style={[
                styles.signInText,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text
                style={[styles.signInLink, { color: Colors[colorScheme].tint }]}
              >
                Sign In
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
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
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
  roleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    gap: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButton: {
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
  signUpButtonText: {
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
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
