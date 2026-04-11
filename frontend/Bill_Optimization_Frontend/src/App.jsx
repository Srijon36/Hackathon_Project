import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Navbar         from "./pages/Navbar";
import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import UploadBill     from "./pages/UploadBill";
import Dashboard      from "./pages/DashBoard";
import DownloadReport from "./pages/DownloadReport";
import BillDetail     from "./pages/BillDetail";
import AnalysisPage   from "./pages/AnalysisPage";
import ForgotPassword from "./pages/ForgotPassword";
import Appliances     from "./pages/Appliances";
import AdminPanel     from "./pages/AdminPanel";
import AdminRoute     from "./pages/AdminRoute";
import HistoryPanel   from "./pages/HistoryPanel";
import { getAllBills } from "./Reducer/BillSlice";

const ProtectedRoute = ({ children }) => {
  const stored = sessionStorage.getItem("energy_token");
  const token  = stored ? JSON.parse(stored)?.token : null;
  return token ? children : <Navigate to="/login" replace />;
};

const AppLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const [historyOpen, setHistoryOpen] = useState(false);
  const { bills } = useSelector(s => s.bill);

  const hideNavbarRoutes = ["/", "/login", "/register", "/forgot-password", "/admin"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  const handleHistoryOpen = () => {
    dispatch(getAllBills()); // ensure bills are fresh
    setHistoryOpen(true);
  };

  return (
    <>
      {!hideNavbar && (
        <Navbar onHistoryOpen={handleHistoryOpen} />
      )}

      <HistoryPanel
        bills={bills}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/appliances" element={
          <ProtectedRoute><Appliances /></ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute><UploadBill /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/bill/:id" element={
          <ProtectedRoute><BillDetail /></ProtectedRoute>
        } />
        <Route path="/analysis/:id" element={
          <ProtectedRoute><AnalysisPage /></ProtectedRoute>
        } />
        <Route path="/download-report" element={
          <ProtectedRoute><DownloadReport /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute><AdminPanel /></AdminRoute>
        } />

        <Route path="*" element={
          <div className="loader-container">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "64px" }}>🔍</div>
              <h2>404 — Page Not Found</h2>
              <p style={{ color: "#64748b" }}>The page you're looking for doesn't exist.</p>
              <a href="/" style={{ color: "#3b82f6" }}>Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;