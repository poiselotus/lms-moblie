import { useCallback, useEffect, useRef, useState } from "react";
import { CourseService } from "../services/CourseService";
import { Category, Course, CourseFilter } from "../types/course";
import { useDebounce } from "./useDebounce";

interface UseCoursesResult {
  courses: Course[];
  featuredCourses: Course[];
  popularCourses: Course[];
  categories: Category[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  filter: CourseFilter;
  searchQuery: string;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilter: (filter: CourseFilter) => void;
  setSearchQuery: (query: string) => void;
  getCourseById: (courseId: string) => Promise<Course | null>;
  getCourseLessons: (courseId: string) => Promise<any[]>;
  getCourseReviews: (courseId: string) => Promise<any[]>;
}

const PAGE_SIZE = 10;

// Simple in-memory cache
const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCache(key: string): any | null {
  const item = cache[key];
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache[key] = { data, timestamp: Date.now() };
}

export function useCourses(): UseCoursesResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<CourseFilter>({});
  const [searchQuery, setSearchQuery] = useState("");

  const lastDocRef = useRef<any>(null);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load categories
      const categoriesCacheKey = "categories";
      let cachedCategories = getCache(categoriesCacheKey);
      if (!cachedCategories) {
        cachedCategories = await CourseService.getCategories();
        setCache(categoriesCacheKey, cachedCategories);
      }
      setCategories(cachedCategories);

      // Load featured courses
      const featuredCacheKey = "featured_courses";
      let cachedFeatured = getCache(featuredCacheKey);
      if (!cachedFeatured) {
        cachedFeatured = await CourseService.getFeaturedCourses();
        setCache(featuredCacheKey, cachedFeatured);
      }
      setFeaturedCourses(cachedFeatured);

      // Load popular courses
      const popularCacheKey = "popular_courses";
      let cachedPopular = getCache(popularCacheKey);
      if (!cachedPopular) {
        cachedPopular = await CourseService.getPopularCourses(10);
        setCache(popularCacheKey, cachedPopular);
      }
      setPopularCourses(cachedPopular);

      // Load courses with filter
      const coursesResult = await CourseService.getCourses(
        filter,
        debouncedSearch,
      );
      setCourses(coursesResult.courses);
      lastDocRef.current = coursesResult.lastDoc;
      setHasMore(coursesResult.hasMore);
    } catch (err: any) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch]);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load more courses
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDocRef.current) {
      return;
    }

    setLoadingMore(true);
    try {
      const result = await CourseService.getCourses(
        filter,
        debouncedSearch,
        lastDocRef.current,
      );

      setCourses((prev) => [...prev, ...result.courses]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message || "Failed to load more courses");
    } finally {
      setLoadingMore(false);
    }
  }, [filter, debouncedSearch, loadingMore, hasMore]);

  // Refresh
  const refresh = useCallback(async () => {
    // Clear cache
    Object.keys(cache).forEach((key) => delete cache[key]);
    lastDocRef.current = null;
    await loadInitialData();
  }, [loadInitialData]);

  // Get course by ID
  const getCourseById = useCallback(
    async (courseId: string): Promise<Course | null> => {
      const cacheKey = `course_${courseId}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return cached;
      }

      const course = await CourseService.getCourseById(courseId);
      if (course) {
        setCache(cacheKey, course);
      }
      return course;
    },
    [],
  );

  // Get course lessons
  const getCourseLessons = useCallback(async (courseId: string) => {
    const cacheKey = `lessons_${courseId}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const lessons = await CourseService.getCourseLessons(courseId);
    setCache(cacheKey, lessons);
    return lessons;
  }, []);

  // Get course reviews
  const getCourseReviews = useCallback(async (courseId: string) => {
    const cacheKey = `reviews_${courseId}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const reviews = await CourseService.getCourseReviews(courseId);
    setCache(cacheKey, reviews);
    return reviews;
  }, []);

  return {
    courses,
    featuredCourses,
    popularCourses,
    categories,
    loading,
    loadingMore,
    error,
    hasMore,
    filter,
    searchQuery,
    loadMore,
    refresh,
    setFilter,
    setSearchQuery,
    getCourseById,
    getCourseLessons,
    getCourseReviews,
  };
}

export default useCourses;
