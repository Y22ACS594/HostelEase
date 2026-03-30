// pages/admin/CreateWarden.jsx — Mobile + Desktop responsive
import { useState, useEffect } from "react";
import api from "../../services/api";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

if (!document.getElementById("cw-font")) {
  const l = document.createElement("link");
  l.id = "cw-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

const P = {
  primary: "#059669", surface: "#F0FDF4", border: "#D1FAE5",
  text: "#0F1629", muted: "#6B7A99",
};

const inputSt = (foc, err) => ({
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${err ? "#DC2626" : foc ? P.primary : "#E5E7EB"}`,
  borderRadius: 11, fontSize: 13, fontFamily: "'Sora',sans-serif",
  color: P.text, background: "#fff", outline: "none",
  boxShadow: err ? "0 0 0 3px rgba(220,38,38,.10)" : foc ? "0 0 0 3px rgba(5,150,105,.10)" : "none",
  transition: "border-color .14s,box-shadow .14s", boxSizing: "border-box",
});

function SInput({ value, onChange, type = "text", placeholder, required, name }) {
  const [foc, setFoc] = useState(false);
  return (
    <input name={name} type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      style={inputSt(foc, false)}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}/>
  );
}

const CreateWarden = () => {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    phone: "", department: "", employeeId: "",
  });
  const [msg,     setMsg]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [foc,     setFoc]     = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      await api.post("/admin/warden", form);
      setMsg("success");
      setForm({ name: "", email: "", password: "", phone: "", department: "", employeeId: "" });
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: P.surface,
      fontFamily: "'Sora',sans-serif", color: P.text,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: isMobile ? "16px 0 80px" : "40px 24px" }}>

      <div style={{
        background: "#fff", borderRadius: isMobile ? 0 : 24,
        width: "100%", maxWidth: isMobile ? "100%" : 560,
        border: isMobile ? "none" : `1px solid ${P.border}`,
        boxShadow: isMobile ? "none" : "0 4px 24px rgba(0,0,0,0.07)",
        overflow: "hidden",
      }}>

        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(135deg,#059669,#047857)",
          padding: isMobile ? "24px 20px" : "28px 32px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              👷
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                HostelEase · Admin Portal
              </div>
              <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 22, fontWeight: 800, color: "#fff" }}>
                Create New Warden
              </h2>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Add a new hostel warden with system access
          </p>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: isMobile ? "20px 16px" : "28px 32px" }}>

          {/* Success banner */}
          {msg === "success" && (
            <div style={{ background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: 12,
              padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#065F46",
              fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>✅</span>
              Warden account created successfully!
              <button onClick={() => setMsg("")}
                style={{ marginLeft: "auto", background: "none", border: "none",
                  cursor: "pointer", color: "#065F46", fontSize: 16 }}>×</button>
            </div>
          )}

          {/* Error banner */}
          {msg && msg !== "success" && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 12,
              padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#991B1B",
              fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>❌</span>
              {msg}
              <button onClick={() => setMsg("")}
                style={{ marginLeft: "auto", background: "none", border: "none",
                  cursor: "pointer", color: "#991B1B", fontSize: 16 }}>×</button>
            </div>
          )}

          <form onSubmit={submit}>
            {/* Grid: 2 cols on desktop, 1 col on mobile */}
            <div style={{ display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16, marginBottom: 16 }}>

              {/* Warden Name */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: P.muted,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                  Warden Name <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <SInput name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Rajesh Kumar" required/>
              </div>

              {/* Employee ID */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: P.muted,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                  Employee ID
                </label>
                <SInput name="employeeId" value={form.employeeId} onChange={handleChange}
                  placeholder="e.g. WRD-001"/>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: P.muted,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                  Email Address <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <SInput name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="warden@hostel.com" required/>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: P.muted,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                  Phone Number
                </label>
                <SInput name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="10-digit number"/>
              </div>

              {/* Password */}
              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: P.muted,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                  Temporary Password <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input name="password" type={showPw ? "text" : "password"}
                    value={form.password} onChange={handleChange}
                    placeholder="Min 8 characters" required
                    style={{ ...inputSt(false, false), paddingRight: 44 }}/>
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: P.muted, fontSize: 16, padding: 4 }}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Department */}
              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: P.muted,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                  Department / Block
                </label>
                <div style={{ position: "relative" }}>
                  <select name="department" value={form.department} onChange={handleChange}
                    style={{ ...inputSt(false, false), appearance: "none", cursor: "pointer", paddingRight: 36 }}>
                    <option value="">Select block or department</option>
                    {["Block A","Block B","Block C","Main Hostel","Girls Hostel","Boys Hostel","All Blocks"].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    pointerEvents: "none", color: P.muted, fontSize: 10 }}>▼</span>
                </div>
              </div>
            </div>

            {/* Info strip */}
            <div style={{ background: "#F0FDF4", border: "1px solid #D1FAE5", borderRadius: 10,
              padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#065F46",
              display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
              <span>The warden will receive an email to set their own password. The temporary password is for first-time login only.</span>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(5,150,105,0.5)" : "linear-gradient(135deg,#059669,#047857)",
                border: "none", borderRadius: 14,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14, fontWeight: 700, color: "#fff",
                fontFamily: "'Sora',sans-serif",
                boxShadow: loading ? "none" : "0 4px 16px rgba(5,150,105,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                minHeight: 50, transition: "all .15s",
              }}>
              {loading ? (
                <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)",
                  borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block",
                  animation: "cw-spin .7s linear infinite" }}/>
                Creating Warden…</>
              ) : "👷 Create Warden Account"}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes cw-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

export default CreateWarden;