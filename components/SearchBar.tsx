import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
}

export default function SearchBar({
  placeholder = "Search courses...",
  value,
  onChangeText,
  onFilterPress,
}: SearchBarProps) {
  const colorScheme = "light";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: Colors[colorScheme].card },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={Colors[colorScheme].textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text }]}
          placeholder={placeholder}
          placeholderTextColor={Colors[colorScheme].textSecondary}
          value={value}
          onChangeText={onChangeText}
        />
        {value && value.length > 0 && (
          <Pressable onPress={() => onChangeText?.("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={Colors[colorScheme].textSecondary}
            />
          </Pressable>
        )}
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.filterButton,
          { backgroundColor: Colors[colorScheme].tint },
          pressed && styles.pressed,
        ]}
        onPress={onFilterPress}
      >
        <Ionicons name="options" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
