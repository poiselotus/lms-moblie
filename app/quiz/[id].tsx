import Colors from "@/constants/Colors";
import { useAuth } from "@/src/context/AuthContext";
import QuizService from "@/src/services/QuizService";
import { Quiz, QuizAttempt } from "@/src/types/course";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string | number>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
    if (timeLeft && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft]);

  const loadQuiz = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const quizData = await QuizService.getQuiz(id);
      setQuiz(quizData);
      if (quizData?.timeLimit) {
        setTimeLeft(quizData.timeLimit * 60);
      }
      setStartTime(new Date());
    } catch (error) {
      console.error("Error loading quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string | number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!quiz || !user || !startTime) return;

    // Grade all answers
    const gradedAnswers = quiz.questions.map((q) => {
      const selectedAnswer = selectedAnswers[q.id];
      const result = QuizService.gradeAnswer(q, selectedAnswer || "");
      return {
        questionId: q.id,
        selectedAnswer: selectedAnswer || "",
        isCorrect: result.isCorrect,
        pointsEarned: result.pointsEarned,
      };
    });

    try {
      const result = await QuizService.submitAttempt(
        user.uid,
        quiz.courseId,
        quiz.id,
        gradedAnswers,
        startTime,
      );
      setAttempt(result);
      setShowResults(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit quiz");
    }
  }, [quiz, user, startTime, selectedAnswers]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Quiz not found</Text>
        </View>
      </View>
    );
  }

  // Show results
  if (showResults && attempt) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsContent}>
          <View style={styles.resultsHeader}>
            <View
              style={[
                styles.resultsIcon,
                attempt.passed ? styles.passedIcon : styles.failedIcon,
              ]}
            >
              <Ionicons
                name={attempt.passed ? "checkmark-circle" : "close-circle"}
                size={64}
                color={
                  attempt.passed ? Colors.light.success : Colors.light.error
                }
              />
            </View>
            <Text style={styles.resultsTitle}>
              {attempt.passed ? "Congratulations!" : "Keep Learning!"}
            </Text>
            <Text style={styles.resultsSubtitle}>
              {attempt.passed
                ? "You passed the quiz!"
                : "You didn't pass this time."}
            </Text>
          </View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={styles.scoreValue}>{Math.round(attempt.score)}%</Text>
            <Text style={styles.passingScoreText}>
              Passing score: {quiz.passingScore}%
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="time-outline"
                size={24}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.statValue}>
                {Math.floor(attempt.timeSpent / 60)}m
              </Text>
              <Text style={styles.statLabel}>Time Spent</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="refresh-outline"
                size={24}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.statValue}>{attempt.attemptNumber}</Text>
              <Text style={styles.statLabel}>Attempts</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Quiz questions
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quiz.title}</Text>
        {timeLeft !== null && (
          <View style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>
            <Ionicons
              name="time-outline"
              size={16}
              color={timeLeft < 60 ? Colors.light.error : Colors.light.text}
            />
            <Text
              style={[
                styles.timerText,
                timeLeft < 60 && styles.timerTextWarning,
              ]}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
      </View>

      {/* Question */}
      <ScrollView style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[currentQuestion.id] === index &&
                  styles.optionSelected,
              ]}
              onPress={() => handleSelectAnswer(currentQuestion.id, index)}
            >
              <View
                style={[
                  styles.optionCircle,
                  selectedAnswers[currentQuestion.id] === index &&
                    styles.optionCircleSelected,
                ]}
              >
                {selectedAnswers[currentQuestion.id] === index && (
                  <View style={styles.optionCircleInner} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedAnswers[currentQuestion.id] === index &&
                    styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={
              currentQuestionIndex === 0
                ? Colors.light.border
                : Colors.light.tint
            }
          />
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          >
            <Text style={styles.navButtonTextPrimary}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  timer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerWarning: {
    backgroundColor: Colors.light.error + "20",
  },
  timerText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginLeft: 4,
  },
  timerTextWarning: {
    color: Colors.light.error,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  optionSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + "10",
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionCircleSelected: {
    borderColor: Colors.light.tint,
  },
  optionCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.tint,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: Colors.light.tint,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonPrimary: {
    backgroundColor: Colors.light.tint,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.tint,
  },
  navButtonTextDisabled: {
    color: Colors.light.border,
  },
  navButtonTextPrimary: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginRight: 4,
  },
  submitButton: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  // Results styles
  resultsContent: {
    padding: 24,
  },
  resultsHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  resultsIcon: {
    marginBottom: 16,
  },
  passedIcon: {},
  failedIcon: {},
  resultsTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  scoreCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.light.tint,
  },
  passingScoreText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  doneButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});
