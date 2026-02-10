import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
  if (user.role === "warden") return <Navigate to="/warden/dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export default HomeRedirect;
