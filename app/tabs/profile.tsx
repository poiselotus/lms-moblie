import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
  const { user, updateUserProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // profile, notifications, language

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to sign out?")) {
        await signOut();
        router.replace("/login");
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/login");
          },
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Settings</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "profile" && styles.activeTab]}
          onPress={() => setActiveTab("profile")}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color={activeTab === "profile" ? "#8B5CF6" : "#6B7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "profile" && styles.activeTabText,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "notifications" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("notifications")}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={activeTab === "notifications" ? "#8B5CF6" : "#6B7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "notifications" && styles.activeTabText,
            ]}
          >
            Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "language" && styles.activeTab]}
          onPress={() => setActiveTab("language")}
        >
          <Ionicons
            name="language-outline"
            size={22}
            color={activeTab === "language" ? "#8B5CF6" : "#6B7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "language" && styles.activeTabText,
            ]}
          >
            Language
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Tab Content */}
      {activeTab === "profile" && (
        <ProfileTab user={user} updateUserProfile={updateUserProfile} />
      )}

      {/* Notifications Tab Content */}
      {activeTab === "notifications" && (
        <NotificationsTab user={user} updateUserProfile={updateUserProfile} />
      )}

      {/* Language Tab Content */}
      {activeTab === "language" && (
        <LanguageTab user={user} updateUserProfile={updateUserProfile} />
      )}

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Profile Tab Component
function ProfileTab({ user, updateUserProfile }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile({ displayName, bio, phone });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="create-outline" size={18} color="#8B5CF6" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Display Name</Text>
      <Text style={styles.value}>{user?.displayName || "Not set"}</Text>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email}</Text>

      {user?.bio && (
        <>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.value}>{user.bio}</Text>
        </>
      )}

      {user?.phone && (
        <>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user.phone}</Text>
        </>
      )}

      <TouchableOpacity
        style={styles.changePasswordButton}
        onPress={() => router.push("/change-password")}
      >
        <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
        <Text style={styles.changePasswordText}>Change Password</Text>
        <Ionicons name="chevron-forward" size={18} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}

// Notifications Tab Component
function NotificationsTab({ user, updateUserProfile }: any) {
  const [preferences, setPreferences] = useState({
    emailNotifications:
      user?.notificationPreferences?.emailNotifications ?? true,
    pushNotifications: user?.notificationPreferences?.pushNotifications ?? true,
    courseUpdates: user?.notificationPreferences?.courseUpdates ?? true,
    quizReminders: user?.notificationPreferences?.quizReminders ?? true,
  });

  const togglePreference = async (key: string) => {
    const newPrefs = {
      ...preferences,
      [key]: !preferences[key as keyof typeof preferences],
    };
    setPreferences(newPrefs);
    try {
      await updateUserProfile({ notificationPreferences: newPrefs });
      Alert.alert("Success", "Preferences updated");
    } catch (error) {
      Alert.alert("Error", "Failed to update preferences");
    }
  };

  return (
    <View style={styles.card}>
      <NotificationItem
        title="Email Notifications"
        description="Receive email updates about your courses"
        value={preferences.emailNotifications}
        onValueChange={() => togglePreference("emailNotifications")}
      />
      <NotificationItem
        title="Push Notifications"
        description="Get instant notifications on your device"
        value={preferences.pushNotifications}
        onValueChange={() => togglePreference("pushNotifications")}
      />
      <NotificationItem
        title="Course Updates"
        description="New lessons, announcements, and due dates"
        value={preferences.courseUpdates}
        onValueChange={() => togglePreference("courseUpdates")}
      />
      <NotificationItem
        title="Quiz Reminders"
        description="Reminders about upcoming quizzes and deadlines"
        value={preferences.quizReminders}
        onValueChange={() => togglePreference("quizReminders")}
      />
    </View>
  );
}

// Language Tab Component
function LanguageTab({ user, updateUserProfile }: any) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    user?.language || "en",
  );

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "de", name: "German", nativeName: "Deutsch" },
  ];

  const handleLanguageChange = async (code: string) => {
    setSelectedLanguage(code);
    try {
      await updateUserProfile({ language: code });
      Alert.alert("Success", "Language preference updated");
    } catch (error) {
      Alert.alert("Error", "Failed to update language preference");
    }
  };

  return (
    <View style={styles.card}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={styles.languageItem}
          onPress={() => handleLanguageChange(lang.code)}
        >
          <View style={styles.languageInfo}>
            <Text style={styles.languageName}>{lang.name}</Text>
            <Text style={styles.languageNative}>{lang.nativeName}</Text>
          </View>
          {selectedLanguage === lang.code && (
            <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Notification Item Component
function NotificationItem({ title, description, value, onValueChange }: any) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationInfo}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E7EB", true: "#8B5CF6" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { padding: 24, backgroundColor: "#8B5CF6", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: { backgroundColor: "#F3E8FF" },
  tabText: { fontSize: 14, color: "#6B7280" },
  activeTabText: { color: "#8B5CF6", fontWeight: "500" },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  profileHeader: { alignItems: "center", marginBottom: 20 },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  editButtonText: { color: "#8B5CF6", fontSize: 14, fontWeight: "500" },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 4,
  },
  value: { fontSize: 16, color: "#1F2937" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: { color: "#6B7280", fontWeight: "500" },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#8B5CF6",
  },
  saveButtonText: { color: "#FFFFFF", fontWeight: "500" },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  changePasswordText: { flex: 1, fontSize: 16, color: "#1F2937" },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  notificationInfo: { flex: 1, marginRight: 16 },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  notificationDescription: { fontSize: 13, color: "#6B7280" },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  languageInfo: { flex: 1 },
  languageName: { fontSize: 16, fontWeight: "500", color: "#1F2937" },
  languageNative: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  signOutButton: {
    flexDirection: "row",
    margin: 24,
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  signOutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
