import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function CompleteProfileScreen() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { user, updateUserProfile } = useAuth();
  const colorScheme = "light";

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateUserProfile({
        displayName: name.trim(),
        profileCompleted: true,
        // Note: In a real app, you'd also upload avatar to Firebase Storage
      });
      router.replace("/tabs");
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
          <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
            Complete Your Profile
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            Tell us a bit about yourself
          </Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: Colors[colorScheme].tint + "20" },
            ]}
          >
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons
                name="person"
                size={48}
                color={Colors[colorScheme].tint}
              />
            )}
          </View>
          <Pressable
            style={[
              styles.editAvatarButton,
              { backgroundColor: Colors[colorScheme].tint },
            ]}
          >
            <Ionicons name="camera" size={16} color="#fff" />
          </Pressable>
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
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Email (Read-only) */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
              Email
            </Text>
            <View style={[styles.inputWrapper, styles.readOnly]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors[colorScheme].textSecondary}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: Colors[colorScheme].textSecondary },
                ]}
                value={user?.email || ""}
                editable={false}
              />
            </View>
          </View>

          {/* Bio Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
              Bio (Optional)
            </Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={Colors[colorScheme].textSecondary}
                style={{ marginTop: 8 }}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: Colors[colorScheme].text },
                ]}
                placeholder="Tell us about yourself..."
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Complete Button */}
          <Pressable
            style={({ pressed }) => [
              styles.completeButton,
              { backgroundColor: Colors[colorScheme].tint },
              pressed && styles.pressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleCompleteProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.completeButtonText}>Complete Profile</Text>
            )}
          </Pressable>

          {/* Skip for now */}
          <Pressable
            style={styles.skipButton}
            onPress={() => router.replace("/tabs")}
          >
            <Text
              style={[
                styles.skipText,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              Skip for now
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
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
  textAreaWrapper: {
    height: 120,
    alignItems: "flex-start",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  readOnly: {
    backgroundColor: "#F5F5F5",
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    height: "100%",
  },
  textArea: {
    paddingTop: 12,
    height: 100,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  completeButton: {
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
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  skipButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
  },
});
