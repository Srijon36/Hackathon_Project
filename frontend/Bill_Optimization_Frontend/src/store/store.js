import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Reducer/AuthSlice";
import billReducer from "../Reducer/BillSlice";
import analysisReducer from "../Reducer/AnalysisSlice";

// ✅ ADD THESE 3 LINES TEMPORARILY
console.log("authReducer:", authReducer);
console.log("billReducer:", billReducer);
console.log("analysisReducer:", analysisReducer);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bill: billReducer,
    analysis: analysisReducer,
  },
});
export default store;