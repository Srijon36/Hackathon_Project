import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../store/Api";

// ── Thunk 1: Get analysis for a specific bill ──────────────────────────────
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

// ── Thunk 2: Compare last two bills ───────────────────────────────────────
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

// ── Thunk 3: Predict next month bill ──────────────────────────────────────
export const predictNextBill = createAsyncThunk(
  "analysis/predictNextBill",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/predict");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch prediction"
      );
    }
  }
);

const analysisSlice = createSlice({
  name: "analysis",
  initialState: {
    // Bill analysis
    analysisData:    null,
    loading:         false,
    error:           null,

    // Comparison — separate flag so it never pollutes the page loader
    comparisonData:  null,
    comparing:       false,
    comparisonError: null,

    // Prediction — fully isolated state
    prediction:      null,
    predicting:      false,
    predictionError: null,
    basedOn:         0,        // how many bills the prediction is based on
    generatedAt:     null,
  },
  reducers: {
    clearAnalysis: (state) => {
      state.analysisData   = null;
      state.comparisonData = null;
      state.error          = null;
      state.comparisonError = null;
    },
    clearPrediction: (state) => {
      state.prediction      = null;
      state.predictionError = null;
      state.basedOn         = 0;
      state.generatedAt     = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Get Bill Analysis ──────────────────────────────────────────────
      .addCase(getBillAnalysis.pending, (state) => {
        state.loading      = true;
        state.error        = null;
        state.analysisData = null;
      })
      .addCase(getBillAnalysis.fulfilled, (state, action) => {
        state.loading      = false;
        state.analysisData = action.payload;
      })
      .addCase(getBillAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── Compare Bills ──────────────────────────────────────────────────
      // Uses its own `comparing` flag — never touches `loading`
      // so the page spinner is not re-triggered
      .addCase(compareBills.pending, (state) => {
        state.comparing      = true;
        state.comparisonError = null;
      })
      .addCase(compareBills.fulfilled, (state, action) => {
        state.comparing      = false;
        state.comparisonData = action.payload;
      })
      .addCase(compareBills.rejected, (state, action) => {
        state.comparing      = false;
        state.comparisonError = action.payload;
      })

      // ── Predict Next Bill ──────────────────────────────────────────────
      // Fully isolated — never touches `loading` or `comparing`
      .addCase(predictNextBill.pending, (state) => {
        state.predicting      = true;
        state.predictionError = null;
      })
      .addCase(predictNextBill.fulfilled, (state, action) => {
        state.predicting  = false;
        // Backend returns { success, prediction: {...}, basedOn, generatedAt }
        // We store the nested prediction object and the metadata separately
        state.prediction  = action.payload.prediction ?? action.payload;
        state.basedOn     = action.payload.basedOn    ?? 0;
        state.generatedAt = action.payload.generatedAt ?? null;
      })
      .addCase(predictNextBill.rejected, (state, action) => {
        state.predicting      = false;
        state.predictionError = action.payload;
      });
  },
});

export const { clearAnalysis, clearPrediction, clearError } = analysisSlice.actions;
export default analysisSlice.reducer;