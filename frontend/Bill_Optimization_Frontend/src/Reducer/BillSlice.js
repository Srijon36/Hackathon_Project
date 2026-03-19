import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../store/Api";

// Thunk 1: Create a new bill
export const createBill = createAsyncThunk(
  "bill/createBill",
  async (billData, { rejectWithValue }) => {
    try {
      const res = await api.post("/bills/create-bill", billData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create bill"
      );
    }
  }
);

// Thunk 2: Get all bills
export const getAllBills = createAsyncThunk(
  "bill/getAllBills",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/bills/all-bills");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch bills"
      );
    }
  }
);

// Thunk 3: Get single bill by ID
export const getBillById = createAsyncThunk(
  "bill/getBillById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/bills/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch bill"
      );
    }
  }
);

// Thunk 4: Update bill by ID
export const updateBill = createAsyncThunk(
  "bill/updateBill",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/bills/${id}`, updatedData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update bill"
      );
    }
  }
);

// Thunk 5: Delete bill by ID
export const deleteBill = createAsyncThunk(
  "bill/deleteBill",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/bills/${id}`);
      return { id };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete bill"
      );
    }
  }
);

// Thunk 6: Upload bill with manual form fields + analysis
export const uploadBill = createAsyncThunk(
  "bill/uploadBill",
  async ({ file, ...fields }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("bill", file);
      Object.keys(fields).forEach((key) => formData.append(key, fields[key]));

      const uploadRes = await api.post("/uploads/upload-bill", formData);
      const billId = uploadRes.data?.billId;

      const analysisRes = await api.get(`/analysis/get-analysis/${billId}`);
      return analysisRes.data;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Upload failed"
      );
    }
  }
);

// Thunk 7: Scan bill via Claude Vision — file only, auto-extract all fields
export const scanAndCreateBill = createAsyncThunk(
  "bill/scanAndCreate",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("bill", file); // ✅ key must match multer field name "bill"

      // ✅ NO manual Content-Type — let axios set multipart boundary automatically
      const res = await api.post("/uploads/upload-bill", formData);

      console.log("Scan response:", res.data);
      return res.data;

    } catch (err) {
      console.error("Scan error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || err.message || "Scan failed"
      );
    }
  }
);

const billSlice = createSlice({
  name: "bill",
  initialState: {
    bills: [],
    billData: null,
    loading: false,
    error: null,
    scanSuccess: false, // ✅ track scan success for navigation
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearBillData: (state) => { state.billData = null; },
    setBillData: (state, action) => { state.billData = action.payload; },
    clearScanSuccess: (state) => { state.scanSuccess = false; },
  },
  extraReducers: (builder) => {
    builder

      // ── Create Bill ──────────────────────────────
      .addCase(createBill.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills.push(action.payload.data || action.payload);
      })
      .addCase(createBill.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ── Get All Bills ────────────────────────────
      .addCase(getAllBills.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getAllBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload.data || action.payload;
      })
      .addCase(getAllBills.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ── Get Bill By ID ───────────────────────────
      .addCase(getBillById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getBillById.fulfilled, (state, action) => {
        state.loading = false;
        state.billData = action.payload.data || action.payload;
      })
      .addCase(getBillById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ── Update Bill ──────────────────────────────
      .addCase(updateBill.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        const index = state.bills.findIndex((b) => b._id === updated._id);
        if (index !== -1) state.bills[index] = updated;
      })
      .addCase(updateBill.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ── Delete Bill ──────────────────────────────
      .addCase(deleteBill.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = state.bills.filter((b) => b._id !== action.payload.id);
      })
      .addCase(deleteBill.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ── Upload Bill (manual form fields) ─────────
      .addCase(uploadBill.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(uploadBill.fulfilled, (state, action) => {
        state.loading = false;
        state.billData = action.payload;
        state.scanSuccess = true;
      })
      .addCase(uploadBill.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ── Scan & Create Bill (Claude Vision) ───────
      .addCase(scanAndCreateBill.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.scanSuccess = false;
      })
      .addCase(scanAndCreateBill.fulfilled, (state, action) => {
        state.loading = false;
        state.scanSuccess = true; // ✅ UploadBill.jsx watches this to navigate
        const bill = action.payload.data || action.payload;
        state.billData = bill;
        state.bills.push(bill);
      })
      .addCase(scanAndCreateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.scanSuccess = false;
      });
  },
});

export const { clearError, clearBillData, setBillData, clearScanSuccess } = billSlice.actions;
export default billSlice.reducer;