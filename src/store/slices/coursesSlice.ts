import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import CourseService from "../../services/CourseService";
import type {
  Course,
  CourseFilter,
  deriveCourseTitle,
  FirestoreCategory,
} from "../../types/firestoreCourse";

// Thunks
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (filter?: CourseFilter, { rejectWithValue }) => {
    try {
      const result = await CourseService.getCourses(1, filter);
      return result.courses.map(
        (course) =>
          ({
            ...course,
            title: deriveCourseTitle(course.id),
          }) as Course,
      );
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchCategories = createAsyncThunk(
  "courses/fetchCategories",
  async () => {
    return await CourseService.getCategories();
  },
);

export const searchCourses = createAsyncThunk(
  "courses/searchCourses",
  async (query: string) => {
    const courses = await CourseService.searchCourses(query);
    return courses.map((course) => ({
      ...course,
      title: deriveCourseTitle(course.id),
    }));
  },
);

interface CoursesState {
  courses: Course[];
  categories: FirestoreCategory[];
  featuredCourses: Course[];
  loading: boolean;
  error: string | null;
  filters: CourseFilter;
  searchQuery: string;
  hasMore: boolean;
}

const initialState: CoursesState = {
  courses: [],
  categories: [],
  featuredCourses: [],
  loading: false,
  error: null,
  filters: {},
  searchQuery: "",
  hasMore: true,
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<CourseFilter>) => {
      state.filters = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearCourses: (state) => {
      state.courses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
      });
  },
});

export const { clearError, setFilters, setSearchQuery, clearCourses } =
  coursesSlice.actions;
export default coursesSlice.reducer;
