import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile } from "../../types/user";

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  preferences: {
    notifications: boolean;
    language: "en" | "es" | "fr";
    darkMode: boolean;
  };
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  preferences: {
    notifications: true,
    language: "en",
    darkMode: false,
  },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
      state.error = null;
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<ProfileState["preferences"]>>,
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearProfileError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setProfile,
  updatePreferences,
  setProfileLoading,
  clearProfileError,
} = profileSlice.actions;
export default profileSlice.reducer;
