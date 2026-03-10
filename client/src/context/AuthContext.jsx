import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to restore auth", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const userData = {
      role:  res.data.role,
      name:  res.data.name  || "",
      email: res.data.email || email,
    };

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user",  JSON.stringify(userData));
    // ✅ Store role separately so ProtectedRoute can read it directly
    localStorage.setItem("role",  res.data.role);

    setUser(userData);
    return res.data.role;
  };

  // ── LOGOUT ─────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
  };

  // Prevent flash of wrong page while rehydrating
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};