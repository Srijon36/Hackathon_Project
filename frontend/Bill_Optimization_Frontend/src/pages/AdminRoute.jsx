import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const stored = sessionStorage.getItem("energy_token");
  const parsed = stored ? JSON.parse(stored) : null;
  const token  = parsed?.token;
  const role   = parsed?.user?.role;

  if (!token)          return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/upload" replace />;

  return children;
};

export default AdminRoute;