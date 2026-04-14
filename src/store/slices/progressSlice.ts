import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import ProgressService from "../../services/ProgressService";
import type { LessonProgress } from "../../types/course";

interface ProgressState {
  courseProgress: Record<string, number>;
  lessonProgress: Record<string, LessonProgress>;
  loading: boolean;
  error: string | null;
  syncStatus: "synced" | "syncing" | "offline";
}

const initialState: ProgressState = {
  courseProgress: {},
  lessonProgress: {},
  loading: false,
  error: null,
  syncStatus: "synced",
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    updateCourseProgress: (
      state,
      action: PayloadAction<{ courseId: string; progress: number }>,
    ) => {
      state.courseProgress[action.payload.courseId] = action.payload.progress;
    },
    updateLessonProgress: (state, action: PayloadAction<LessonProgress>) => {
      state.lessonProgress[action.lessonId] = action;
    },
    clearProgress: (state) => {
      state.courseProgress = {};
      state.lessonProgress = {};
    },
    setSyncStatus: (
      state,
      action: PayloadAction<ProgressState["syncStatus"]>,
    ) => {
      state.syncStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncProgress.fulfilled, (state) => {
        state.loading = false;
        state.syncStatus = "synced";
      })
      .addCase(syncProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.syncStatus = "offline";
      });
  },
});

export const syncProgress = createAsyncThunk(
  "progress/syncProgress",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as any;
    const progressData = state.progress;
    try {
      await ProgressService.syncProgress(progressData);
      return progressData;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const {
  updateCourseProgress,
  updateLessonProgress,
  clearProgress,
  setSyncStatus,
} = progressSlice.actions;
export default progressSlice.reducer;
