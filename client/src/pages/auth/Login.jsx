import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

/* ─── SVG Icons ─────────────────────────────── */
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const StudentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
const WardenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const TrendUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

/* ─── Dashboard Preview Data ─────────────────── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const LEAVE_DATA = {
  medical:   [12, 18, 14, 22, 16, 28, 24, 19, 15, 21, 17, 13],
  emergency: [5,  8,  6,  10, 7,  14, 11, 9,  6,  8,  5,  7],
  casual:    [20, 25, 22, 30, 27, 35, 32, 28, 24, 29, 26, 23],
};
const maxVal = Math.max(...LEAVE_DATA.casual);

const MiniBarChart = () => (
  <div className="pv-chart-wrap">
    <div className="pv-chart-legend">
      <span><span className="pv-leg-dot" style={{background:"#6366f1"}} />Medical</span>
      <span><span className="pv-leg-dot" style={{background:"#f59e0b"}} />Emergency</span>
      <span><span className="pv-leg-dot" style={{background:"#10b981"}} />Casual</span>
    </div>
    <div className="pv-bars-grid">
      {MONTHS.map((m, i) => (
        <div key={m} className="pv-bar-col">
          <div className="pv-bar-group">
            <div className="pv-bar" style={{ height:`${(LEAVE_DATA.casual[i]/maxVal)*100}%`,    background:"linear-gradient(180deg,#10b981,#059669)", animationDelay:`${i*55}ms` }} />
            <div className="pv-bar" style={{ height:`${(LEAVE_DATA.medical[i]/maxVal)*100}%`,   background:"linear-gradient(180deg,#818cf8,#6366f1)", animationDelay:`${i*55+18}ms` }} />
            <div className="pv-bar" style={{ height:`${(LEAVE_DATA.emergency[i]/maxVal)*100}%`, background:"linear-gradient(180deg,#fbbf24,#f59e0b)", animationDelay:`${i*55+36}ms` }} />
          </div>
          <span className="pv-bar-label">{m}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Role mismatch messages ─────────────────── */
const ROLE_MISMATCH = {
  warden:  "These credentials belong to a Warden account. Switch to the Warden tab.",
  student: "These credentials belong to a Student account. Switch to the Student tab.",
  admin:   "This is an Admin account. Please use the Admin Login link below.",
};

