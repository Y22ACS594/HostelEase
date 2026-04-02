// src/pages/auth/Login.jsx  — Fully responsive (mobile + desktop)
// ✅ UPDATED: Added "Gatekeeper Login" button at bottom
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ROLE_MISMATCH = {
  warden:  "These credentials belong to a Warden account. Switch to the Warden tab.",
  student: "These credentials belong to a Student account. Switch to the Student tab.",
  admin:   "This is an Admin account. Please use the Admin Login link.",
};

const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [role,     setRole]     = useState("student");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const h = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const resolvedRole = await login(email, password);
      if (resolvedRole !== role && resolvedRole !== "admin") {
        setError(ROLE_MISMATCH[resolvedRole] ?? "Account role mismatch.");
        return;
      }
      if (resolvedRole === "student")      navigate("/student/dashboard");
      else if (resolvedRole === "warden")  navigate("/warden/dashboard");
      else                                 navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  const FEATURES = [
    { icon: "👩‍🎓", title: "Students",       desc: "Register and manage all hostel students"    },
    { icon: "📋",   title: "Leave Requests", desc: "Approve or reject student leave requests"   },
    { icon: "🛏️",   title: "Room Allocation", desc: "Assign beds and track occupancy"           },
    { icon: "🔔",   title: "Notifications",  desc: "Real-time alerts for all hostel activities" },
  ];

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: "'Sora', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#fff",
      flexDirection: isMobile ? "column" : "row",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #9CA3AF; font-size: 14px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        .he-field-wrap {
          display:flex; align-items:center; width:100%;
          border:1.5px solid #D1D5DB; border-radius:10px;
          background:#fff; transition:border-color .15s, box-shadow .15s; overflow:hidden;
        }
        .he-field-wrap:focus-within { border-color:#111827; box-shadow: 0 0 0 3px rgba(17,24,39,0.08); }
        .he-field-icon { display:flex; align-items:center; justify-content:center; padding:0 14px; color:#9CA3AF; flex-shrink:0; pointer-events:none; }
        .he-field-divider { width:1px; height:22px; background:#E5E7EB; flex-shrink:0; }
        .he-bare-input { flex:1; padding:13px 14px; border:none; outline:none; font-size:14px; color:#111827; background:transparent; font-family:'Sora',sans-serif; }
        .he-eye-btn { display:flex; align-items:center; justify-content:center; padding:0 14px; background:none; border:none; cursor:pointer; color:#9CA3AF; flex-shrink:0; transition:color .15s; }
        .he-eye-btn:hover { color:#374151; }
        .he-role-btn:hover { background: #F9FAFB !important; }
        .he-feat-card:hover { background: #F3F4F6 !important; transform: translateY(-2px); }
        .he-submit:hover:not(:disabled) { background: #1F2937 !important; }
        .he-gate-btn:hover { background: #F0FDF4 !important; border-color: #059669 !important; color: #059669 !important; }
      `}</style>

      {/* ── LEFT INFO PANEL (hidden on mobile) ── */}
      {!isMobile && (
        <div style={{
          flex: 1, padding: "48px 56px",
          background: "linear-gradient(145deg,#F0FDF4 0%,#EFF6FF 50%,#F5F3FF 100%)",
          display: "flex", flexDirection: "column",
          borderRight: "1px solid #F3F4F6",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg,#2563EB,#7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            }}>🏠</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.4px" }}>
              HostelEase
            </span>
          </div>

          <div style={{ animation: "fadeIn .6s ease both" }}>
            <h1 style={{
              fontSize: 42, fontWeight: 800, color: "#111827",
              lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 16,
            }}>
              Welcome HostelEase 👋
            </h1>
            <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.6, maxWidth: 400, marginBottom: 40 }}>
              Manage hostel operations, track student leaves, room allocations — all in one place.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 440 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="he-feat-card"
                style={{
                  padding: "16px", borderRadius: 16,
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  backdropFilter: "blur(8px)",
                  transition: "all .2s", cursor: "default",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* ✅ Desktop gatekeeper link */}
          <div style={{ marginTop: "auto", paddingTop: 32 }}>
            <Link to="/gatekeeper/login" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 18px", borderRadius: 14,
                border: "1.5px solid #D1FAE5", background: "#fff",
                transition: "all .2s", cursor: "pointer",
              }}
                className="he-gate-btn"
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg,#059669,#047857)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    Gatekeeper Portal
                  </div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                    Entry &amp; exit control access
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ marginLeft: "auto" }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{
        width: isMobile ? "100%" : 480,
        padding: isMobile ? "32px 20px 40px" : "48px 56px",
        display: "flex", flexDirection: "column",
        justifyContent: isMobile ? "flex-start" : "center",
        animation: "fadeIn .5s ease both",
        overflowY: "auto",
      }}>
        {/* Mobile logo */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg,#2563EB,#7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>🏠</div>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#111827" }}>HostelEase</span>
          </div>
        )}

        <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600,
          color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          SECURE LOGIN
        </div>
        <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, color: "#111827",
          letterSpacing: "-0.5px", marginBottom: 6 }}>
          Login to your account
        </h2>
        <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 32 }}>
          Continue to your dashboard
        </p>

        {/* Role Toggle */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, marginBottom: 28,
          background: "#F9FAFB", borderRadius: 14, padding: 4 }}>
          {[
            { key: "student", label: "Student", icon: "🎓" },
            { key: "warden",  label: "Warden",  icon: "🛡️" },
          ].map(({ key, label, icon }) => (
            <button key={key} type="button" className="he-role-btn"
              onClick={() => { setRole(key); setError(""); }}
              style={{
                padding: "10px 16px", borderRadius: 11, border: "none",
                background: role === key ? "#111827" : "transparent",
                color: role === key ? "#fff" : "#6B7280",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all .15s",
                boxShadow: role === key ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                minHeight: 44,
              }}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA",
            borderRadius: 12, padding: "10px 14px",
            fontSize: 13, color: "#991B1B", marginBottom: 20,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#111827",
              display: "block", marginBottom: 8 }}>
              Your Email
            </label>
            <div className="he-field-wrap">
              <span className="he-field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <div className="he-field-divider"/>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === "student" ? "student@gmail.com" : "warden@gmail.com"}
                required className="he-bare-input"
                autoComplete="email"/>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#111827",
              display: "block", marginBottom: 8 }}>
              Password
            </label>
            <div className="he-field-wrap">
              <span className="he-field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <div className="he-field-divider"/>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder=""
                required
                className="he-bare-input"
                autoComplete="current-password"
                style={{ letterSpacing: showPass ? "normal" : "0.12em",
                  fontSize: showPass ? 14 : 16 }}
              />
              <button type="button" className="he-eye-btn"
                onClick={() => setShowPass(p => !p)}
                title={showPass ? "Hide password" : "Show password"}
                style={{ minHeight: 44 }}>
                {showPass ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <path d="m2 2 20 20"/>
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <Link to="/forgot-password"
              style={{ fontSize: 13, color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="he-submit"
            style={{
              width: "100%", padding: "14px",
              background: loading ? "#374151" : "#111827",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "background .15s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              letterSpacing: "0.01em", minHeight: 50,
            }}>
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)",
                  borderTop: "2px solid #fff", borderRadius: "50%",
                  display: "inline-block", animation: "spin .7s linear infinite" }}/>
                Signing in…
              </>
            ) : `Login →`}
          </button>
        </form>

        {/* ✅ NEW — Gatekeeper login button (mobile only; desktop has it in left panel) */}
        {isMobile && (
          <Link to="/gatekeeper/login" style={{ textDecoration: "none", display: "block", marginTop: 16 }}>
            <button type="button" className="he-gate-btn" style={{
              width: "100%", padding: "13px 16px",
              background: "#fff", color: "#059669",
              border: "1.5px solid #D1FAE5", borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "'Sora', sans-serif", transition: "all .2s", minHeight: 50,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Gatekeeper Login
            </button>
          </Link>
        )}

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9CA3AF" }}>
          Admin?{" "}
          <Link to="/admin/login"
            style={{ color: "#111827", fontWeight: 700, textDecoration: "none" }}>
            Admin login →
          </Link>
        </p>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#D1D5DB", lineHeight: 1.5 }}>
          By continuing, you agree to HostelEase Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;