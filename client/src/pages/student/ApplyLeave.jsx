// src/pages/student/ApplyLeave.jsx — Fixed + Fully responsive mobile + desktop
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applyLeave }  from "../../services/leaveService";
import { useAuth }     from "../../context/AuthContext";

if (!document.getElementById("al-font")) {
  const l = document.createElement("link");
  l.id = "al-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

/* ── useIsMobile (inline — no external hook needed) ── */
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

const LEAVE_TYPES = [
  { v: "Casual",    label: "Casual Leave",    color: "#2563EB", bg: "#EFF6FF", icon: "🏖️", desc: "Personal time off for non-medical reasons" },
  { v: "Medical",   label: "Medical Leave",   color: "#DC2626", bg: "#FEF2F2", icon: "🏥", desc: "Health-related absence with medical support" },
  { v: "Emergency", label: "Emergency Leave", color: "#D97706", bg: "#FEF9C3", icon: "⚡", desc: "Urgent unforeseen personal situations" },
  { v: "Home",      label: "Home Leave",      color: "#059669", bg: "#ECFDF5", icon: "🏠", desc: "Visiting family or home town" },
  { v: "Event",     label: "Event Leave",     color: "#7C3AED", bg: "#F5F3FF", icon: "🎓", desc: "Academic events, competitions or conferences" },
];

const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MOS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_H   = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const C = { primary: "#2563EB", surface: "#F8FAFF", border: "#E8EEFF", text: "#0F1629", muted: "#6B7A99" };

const calcDays  = (f, t) => { if (!f || !t) return 0; const d = Math.ceil((new Date(t) - new Date(f)) / 86400000) + 1; return d < 0 ? 0 : d; };
const toISO     = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const fmtFull   = (iso) => { if (!iso) return "—"; const d = new Date(iso + "T00:00:00"); return `${d.getDate()} ${MOS[d.getMonth()]} ${d.getFullYear()}`; };
const monFirst  = (d) => (d.getDay() + 6) % 7;
const isoToDate = (iso) => iso ? new Date(iso + "T00:00:00") : null;
const inputSt   = (foc, err) => ({
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${err ? "#DC2626" : foc ? C.primary : "#E5E7EB"}`,
  borderRadius: 11, fontSize: 13, fontFamily: "'Sora',sans-serif",
  color: C.text, background: "#fff", outline: "none",
  boxShadow: err ? "0 0 0 3px rgba(220,38,38,.10)" : foc ? "0 0 0 3px rgba(37,99,235,.10)" : "none",
  transition: "border-color .14s,box-shadow .14s", boxSizing: "border-box",
});

/* ──────────────────────────────────────────────
   Sub-components defined OUTSIDE the main component
   so React never unmounts/remounts them on re-render.
   This is the fix for the "one character" input bug.
────────────────────────────────────────────── */

function FInput({ value, onChange, type = "text", placeholder, required, multiline, rows, err }) {
  const [foc, setFoc] = useState(false);
  const s = inputSt(foc, err);
  if (multiline) return (
    <textarea value={value} onChange={onChange} rows={rows || 4} required={required}
      placeholder={placeholder}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ ...s, resize: "vertical", minHeight: 80 }}/>
  );
  return (
    <input type={type} value={value} onChange={onChange} required={required}
      placeholder={placeholder}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={s}/>
  );
}

function RangeCalendar({ from, to, onChange }) {
  const seed = from ? new Date(from + "T00:00:00") : new Date();
  const [yr, setYr] = useState(seed.getFullYear());
  const [mo, setMo] = useState(seed.getMonth());
  const [hov, setHov] = useState(null);
  const fromD = isoToDate(from), toD = isoToDate(to);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const totalD = new Date(yr, mo + 1, 0).getDate();
  const offset = monFirst(new Date(yr, mo, 1));
  const cells  = Array(offset).fill(null).concat(Array.from({ length: totalD }, (_, i) => i + 1));

  const prev = () => mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1);
  const next = () => mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1);

  const click = (d) => {
    const iso  = toISO(yr, mo, d);
    const date = new Date(yr, mo, d);
    if (date < today) return;
    if (!from || (from && to)) { onChange(iso, ""); }
    else {
      const cd = new Date(iso + "T00:00:00");
      onChange(cd < fromD ? iso : from, cd < fromD ? "" : iso);
    }
  };

  const inRange = (d) => {
    const date = new Date(yr, mo, d);
    const end  = hov ? new Date(hov + "T00:00:00") : toD;
    return fromD && end ? date > fromD && date < end : false;
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button type="button" onClick={prev}
          style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 16 }}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{MONTHS[mo]} {yr}</span>
        <button type="button" onClick={next}
          style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 16 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {DAY_H.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700,
            color: d === "SAT" || d === "SUN" ? "#9CA3AF" : "#6B7280", padding: "4px 0", textTransform: "uppercase" }}>
            {d.slice(0, 2)}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i}/>;
          const isFrom = fromD && new Date(yr, mo, d).toDateString() === fromD.toDateString();
          const isTo   = toD   && new Date(yr, mo, d).toDateString() === toD.toDateString();
          const range  = inRange(d);
          const past   = new Date(yr, mo, d) < today;
          const isTdy  = new Date(yr, mo, d).toDateString() === today.toDateString();
          let bg = "transparent", color = past ? "#D1D5DB" : isTdy ? C.primary : "#374151", br = "8px";
          if (range) { bg = "#DBEAFE"; color = "#1D4ED8"; br = "0"; }
          if (isFrom) { bg = C.primary; color = "#fff"; br = "8px 0 0 8px"; }
          if (isTo)   { bg = C.primary; color = "#fff"; br = "0 8px 8px 0"; }
          if (isFrom && isTo) { bg = C.primary; color = "#fff"; br = "8px"; }
          return (
            <div key={i} onClick={() => !past && click(d)}
              onMouseEnter={() => { if (from && !to) setHov(toISO(yr, mo, d)); }}
              onMouseLeave={() => setHov(null)}
              style={{ textAlign: "center", padding: "8px 2px", fontSize: 13, fontWeight: isFrom || isTo ? 700 : 500,
                background: bg, color, borderRadius: br, cursor: past ? "default" : "pointer",
                transition: "background .1s", userSelect: "none" }}>
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepBar({ step, isMobile }) {
  const steps = ["Select Type & Dates", "Leave Details"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16,
      marginBottom: isMobile ? 20 : 0 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: i < step ? C.primary : i === step ? "#EFF6FF" : "#F3F4F6",
            color: i < step ? "#fff" : i === step ? C.primary : "#9CA3AF",
            border: i === step ? `2px solid ${C.primary}` : "2px solid transparent",
          }}>
            {i < step ? "✓" : i + 1}
          </div>
          {!isMobile && <span style={{ fontSize: 12, fontWeight: i === step ? 700 : 500,
            color: i === step ? C.text : "#9CA3AF" }}>{s}</span>}
          {i < steps.length - 1 && (
            <div style={{ width: isMobile ? 20 : 40, height: 2,
              background: i < step ? C.primary : "#E5E7EB", borderRadius: 2 }}/>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Desktop header (defined OUTSIDE main component) ── */
function DesktopHeader({ onBack, step }) {
  return (
    <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`,
      padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack}
          style={{ padding: "8px 14px", background: "#F9FAFB", border: `1px solid ${C.border}`,
            borderRadius: 10, fontSize: 13, cursor: "pointer", color: C.muted, fontFamily: "'Sora',sans-serif" }}>
          ← Back
        </button>
        <div>
          <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Student Portal</div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>Apply for Leave</h1>
        </div>
      </div>
      <StepBar step={step} isMobile={false}/>
    </div>
  );
}

