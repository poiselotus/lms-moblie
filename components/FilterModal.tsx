import Colors from "@/constants/Colors";
import { CourseFilter, CourseLevel } from "@/src/types/course";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filter: CourseFilter;
  onApply: (filter: CourseFilter) => void;
}

const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const PRICE_RANGES = [
  { min: 0, max: 50, label: "Under $50" },
  { min: 50, max: 100, label: "$50 - $100" },
  { min: 100, max: 200, label: "$100 - $200" },
  { min: 200, max: 99999, label: "$200+" },
];

const RATINGS = [
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4.0+" },
  { value: 3.5, label: "3.5+" },
];

export default function FilterModal({
  visible,
  onClose,
  filter,
  onApply,
}: FilterModalProps) {
  const [localFilter, setLocalFilter] = useState<CourseFilter>(filter);

  const handleLevelSelect = (level: CourseLevel) => {
    setLocalFilter((prev) => ({
      ...prev,
      level: prev.level === level ? undefined : level,
    }));
  };

  const handlePriceSelect = (range: { min: number; max: number }) => {
    setLocalFilter((prev) => ({
      ...prev,
      minPrice: prev.minPrice === range.min ? undefined : range.min,
      maxPrice: prev.maxPrice === range.max ? undefined : range.max,
    }));
  };

  const handleRatingSelect = (rating: number) => {
    setLocalFilter((prev) => ({
      ...prev,
      minRating: prev.minRating === rating ? undefined : rating,
    }));
  };

  const handleApply = () => {
    onApply(localFilter);
    onClose();
  };

  const handleReset = () => {
    setLocalFilter({});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Level Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Level</Text>
            <View style={styles.optionsContainer}>
              {LEVELS.map((level) => (
                <Pressable
                  key={level.value}
                  style={[
                    styles.optionButton,
                    localFilter.level === level.value &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => handleLevelSelect(level.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      localFilter.level === level.value &&
                        styles.optionTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.optionsContainer}>
              {PRICE_RANGES.map((range) => (
                <Pressable
                  key={range.label}
                  style={[
                    styles.optionButton,
                    localFilter.minPrice === range.min &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => handlePriceSelect(range)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      localFilter.minPrice === range.min &&
                        styles.optionTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Rating Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <View style={styles.optionsContainer}>
              {RATINGS.map((rating) => (
                <Pressable
                  key={rating.value}
                  style={[
                    styles.optionButton,
                    localFilter.minRating === rating.value &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => handleRatingSelect(rating.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      localFilter.minRating === rating.value &&
                        styles.optionTextActive,
                    ]}
                  >
                    {rating.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  resetText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  optionText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  optionTextActive: {
    color: "#fff",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  applyButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
