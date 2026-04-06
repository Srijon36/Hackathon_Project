import { configureStore } from "@reduxjs/toolkit";
import authReducer      from "../Reducer/AuthSlice";
import billReducer      from "../Reducer/BillSlice";
import analysisReducer  from "../Reducer/AnalysisSlice";
import applianceReducer from "../Reducer/ApplianceSlice"; // ← add

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    bill:      billReducer,
    analysis:  analysisReducer,
    appliance: applianceReducer, // ← add
  },
});

export default store;