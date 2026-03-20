import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar         from "./pages/Navbar";
import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import UploadBill     from "./pages/UploadBill";
import Dashboard      from "./pages/DashBoard";
import DownloadReport from "./pages/DownloadReport";
import BillDetail     from "./pages/BillDetail";
import AnalysisPage   from "./pages/AnalysisPage";

const ProtectedRoute = ({ children }) => {
  const stored = sessionStorage.getItem("energy_token");
  const token  = stored ? JSON.parse(stored)?.token : null;
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected Routes ── */}
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

        {/* ── 404 ── */}
        <Route path="*" element={
          <div className="loader-container">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "64px" }}>🔍</div>
              <h2>404 — Page Not Found</h2>
              <p style={{ color: "#64748b" }}>
                The page you're looking for doesn't exist.
              </p>
              <a href="/" style={{ color: "#3b82f6" }}>Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;