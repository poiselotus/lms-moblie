import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { FirestoreUser } from "../../types/user";

interface AuthState {
  user: FirestoreUser | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirestoreUser | null>) => {
      state.user = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, setToken, clearAuth } =
  authSlice.actions;
export default authSlice.reducer;
