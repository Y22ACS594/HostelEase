import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute — supports two prop styles:
 *   <ProtectedRoute role="warden">            ← single role string (App.jsx style)
 *   <ProtectedRoute allowedRoles={["warden","admin"]}>  ← array style
 */
export default function ProtectedRoute({ children, role, allowedRoles }) {
  const location = useLocation();

  const token      = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  // Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Build the allowed list from whichever prop was passed
  const allowed = allowedRoles
    ? allowedRoles
    : role
    ? [role]
    : [];

  // Wrong role → 403 page
  if (allowed.length > 0 && !allowed.includes(storedRole)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "sans-serif",
          background: "#f8fafc",
        }}
      >
        <div style={{ fontSize: 64 }}>🚫</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>
          Access Denied
        </h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          Your account role (<strong>{storedRole || "unknown"}</strong>) cannot
          access this page.
        </p>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          style={{
            marginTop: 8,
            padding: "10px 24px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return children;
}