function MobileHeader({ onBack, step }) {
  return (
    <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <button onClick={onBack}
        style={{ padding: "8px 12px", background: "#fff", border: `1px solid ${C.border}`,
          borderRadius: 10, fontSize: 13, cursor: "pointer", color: C.muted, fontFamily: "'Sora',sans-serif" }}>
        ←
      </button>
      <StepBar step={step} isMobile={true}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT — PageWrap removed, layout inlined
══════════════════════════════════════════════════ */
export default function ApplyLeave() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  const [step,        setStep]    = useState(0);
  const [leaveType,   setLType]   = useState("");
  const [from,        setFrom]    = useState("");
  const [to,          setTo]      = useState("");
  const [reason,      setReason]  = useState("");
  const [destination, setDest]    = useState("");
  const [contact,     setContact] = useState("");
  const [loading,     setLoading] = useState(false);
  const [success,     setSuccess] = useState(false);
  const [error,       setError]   = useState("");
  const [errors,      setErrors]  = useState({});

  const days    = calcDays(from, to);
  const selType = LEAVE_TYPES.find(t => t.v === leaveType);

  const validate1 = () => {
    const e = {};
    if (!leaveType) e.leaveType = "Please select a leave type";
    if (!from)      e.from = "Please select start date";
    if (!to)        e.to   = "Please select end date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate2 = () => {
    const e = {};
    if (!reason.trim() || reason.trim().length < 10) e.reason = "Please enter at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate2()) return;
    setLoading(true); setError("");
    try {
      await applyLeave({ leaveType, fromDate: from, toDate: to, reason, destination: destination || "", emergencyContact: contact || "" });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit leave request.");
    } finally { setLoading(false); }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: C.surface, fontFamily: "'Sora',sans-serif", padding: 20 }}>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20,
          padding: "40px 32px", maxWidth: 400, width: "100%", textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>Leave Request Submitted!</h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
            Your {leaveType} leave request for {days} days has been submitted. You'll be notified once it's reviewed.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setSuccess(false); setStep(0); setLType(""); setFrom(""); setTo(""); setReason(""); }}
              style={{ padding: "10px 20px", background: C.primary, color: "#fff", border: "none",
                borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
              Apply Another
            </button>
            <button onClick={() => navigate("/student/leave-status")}
              style={{ padding: "10px 20px", background: "#EFF6FF", color: C.primary,
                border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
              View Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBack0 = () => navigate("/student/dashboard");
  const handleBack1 = () => setStep(0);

  /* ── STEP 0: Select type + dates ── */
  if (step === 0) {
    return (
      <div style={{ minHeight: "100vh", background: C.surface, fontFamily: "'Sora',sans-serif",
        paddingTop: isMobile ? 0 : 0 }}>
        {isMobile
          ? <MobileHeader onBack={handleBack0} step={step}/>
          : <DesktopHeader onBack={handleBack0} step={step}/>}

        <div style={{ maxWidth: isMobile ? "100%" : 1100, margin: "0 auto",
          padding: isMobile ? "16px 16px 80px" : "24px 32px",
          display: isMobile ? "block" : "grid",
          gridTemplateColumns: "280px 1fr 280px", gap: 20 }}>

          {/* Leave type selector */}
          <div>
            {!isMobile && <div style={{ fontSize: 11, fontWeight: 700, color: C.muted,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              STEP 1 — CHOOSE LEAVE TYPE
            </div>}
            {isMobile && <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Choose Leave Type</div>}
            <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column",
              gap: 8, overflowX: isMobile ? "auto" : "visible",
              paddingBottom: isMobile ? 4 : 0 }}>
              {LEAVE_TYPES.map(t => (
                <button key={t.v} type="button" onClick={() => setLType(t.v)}
                  style={{
                    padding: isMobile ? "12px 16px" : "14px 16px",
                    borderRadius: 14, cursor: "pointer", textAlign: "left",
                    border: `2px solid ${leaveType === t.v ? t.color : "#E5E7EB"}`,
                    background: leaveType === t.v ? t.bg : "#fff",
                    transition: "all .15s", flexShrink: 0,
                    minWidth: isMobile ? 140 : "auto",
                    fontFamily: "'Sora',sans-serif",
                  }}>
                  <div style={{ fontSize: isMobile ? 20 : 24, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: leaveType === t.v ? t.color : C.text }}>
                    {t.label}
                  </div>
                  {!isMobile && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>{t.desc}</div>}
                </button>
              ))}
            </div>
            {errors.leaveType && <div style={{ color: "#DC2626", fontSize: 12, marginTop: 6 }}>{errors.leaveType}</div>}
          </div>

          {/* Calendar */}
          <div>
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
              padding: isMobile ? "16px" : "20px", marginTop: isMobile ? 16 : 0,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                SELECT DATE RANGE
              </div>
              <RangeCalendar from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }}/>
              {(errors.from || errors.to) && (
                <div style={{ color: "#DC2626", fontSize: 12, marginTop: 8 }}>
                  {errors.from || errors.to}
                </div>
              )}
              <div style={{ marginTop: 12, fontSize: 12, color: C.muted,
                background: C.surface, borderRadius: 10, padding: "10px 12px" }}>
                Click start date, then end date to select a range.
              </div>
            </div>
          </div>

          {/* Summary + Next */}
          <div>
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
              padding: isMobile ? "16px" : "20px", marginTop: isMobile ? 16 : 0,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                REQUEST SUMMARY
              </div>
              {selType ? (
                <div style={{ padding: "10px 12px", borderRadius: 12,
                  background: selType.bg, border: `1px solid ${selType.color}22`, marginBottom: 14 }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{selType.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selType.color }}>{selType.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{selType.desc}</div>
                </div>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: C.muted, fontSize: 13,
                  background: C.surface, borderRadius: 12, marginBottom: 14 }}>
                  Select a leave type
                </div>
              )}
              {[["From", from ? fmtFull(from) : "—"],
                ["To",   to   ? fmtFull(to)   : "—"],
                ["Duration", days > 0 ? `${days} day${days > 1 ? "s" : ""}` : "—"]
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{v}</span>
                </div>
              ))}
            </div>

            <button type="button"
              onClick={() => { if (validate1()) setStep(1); }}
              style={{
                width: "100%", marginTop: 14, padding: "14px",
                background: leaveType && from && to ? C.primary : "#E5E7EB",
                color: leaveType && from && to ? "#fff" : "#9CA3AF",
                border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700,
                cursor: leaveType && from && to ? "pointer" : "not-allowed",
                fontFamily: "'Sora',sans-serif", minHeight: 50,
                transition: "all .15s",
              }}>
              Next: Leave Details →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP 1: Details ── */
  return (
    <div style={{ minHeight: "100vh", background: C.surface, fontFamily: "'Sora',sans-serif" }}>
      {isMobile
        ? <MobileHeader onBack={handleBack1} step={step}/>
        : <DesktopHeader onBack={handleBack1} step={step}/>}

      <div style={{ maxWidth: isMobile ? "100%" : 640, margin: "0 auto",
        padding: isMobile ? "16px 16px 80px" : "24px 32px" }}>
        {/* Summary banner */}
        {selType && (
          <div style={{ display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", borderRadius: 14,
            background: selType.bg, border: `1px solid ${selType.color}33`, marginBottom: 20 }}>
            <span style={{ fontSize: 24 }}>{selType.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: selType.color }}>{selType.label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {fmtFull(from)} → {fmtFull(to)} · {days} day{days > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        )}

        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
          padding: isMobile ? "20px 16px" : "28px 24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: C.text }}>
            📝 Leave Details
          </h3>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted,
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              Reason <span style={{ color: "#DC2626" }}>*</span>
            </label>
            {/* ✅ Direct controlled textarea — no wrapper, no re-mount issue */}
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              required
              placeholder="Describe the reason for your leave (at least 10 characters)..."
              style={{
                ...inputSt(false, !!errors.reason),
                resize: "vertical", minHeight: 80,
                border: `1.5px solid ${errors.reason ? "#DC2626" : "#E5E7EB"}`,
              }}
            />
            {errors.reason && <div style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }}>{errors.reason}</div>}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted,
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              Destination (optional)
            </label>
            <input
              type="text"
              value={destination}
              onChange={e => setDest(e.target.value)}
              placeholder="Where will you be going?"
              style={inputSt(false, false)}
            />
          </div>

          <div style={{ marginBottom: 4 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted,
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              Contact during leave (optional)
            </label>
            <input
              type="tel"
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="Phone number during leave"
              style={inputSt(false, false)}
            />
          </div>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12,
            padding: "12px 16px", fontSize: 13, color: "#991B1B", marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => setStep(0)}
            style={{ flex: 1, padding: "14px", background: "#fff",
              border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14,
              cursor: "pointer", color: C.muted, fontFamily: "'Sora',sans-serif", minHeight: 50 }}>
            ← Back
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            style={{ flex: 2, padding: "14px", background: loading ? "#93C5FD" : C.primary,
              color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Sora',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 50 }}>
            {loading ? (
              <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)",
                borderTop: "2px solid #fff", borderRadius: "50%",
                display: "inline-block", animation: "al-spin .7s linear infinite" }}/>
              Submitting…</>
            ) : "Submit Leave Request ✓"}
          </button>
        </div>
        <style>{`@keyframes al-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
}