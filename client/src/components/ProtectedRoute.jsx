import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ role: allowedRole, children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // ❌ Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but wrong role
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }
    if (user.role === "warden") {
      return <Navigate to="/warden/dashboard" replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // ✅ Allowed
  return children;
};

export default ProtectedRoute;
