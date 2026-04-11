import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

// ── Save Appliance Profile ────────────────────
export const saveApplianceProfile = createAsyncThunk(
  "appliance/save",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("appliances/save", data); // ✅ removed leading /
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to save appliance profile"
      );
    }
  }
);

// ── Get Appliance Profile ─────────────────────
export const getApplianceProfile = createAsyncThunk(
  "appliance/get",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("appliances/profile"); // ✅ removed leading /
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "No appliance profile found"
      );
    }
  }
);

// ── Slice ─────────────────────────────────────
const applianceSlice = createSlice({
  name: "appliance",
  initialState: {
    profile:  null,
    loading:  false,
    error:    null,
    saved:    false,
  },
  reducers: {
    clearApplianceState: (state) => {
      state.error  = null;
      state.saved  = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // save
      .addCase(saveApplianceProfile.pending, (state) => {
        state.loading = true; state.error = null; state.saved = false;
      })
      .addCase(saveApplianceProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.profile = payload.data;
        state.saved   = true;
      })
      .addCase(saveApplianceProfile.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload;
      })
      // get
      .addCase(getApplianceProfile.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getApplianceProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.profile = payload.data;
      })
      .addCase(getApplianceProfile.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload;
      });
  },
});

export const { clearApplianceState } = applianceSlice.actions;
export default applianceSlice.reducer;