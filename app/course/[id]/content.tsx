import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../src/config/firebase';
import { useAuth } from '../../../src/context/AuthContext';
import { ProgressService } from '../../../src/services/ProgressService';
import { Ionicons } from '@expo/vector-icons';

export default function CourseContentScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonProgress, setLessonProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [resumeLessonId, setResumeLessonId] = useState(null);

  useEffect(() => {
    if (user && id) {
      fetchCourseContent();
    }
  }, [user, id]);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      
      // Fetch course
      const courseRef = doc(db, 'courses', id);
      const courseDoc = await getDoc(courseRef);
      if (courseDoc.exists()) {
        setCourse({ id: courseDoc.id, ...courseDoc.data() });
      }
      
      // Fetch lessons
      const lessonsRef = collection(db, `courses/${id}/lessons`);
      const q = query(lessonsRef, orderBy('order', 'asc'));
      const lessonsSnapshot = await getDocs(q);
      const lessonsData = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLessons(lessonsData);
      
      // Fetch progress
      const progress = await ProgressService.getCourseProgress(user.uid, id);
      const progressMap = {};
      let completed = 0;
      progress.forEach(p => {
        progressMap[p.lessonId] = p;
        if (p.completed) completed++;
      });
      setLessonProgress(progressMap);
      
      // Calculate progress percentage
      const percent = lessonsData.length > 0 ? Math.round((completed / lessonsData.length) * 100) : 0;
      setProgressPercent(percent);
      
      // Get resume lesson
      const lastLessonId = await ProgressService.getLastAccessedLesson(user.uid, id);
      if (lastLessonId) {
        setResumeLessonId(lastLessonId);
      } else if (lessonsData.length > 0) {
        setResumeLessonId(lessonsData[0].id);
      }
      
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCourseTitle = (courseId) => {
    return courseId
      .replace(/^course_/, '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleLessonPress = async (lesson) => {
    await ProgressService.updateLastAccessed(user.uid, id, lesson.id);
    router.push({
      pathname: `/course/${id}/lesson/${lesson.id}`,
      params: { lesson: JSON.stringify(lesson) }
    });
  };

  const handleToggleComplete = async (lessonId, currentCompleted) => {
    if (currentCompleted) {
      await ProgressService.markLessonIncomplete(user.uid, id, lessonId);
    } else {
      await ProgressService.markLessonCompleted(user.uid, id, lessonId);
    }
    
    // Refresh progress
    const progress = await ProgressService.getCourseProgress(user.uid, id);
    const progressMap = {};
    let completed = 0;
    progress.forEach(p => {
      progressMap[p.lessonId] = p;
      if (p.completed) completed++;
    });
    setLessonProgress(progressMap);
    setProgressPercent(lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0);
  };

  const handleResume = () => {
    if (resumeLessonId) {
      const lesson = lessons.find(l => l.id === resumeLessonId);
      if (lesson) {
        handleLessonPress(lesson);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{formatCourseTitle(id)}</Text>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Course Progress</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        
        {/* Resume Button */}
        {resumeLessonId && (
          <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
            <Ionicons name="play-circle" size={20} color="#8B5CF6" />
            <Text style={styles.resumeText}>Continue where you left off</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lessons List */}
      <ScrollView style={styles.lessonsList}>
        <Text style={styles.sectionTitle}>Course Content</Text>
        {lessons.map((lesson, index) => {
          const isCompleted = lessonProgress[lesson.id]?.completed || false;
          const isLastAccessed = resumeLessonId === lesson.id;
          
          return (
            <TouchableOpacity 
              key={lesson.id} 
              style={[styles.lessonItem, isLastAccessed && styles.lastAccessedItem]}
              onPress={() => handleLessonPress(lesson)}
            >
              <View style={styles.lessonLeft}>
                <View style={[styles.lessonNumber, isCompleted && styles.completedNumber]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  )}
                </View>
                <Ionicons name="play-circle-outline" size={24} color="#8B5CF6" />
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, isCompleted && styles.completedText]}>
                    {lesson.title}
                  </Text>
                  <Text style={styles.lessonDuration}>{formatDuration(lesson.duration)}</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => handleToggleComplete(lesson.id, isCompleted)}
                style={styles.completeButton}
              >
                <Ionicons 
                  name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} 
                  size={24} 
                  color={isCompleted ? "#10B981" : "#D1D5DB"} 
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#8B5CF6', padding: 20, paddingTop: 48, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', flex: 1 },
  progressSection: { backgroundColor: '#FFFFFF', margin: 16, padding: 16, borderRadius: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressTitle: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  progressPercent: { fontSize: 14, fontWeight: 'bold', color: '#8B5CF6' },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 4 },
  resumeButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  resumeText: { fontSize: 14, color: '#8B5CF6', fontWeight: '500' },
  lessonsList: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  lessonItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 8 },
  lastAccessedItem: { borderWidth: 2, borderColor: '#8B5CF6' },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  lessonNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  completedNumber: { backgroundColor: '#10B981' },
  lessonNumberText: { fontSize: 12, fontWeight: '600', color: '#8B5CF6' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: '500', color: '#1F2937', marginBottom: 2 },
  completedText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  lessonDuration: { fontSize: 12, color: '#9CA3AF' },
  completeButton: { marginLeft: 12, padding: 4 },
});
