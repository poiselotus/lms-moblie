import Colors from "@/constants/Colors";
import { Lesson } from "@/src/types/course";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VideoPlayer from "./VideoPlayer";

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  onProgress?: (position: number) => void;
  initialPosition?: number;
}

export default function LessonPlayer({
  lesson,
  onComplete,
  onNext,
  hasNext,
  onProgress,
  initialPosition = 0,
}: LessonPlayerProps) {
  const handleOpenExternalLink = async () => {
    if (lesson.externalUrl) {
      try {
        await Linking.openURL(lesson.externalUrl);
      } catch (error) {
        console.error("Error opening external link:", error);
      }
    }
  };

  const renderVideoLesson = () => (
    <VideoPlayer
      videoUrl={lesson.videoUrl}
      onProgress={onProgress}
      onComplete={onComplete}
      initialPosition={initialPosition}
      autoPlay={false}
      onNext={onNext}
      hasNext={hasNext}
    />
  );

  const renderTextLesson = () => (
    <ScrollView style={styles.contentScroll}>
      <View style={styles.textContent}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDescription}>{lesson.description}</Text>
        {lesson.content && (
          <Text style={styles.articleContent}>{lesson.content}</Text>
        )}
      </View>
    </ScrollView>
  );

  const renderPDFLesson = () => (
    <View style={styles.pdfContainer}>
      <View style={styles.pdfPlaceholder}>
        <Ionicons name="document-text" size={64} color={Colors.light.tint} />
        <Text style={styles.pdfTitle}>{lesson.title}</Text>
        <Text style={styles.pdfDescription}>
          This lesson contains a PDF document
        </Text>
        {lesson.pdfUrl && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => Linking.openURL(lesson.pdfUrl!)}
          >
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.downloadButtonText}>Download PDF</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderExternalLinkLesson = () => (
    <View style={styles.externalContainer}>
      <View style={styles.externalPlaceholder}>
        <Ionicons name="link" size={64} color={Colors.light.tint} />
        <Text style={styles.externalTitle}>{lesson.title}</Text>
        <Text style={styles.externalDescription}>
          This lesson links to an external resource
        </Text>
        {lesson.externalUrl && (
          <TouchableOpacity
            style={styles.openLinkButton}
            onPress={handleOpenExternalLink}
          >
            <Ionicons name="open-outline" size={20} color="#fff" />
            <Text style={styles.openLinkButtonText}>Open Link</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderLessonContent = () => {
    switch (lesson.lessonType) {
      case "video":
        return renderVideoLesson();
      case "text":
        return renderTextLesson();
      case "pdf":
        return renderPDFLesson();
      case "external":
        return renderExternalLinkLesson();
      default:
        return (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={48}
              color={Colors.light.warning}
            />
            <Text style={styles.errorText}>Unknown lesson type</Text>
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderLessonContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentScroll: {
    flex: 1,
  },
  textContent: {
    padding: 16,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  articleContent: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 28,
  },
  pdfContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  pdfPlaceholder: {
    alignItems: "center",
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 16,
    textAlign: "center",
  },
  pdfDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  externalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  externalPlaceholder: {
    alignItems: "center",
  },
  externalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 16,
    textAlign: "center",
  },
  externalDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  openLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  openLinkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 12,
  },
});
