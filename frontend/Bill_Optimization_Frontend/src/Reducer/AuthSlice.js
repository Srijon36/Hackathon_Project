import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

// ── LOGIN ────────────────────────────────────
export const login = createAsyncThunk(
  "auth/login",
  async (userInput, { rejectWithValue }) => {
    try {
      const response = await api.post("/logins/create-login", userInput);
      if (response?.data?.token) {
        return response.data;
      }
      return rejectWithValue(
        response?.data?.message || "Login failed - no token received"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again."
      );
    }
  }
);

// ── REGISTER ─────────────────────────────────
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userInput, { rejectWithValue }) => {
    try {
      const response = await api.post("/registers/create-register", userInput);
      if (response?.data) {
        return response.data;
      }
      return rejectWithValue(
        response?.data?.message || "Registration failed"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again."
      );
    }
  }
);

// ── LOGOUT ───────────────────────────────────
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    sessionStorage.removeItem("energy_token");
    dispatch(logout());
  }
);

// ── SEND OTP ─────────────────────────────────
export const sendOTP = createAsyncThunk(
  "auth/sendOTP",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/forgot-password/send-otp", { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

// ── VERIFY OTP ───────────────────────────────
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await api.post("/forgot-password/verify-otp", { email, otp });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid OTP"
      );
    }
  }
);

// ── RESET PASSWORD ───────────────────────────
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const res = await api.post("/forgot-password/reset-password", {
        email, otp, newPassword,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

// ── SLICE ────────────────────────────────────
const initialState = {
  loading: false,
  error:   null,
  user:    null,
  token:   null,
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.loading = false;
      state.error   = null;
      state.user    = null;
      state.token   = null;
      sessionStorage.removeItem("energy_token");
    },
  },
  extraReducers: (builder) => {
    builder

      // ── LOGIN ──────────────────────────────
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error   = null;
        state.token   = payload.token;
        state.user    = payload.user;
        sessionStorage.setItem("energy_token", JSON.stringify({
          token: payload.token,
          user:  payload.user,
        }));
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload?.msg || payload?.message ||
          (typeof payload === "string" ? payload : "Login failed");
      })

      // ── REGISTER ───────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error   = null;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload?.msg || payload?.message ||
          (typeof payload === "string" ? payload : "Registration failed");
      })

      // ── LOGOUT ─────────────────────────────
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.error   = null;
        state.user    = null;
        state.token   = null;
      })

      // ── SEND OTP ───────────────────────────
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.error   = null;
      })
      .addCase(sendOTP.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      })

      // ── VERIFY OTP ─────────────────────────
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        state.error   = null;
      })
      .addCase(verifyOTP.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      })

      // ── RESET PASSWORD ─────────────────────
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error   = null;
      })
      .addCase(resetPassword.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      });
  },
});

export const { logout } = AuthSlice.actions;
export default AuthSlice.reducer;