/* ═══════════════════════════════════════════════
   LOGIN COMPONENT
═══════════════════════════════════════════════ */
const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [selectedRole, setSelectedRole] = useState("student");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPass,     setShowPass]     = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [focused,      setFocused]      = useState("");
  const [activeTab,    setActiveTab]    = useState("leaves");

  const navigateByRole = (role) => {
    if (role === "student")     navigate("/student/dashboard");
    else if (role === "warden") navigate("/warden/dashboard");
    else if (role === "admin")  navigate("/admin/dashboard");
    else navigate("/");
  };

  const handleRoleChange = (r) => { setSelectedRole(r); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const resolvedRole = await login(email, password);
      if (resolvedRole !== selectedRole && resolvedRole !== "admin") {
        setError(ROLE_MISMATCH[resolvedRole] ?? "Account role mismatch. Select the correct tab.");
        return;
      }
      navigateByRole(resolvedRole);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <div className="he-root">

      {/* ══ LEFT — LOGIN FORM ══ */}
      <div className="he-left">
        <div className="he-left-inner">

          {/* Logo */}
          <div className="he-logo">
            <span className="he-logo-icon">🏠</span>
            <span className="he-logo-text">HostelEase</span>
          </div>

          <h1 className="he-title">Welcome back</h1>
          <p className="he-sub">Sign in to continue to your dashboard</p>

          {/* Role Toggle */}
          <div className="he-role-wrap">
            <button type="button"
              className={`he-role ${selectedRole === "student" ? "active" : ""}`}
              onClick={() => handleRoleChange("student")}>
              <StudentIcon /> Student
            </button>
            <button type="button"
              className={`he-role ${selectedRole === "warden" ? "active" : ""}`}
              onClick={() => handleRoleChange("warden")}>
              <WardenIcon /> Warden
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="he-err" role="alert" key={error}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="he-form" noValidate>

            <div className="he-field">
              <label htmlFor="hf-email">Email</label>
              <div className={`he-input-wrap ${focused === "email" ? "focused" : ""}`}>
                <span className="he-ico"><MailIcon /></span>
                <input
                  id="hf-email" type="email"
                  placeholder={selectedRole === "student" ? "student@college.edu" : "warden@hostel.edu"}
                  value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  required autoComplete="email"
                />
              </div>
            </div>

            <div className="he-field">
              <label htmlFor="hf-pass">Password</label>
              <div className={`he-input-wrap ${focused === "password" ? "focused" : ""}`}>
                <span className="he-ico"><LockIcon /></span>
                <input
                  id="hf-pass" type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  required autoComplete="current-password"
                />
                <button type="button" className="he-eye" onClick={() => setShowPass(p => !p)}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
              <div className="he-forgot-row">
                <Link to="/forgot-password" className="he-forgot">Forgot Password?</Link>
              </div>
            </div>

            <button
              type="submit"
              className={`he-btn-primary ${loading ? "busy" : ""}`}
              disabled={loading}
            >
              {loading ? <><span className="he-spin" /> Signing in…</> : "Sign in"}
            </button>

          </form>

          <p className="he-bottom">
            Admin? <Link to="/admin/login" className="he-link">Admin login →</Link>
          </p>

        </div>
      </div>

      {/* ══ RIGHT — DASHBOARD PREVIEW ══ */}
      <div className="he-right">
        <div className="he-preview">

          <div className="pv-topbar">
            <div>
              <p className="pv-gday">Good Morning, HostelEase 👋</p>
              <p className="pv-gsub">Summary of the complete data set</p>
            </div>
            <span className="pv-week-tag">This Month</span>
          </div>

          {/* Stat cards */}
          <div className="pv-stats">
            <div className="pv-stat-card">
              <p className="pv-stat-label">Total Students</p>
              <div className="pv-stat-value-row">
                <span className="pv-stat-num">486</span>
                <span className="pv-stat-badge green"><TrendUpIcon />+5.2%</span>
              </div>
            </div>
            <div className="pv-stat-card dark">
              <p className="pv-stat-label light">Total Rooms</p>
              <div className="pv-stat-value-row">
                <span className="pv-stat-num light">240</span>
                <span className="pv-stat-badge yellow"><TrendUpIcon />+2.1%</span>
              </div>
            </div>
            <div className="pv-stat-card">
              <p className="pv-stat-label">Occupancy</p>
              <div className="pv-stat-value-row">
                <span className="pv-stat-num">94<span className="pv-pct">%</span></span>
                <span className="pv-stat-badge green"><TrendUpIcon />+1.8%</span>
              </div>
            </div>
            <div className="pv-stat-card">
              <p className="pv-stat-label">Pending Fees</p>
              <div className="pv-stat-value-row">
                <span className="pv-stat-num">₹2.4k</span>
                <span className="pv-stat-badge red">12 due</span>
              </div>
            </div>
          </div>

          {/* Chart section */}
          <div className="pv-section">
            <div className="pv-tabs">
              {["leaves","rooms","fees"].map(t => (
                <button key={t}
                  className={`pv-tab ${activeTab === t ? "active" : ""}`}
                  onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="pv-chart-title">
              {activeTab === "leaves" && "Leave Requests — Monthly Overview"}
              {activeTab === "rooms"  && "Room Occupancy — Monthly Overview"}
              {activeTab === "fees"   && "Fee Collection — Monthly Overview"}
            </div>
            <MiniBarChart />
          </div>

          {/* Leave breakdown */}
          <div className="pv-leave-types">
            <p className="pv-lt-heading">Leave Summary</p>
            <div className="pv-lt-row">
              <span className="pv-lt-dot" style={{background:"#6366f1"}} />
              <span className="pv-lt-name">Medical Leave</span>
              <div className="pv-lt-bar-wrap"><div className="pv-lt-bar" style={{width:"62%",background:"#6366f1"}} /></div>
              <span className="pv-lt-count">186</span>
            </div>
            <div className="pv-lt-row">
              <span className="pv-lt-dot" style={{background:"#f59e0b"}} />
              <span className="pv-lt-name">Emergency</span>
              <div className="pv-lt-bar-wrap"><div className="pv-lt-bar" style={{width:"32%",background:"#f59e0b"}} /></div>
              <span className="pv-lt-count">96</span>
            </div>
            <div className="pv-lt-row">
              <span className="pv-lt-dot" style={{background:"#10b981"}} />
              <span className="pv-lt-name">Casual Leave</span>
              <div className="pv-lt-bar-wrap"><div className="pv-lt-bar" style={{width:"84%",background:"#10b981"}} /></div>
              <span className="pv-lt-count">251</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;