import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../store/Api";

// Thunk 1: Get analysis for a specific bill
export const getBillAnalysis = createAsyncThunk(
  "analysis/getBillAnalysis",
  async (billId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/analysis/bill-analysis/${billId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch analysis"
      );
    }
  }
);

// Thunk 2: Compare last two bills
export const compareBills = createAsyncThunk(
  "analysis/compareBills",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/analysis/compare-bills");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to compare bills"
      );
    }
  }
);

const analysisSlice = createSlice({
  name: "analysis",
  initialState: {
    analysisData: null,    // single bill analysis
    comparisonData: null,  // comparison of last two bills
    loading: false,
    error: null,
  },
  reducers: {
    clearAnalysis: (state) => {
      state.analysisData = null;
      state.comparisonData = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Get Bill Analysis ────────────────────────
      .addCase(getBillAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBillAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.analysisData = action.payload;
      })
      .addCase(getBillAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Compare Bills ────────────────────────────
      .addCase(compareBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(compareBills.fulfilled, (state, action) => {
        state.loading = false;
        state.comparisonData = action.payload;
      })
      .addCase(compareBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnalysis, clearError } = analysisSlice.actions;
export default analysisSlice.reducer;