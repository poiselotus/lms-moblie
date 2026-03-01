import Colors from "@/constants/Colors";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface Category {
  id: string;
  name: string;
}

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryPills({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  const colorScheme = "light";

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedCategory;
          return (
            <Pressable
              key={category.id}
              style={({ pressed }) => [
                styles.pill,
                isSelected
                  ? { backgroundColor: Colors[colorScheme].tint }
                  : { backgroundColor: Colors[colorScheme].card },
                pressed && styles.pressed,
              ]}
              onPress={() => onSelectCategory(category.id)}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected
                      ? "#fff"
                      : Colors[colorScheme].textSecondary,
                  },
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
