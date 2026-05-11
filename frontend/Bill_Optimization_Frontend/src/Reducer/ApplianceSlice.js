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

// Add a new appliance to the user's appliance list
export const addSingleAppliance = createAsyncThunk(
  "appliance/addSingle",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("appliances/add", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add appliance"
      );
    }
  }
);

// Delete an appliance using its ID
export const deleteSingleAppliance = createAsyncThunk(
  "appliance/deleteSingle",
  async (applianceId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`appliances/${applianceId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete appliance"
      );
    }
  }
);

// Update appliance details like usage, wattage, or quantity
export const updateSingleAppliance = createAsyncThunk(
  "appliance/updateSingle",
  async ({ applianceId, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`appliances/${applianceId}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update appliance"
      );
    }
  }
);

// Fetch personalized energy-saving recommendations from backend
export const fetchRecommendations = createAsyncThunk(
  "appliance/fetchRecommendations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("recommendations");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch recommendations"
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
      })
      /////     RATHI GHOSH     ????
      .addCase(addSingleAppliance.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.profile = payload.data;
      state.saved   = true;
      })
      .addCase(deleteSingleAppliance.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.profile = payload.data;
      })
      .addCase(updateSingleAppliance.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.profile = payload.data;
      })
      .addCase(fetchRecommendations.pending, (state) => {
      state.recLoading = true;
      state.recError   = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, { payload }) => {
      state.recLoading        = false;
      state.recommendations   = payload.recommendations;
      state.score             = payload.score;
      state.aiSummary         = payload.aiSummary;
      state.totalSavings      = payload.totalPotentialSavings;
      })
      .addCase(fetchRecommendations.rejected, (state, { payload }) => {
      state.recLoading = false;
      state.recError   = payload;
    });
  },
});

export const { clearApplianceState } = applianceSlice.actions;
export default applianceSlice.reducer;