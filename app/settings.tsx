import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { SettingsSkeleton } from "../components/LoadingSkeleton";
import Colors from "../constants/Colors";
import { useAuth } from "../src/context/AuthContext";
import { useProfile } from "../src/context/ProfileContext";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "pt", name: "Portuguese" },
  { code: "ar", name: "Arabic" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const {
    profile,
    loading,
    updateProfileData,
    updateUserPassword,
    deleteAccount,
  } = useProfile();
  const { signOut } = useAuth();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Preferences state (local)
  const [notifications, setNotifications] = useState(
    profile?.preferences?.notifications ?? true,
  );
  const [darkMode, setDarkMode] = useState(
    profile?.preferences?.darkMode ?? false,
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    profile?.preferences?.language || "en",
  );

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    try {
      await updateProfileData({
        preferences: {
          notifications: value,
          language: profile?.preferences?.language || "en",
          darkMode: profile?.preferences?.darkMode || false,
        },
      });
    } catch {
      setNotifications(!value);
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    try {
      await updateProfileData({
        preferences: {
          notifications: profile?.preferences?.notifications || true,
          language: profile?.preferences?.language || "en",
          darkMode: value,
        },
      });
    } catch {
      setDarkMode(!value);
      Alert.alert("Error", "Failed to update dark mode settings");
    }
  };

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    try {
      await updateProfileData({
        preferences: {
          notifications: profile?.preferences?.notifications || true,
          language: languageCode,
          darkMode: profile?.preferences?.darkMode || false,
        },
      });
      setShowLanguageModal(false);
    } catch {
      setSelectedLanguage(profile?.preferences?.language || "en");
      Alert.alert("Error", "Failed to update language");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      await updateUserPassword(currentPassword, newPassword);
      Alert.alert("Success", "Password changed successfully!");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      Alert.alert("Error", message);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      Alert.alert("Error", "Please type DELETE to confirm");
      return;
    }

    try {
      await deleteAccount(deletePassword);
      Alert.alert("Account Deleted", "Your account has been deleted");
      signOut();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete account";
      Alert.alert("Error", message);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find((l) => l.code === code)?.name || "English";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SettingsSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/profile")}
            >
              <Text style={styles.settingLabel}>Edit Profile</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowPasswordModal(true)}
            >
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={(val) => { handleNotificationsToggle(val); }}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.tint + "80",
                }}
                thumbColor={notifications ? Colors.light.tint : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={(val) => { handleDarkModeToggle(val); }}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.tint + "80",
                }}
                thumbColor={darkMode ? Colors.light.tint : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={styles.settingLabel}>Language</Text>
              <View style={styles.settingValue}>
                <Text style={styles.settingValueText}>
                  {getLanguageName(selectedLanguage)}
                </Text>
                <Text style={styles.settingArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>

            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Help Center</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Contact Us</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: Colors.light.secondary }]}
            >
              Danger Zone
            </Text>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => setShowDeleteModal(true)}
            >
              <Text
                style={[styles.settingLabel, { color: Colors.light.secondary }]}
              >
                Delete Account
              </Text>
              <Text
                style={[styles.settingArrow, { color: Colors.light.secondary }]}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>

        {/* Change Password Modal */}
        <Modal
          visible={showPasswordModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change Password</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Current Password"
                placeholderTextColor={Colors.light.textSecondary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />

              <TextInput
                style={styles.modalInput}
                placeholder="New Password"
                placeholderTextColor={Colors.light.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Confirm New Password"
                placeholderTextColor={Colors.light.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.modalConfirmText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Language Modal */}
        <Modal
          visible={showLanguageModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Language</Text>

              <ScrollView style={styles.languageList}>
                {LANGUAGES.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageItem,
                      selectedLanguage === language.code &&
                        styles.languageItemSelected,
                    ]}
                    onPress={() => handleLanguageSelect(language.code)}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        selectedLanguage === language.code &&
                          styles.languageTextSelected,
                      ]}
                    >
                      {language.name}
                    </Text>
                    {selectedLanguage === language.code && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          visible={showDeleteModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text
                style={[styles.modalTitle, { color: Colors.light.secondary }]}
              >
                Delete Account
              </Text>

              <Text style={styles.deleteWarning}>
                This action is irreversible. All your data will be permanently
                deleted.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Enter your password"
                placeholderTextColor={Colors.light.textSecondary}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
              />

              <TextInput
                style={styles.modalInput}
                placeholder='Type "DELETE" to confirm'
                placeholderTextColor={Colors.light.textSecondary}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmButton,
                    { backgroundColor: Colors.light.secondary },
                  ]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.modalConfirmText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  section: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    padding: 16,
    paddingBottom: 8,
    textTransform: "uppercase",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValueText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginRight: 8,
  },
  settingArrow: {
    fontSize: 20,
    color: Colors.light.textSecondary,
  },
  signOutButton: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  signOutText: {
    color: Colors.light.secondary,
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    color: Colors.light.textSecondary,
    fontSize: 12,
    marginTop: 16,
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    marginRight: 8,
    alignItems: "center",
  },
  modalCancelText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
    marginLeft: 8,
    alignItems: "center",
  },
  modalConfirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  languageItemSelected: {
    backgroundColor: Colors.light.tint + "10",
  },
  languageText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  languageTextSelected: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
  checkmark: {
    color: Colors.light.tint,
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteWarning: {
    fontSize: 14,
    color: Colors.light.secondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
});
