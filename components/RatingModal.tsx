import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/Colors";
import { useAuth } from "../src/context/AuthContext";
import RatingService from "../src/services/RatingService";

interface RatingModalProps {
  visible: boolean;
  courseId: string;
  courseName: string;
  onClose: () => void;
  onSubmit?: () => void;
}

export default function RatingModal({
  visible,
  courseId,
  courseName,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingRating, setExistingRating] = useState<number | null>(null);

  useEffect(() => {
    if (visible && user?.uid) {
      loadExistingRating();
    }
  }, [visible, user, courseId]);

  const loadExistingRating = async () => {
    try {
      const existing = await RatingService.getUserRating(courseId, user!.uid);
      if (existing) {
        setRating(existing.rating);
        setReview(existing.review);
        setExistingRating(existing.rating);
      }
    } catch (err) {
      console.error("Error loading existing rating:", err);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await RatingService.submitRating(
        courseId,
        user!.uid,
        user!.displayName || "Anonymous",
        rating,
        review,
      );

      if (onSubmit) {
        onSubmit();
      }

      // Reset and close
      setRating(0);
      setReview("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview("");
    setError(null);
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoverRating || rating);
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          onPressIn={() => setHoverRating(i)}
          onPressOut={() => setHoverRating(0)}
          style={styles.starButton}
        >
          <Ionicons
            name={isFilled ? "star" : "star-outline"}
            size={40}
            color={isFilled ? "#F59E0B" : Colors.light.border}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Tap to rate";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {existingRating ? "Update Your Rating" : "Rate This Course"}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            {/* Course Name */}
            <Text style={styles.courseName}>{courseName}</Text>

            {/* Stars */}
            <View style={styles.starsContainer}>
              <View style={styles.starsRow}>{renderStars()}</View>
              <Text style={styles.ratingText}>{getRatingText()}</Text>
            </View>

            {/* Review Input */}
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewLabel}>
                {existingRating
                  ? "Update your review (optional)"
                  : "Write a review (optional)"}
              </Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience with this course..."
                placeholderTextColor={Colors.light.textSecondary}
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{review.length}/500</Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color="#EF4444"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {existingRating ? "Update Rating" : "Submit Rating"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Skip Button */}
            {!existingRating && (
              <TouchableOpacity style={styles.skipButton} onPress={handleClose}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  courseName: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  starsContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  reviewContainer: {
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600",
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});
