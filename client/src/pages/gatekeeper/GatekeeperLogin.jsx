// client/src/pages/gatekeeper/GatekeeperLogin.jsx
// Dedicated login page for gatekeeper role
// Mobile + Desktop responsive — matches HostelEase design system

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

if (!document.getElementById("gk-sora")) {
  const l = document.createElement("link");
  l.id = "gk-sora"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

const P = {
  primary: "#059669", dark: "#047857", light: "#D1FAE5",
  text: "#0F1629", muted: "#6B7A99", border: "#E8EEFF",
  surface: "#F0FDF4", error: "#DC2626",
};

export default function GatekeeperLogin() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required."); return;
    }
    setLoading(true); setError("");
    try {
      const role = await login(email.trim(), password);
      if (role !== "gatekeeper") {
        setError("This login is only for gatekeeper accounts.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        return;
      }
      navigate("/gatekeeper/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally { setLoading(false); }
  };

  const inputStyle = (hasError) => ({
    width: "100%", padding: "13px 16px",
    border: `1.5px solid ${hasError ? P.error : P.border}`,
    borderRadius: 12, fontSize: 14,
    fontFamily: "'Sora', sans-serif",
    color: P.text, outline: "none",
    background: "#fff", boxSizing: "border-box",
    transition: "border-color .2s",
  });

  return (
    <div style={{
      minHeight: "100vh", background: P.surface,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'Sora', sans-serif",
    }}>
      <style>{`@keyframes gk-spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{
        width: "100%", maxWidth: 420,
        background: "#fff", borderRadius: 20,
        border: `1px solid ${P.border}`,
        boxShadow: "0 8px 40px rgba(5,150,105,0.10)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${P.primary}, ${P.dark})`,
          padding: "32px 32px 28px", textAlign: "center",
        }}>
          {/* Gate icon */}
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: "rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11,
            letterSpacing: "0.12em", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
            HostelEase
          </div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 22, fontWeight: 700 }}>
            Gate Control Login
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", margin: "8px 0 0", fontSize: 13 }}>
            Authorized gatekeeper access only
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: "28px 32px 32px" }}>
          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 10, padding: "12px 14px",
              color: P.error, fontSize: 13, marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={P.error} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: P.text,
              display: "block", marginBottom: 7 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="gatekeeper@hostelease.com"
              style={inputStyle(!!error)}
              onFocus={(e) => e.target.style.borderColor = P.primary}
              onBlur={(e) => e.target.style.borderColor = P.border}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: P.text,
              display: "block", marginBottom: 7 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Enter your password"
                style={{ ...inputStyle(!!error), paddingRight: 44 }}
                onFocus={(e) => e.target.style.borderColor = P.primary}
                onBlur={(e) => e.target.style.borderColor = P.border}
              />
              <button
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: P.muted, padding: 0, display: "flex",
                }}>
                {showPwd
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: loading ? "#6EE7B7" : `linear-gradient(135deg,${P.primary},${P.dark})`,
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Sora', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all .2s", minHeight: 50,
            }}>
            {loading && (
              <span style={{
                width: 18, height: 18,
                border: "2.5px solid rgba(255,255,255,0.4)",
                borderTop: "2.5px solid #fff", borderRadius: "50%",
                display: "inline-block",
                animation: "gk-spin .7s linear infinite",
              }}/>
            )}
            {loading ? "Signing in…" : "Access Gate Portal"}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: P.muted }}>
            Not a gatekeeper?{" "}
            <a href="/login" style={{ color: P.primary, fontWeight: 600, textDecoration: "none" }}>
              Use main login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}