import { Ionicons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { Link, router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FormInput from "../../components/FormInput";
import { useAuth } from "../../src/context/AuthContext";
import { useDebounce } from "../../src/hooks/useDebounce";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { signUp } = useAuth();
  const netInfo = useNetInfo();
  const colorScheme = "light";

  const handleSubmit = useCallback(async () => {
    if (!netInfo.isConnected) {
      Alert.alert("No Internet", "Please check your connection and try again.");
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);
    setLoading(true);

    try {
      console.log("Starting signup for:", email);
      await Promise.race([
        signUp(email.trim(), password, name.trim(), role),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 30000),
        ),
      ]);

      Alert.alert("Success", "Account created! Check your email to verify.", [
        { text: "OK", onPress: () => router.push("/verify-email") },
      ]);
    } catch (error: any) {
      console.error("Signup error:", error);
      const message = error.message || "Signup failed";
      Alert.alert("Signup Error", message);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }, [email, password, name, role, netInfo.isConnected, signUp]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (!validatePassword(password))
      newErrors.password = "Password must be 6+ characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const debouncedSubmit = useDebounce(handleSubmit, 500);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              elevation: 2,
              boxShadow:
                Platform.OS === "web"
                  ? "0px 2px 4px rgba(0,0,0,0.1)"
                  : undefined,
              shadowColor: Platform.OS !== "web" ? "#000" : undefined,
              shadowOffset:
                Platform.OS !== "web" ? { width: 0, height: 2 } : undefined,
              shadowOpacity: Platform.OS !== "web" ? 0.1 : undefined,
              shadowRadius: Platform.OS !== "web" ? 4 : undefined,
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join LMS to start learning</Text>

        <FormInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          iconName="person-outline"
          error={errors.name}
          autoCapitalize="words"
        />

        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          iconName="mail-outline"
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          iconName="lock-closed-outline"
          error={errors.password}
          secureTextEntry
        />

        <FormInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          iconName="lock-closed-outline"
          error={errors.confirmPassword}
          secureTextEntry
        />

        <Text style={styles.roleLabel}>I want to:</Text>
        <View style={styles.roleContainer}>
          <Pressable
            style={[
              styles.roleButton,
              role === "student" && styles.roleButtonActive,
            ]}
            onPress={() => setRole("student")}
          >
            <Ionicons name="school" size={24} color="#666" />
            <Text style={styles.roleText}>Learn as Student</Text>
          </Pressable>
          <Pressable
            style={[
              styles.roleButton,
              role === "instructor" && styles.roleButtonActive,
            ]}
            onPress={() => setRole("instructor")}
          >
            <Ionicons name="videocam" size={24} color="#666" />
            <Text style={styles.roleText}>Teach as Instructor</Text>
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.submitButton,
            (submitting || loading) && styles.submitButtonDisabled,
          ]}
          onPress={debouncedSubmit}
          disabled={submitting || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
          )}
        </Pressable>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <Link href="/login" asChild>
            <Pressable>
              <Text style={styles.signInLink}>Sign In</Text>
            </Pressable>
          </Link>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: "#6C63FF",
    borderColor: "#6C63FF",
  },
  roleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  signInText: {
    fontSize: 14,
    color: "#666",
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6C63FF",
  },
});
