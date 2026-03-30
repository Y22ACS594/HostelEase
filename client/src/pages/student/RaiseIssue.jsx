// src/pages/student/RaiseIssue.jsx — Fully responsive
import { useState, useEffect, useRef } from "react";
import { raiseIssue, getMyIssues } from "../../services/issueService";
import useIsMobile from "../../hooks/useIsMobile";

if (!document.getElementById("ri-font")) {
  const l = document.createElement("link");
  l.id = "ri-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

const P = { primary: "#2563EB", surface: "#F8FAFF", border: "#E8EEFF", text: "#0F1629", muted: "#6B7A99" };

const CATS = ["Maintenance","Cleanliness","Electrical","Plumbing","Security","Food","Internet","Noise","Other"];
const PRIS = ["Low","Medium","High","Urgent"];

const PRI_CFG = {
  Low:    { color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", icon: "🟢" },
  Medium: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "🟡" },
  High:   { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA", icon: "🟠" },
  Urgent: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: "🔴" },
};

const STAT_CFG = {
  Open:          { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: "🔴" },
  "In Progress": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "🔧" },
  Resolved:      { color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", icon: "✅" },
  Closed:        { color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", icon: "🔒" },
};

const CAT_ICONS = {
  Maintenance: "🔨", Cleanliness: "🧹", Electrical: "⚡",
  Plumbing: "🚿", Security: "🔐", Food: "🍽️",
  Internet: "📡", Noise: "🔊", Other: "📝",
};

const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

function FInput({ label, name, value, onChange, placeholder, required, type = "text" }) {
  const [foc, setFoc] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600,
        color: P.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <input name={name} value={value} onChange={onChange} type={type}
        placeholder={placeholder} required={required}
        style={{ width: "100%", padding: "10px 14px",
          border: `1.5px solid ${foc ? P.primary : P.border}`,
          borderRadius: 12, fontSize: 13, fontFamily: "'Sora',sans-serif",
          color: P.text, background: "#fff", outline: "none",
          boxShadow: foc ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
          transition: "all .15s", boxSizing: "border-box", minHeight: 44 }}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}/>
    </div>
  );
}

function IssueCard({ issue }) {
  const [open, setOpen] = useState(false);
  const p = PRI_CFG[issue.priority] || PRI_CFG.Medium;
  const s = STAT_CFG[issue.status]  || STAT_CFG.Open;
  const catIcon = CAT_ICONS[issue.category] || CAT_ICONS.Other;

  return (
    <div style={{ background: "#fff", borderRadius: 14,
      border: open ? `1.5px solid ${P.primary}` : `1px solid ${P.border}`,
      marginBottom: 10, overflow: "hidden",
      boxShadow: open ? "0 8px 24px rgba(37,99,235,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
      transition: "all .2s" }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ padding: "14px 16px", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: p.bg,
            border: `1px solid ${p.border}`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
            {catIcon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: p.color,
                background: p.bg, border: `1px solid ${p.border}`,
                padding: "2px 7px", borderRadius: 20 }}>
                {p.icon} {issue.priority}
              </span>
              <span style={{ fontSize: 10, color: P.muted, background: "#F3F4F6",
                padding: "2px 7px", borderRadius: 20, fontWeight: 500 }}>
                {issue.category}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: P.text, marginBottom: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {issue.title}
            </div>
            <div style={{ fontSize: 11, color: P.muted }}>{timeAgo(issue.createdAt)}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: s.color,
            background: s.bg, border: `1px solid ${s.border}`,
            padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
            {s.icon} {issue.status}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth="2.5"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "14px 16px", background: "#FAFBFF" }}>
          <div style={{ fontSize: 13, color: P.muted, lineHeight: 1.6, marginBottom: 12 }}>
            {issue.description}
          </div>
          {issue.resolution && (
            <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7",
              borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#065F46",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                ✅ Warden Resolution
              </div>
              <div style={{ fontSize: 13, color: "#065F46", fontWeight: 500, lineHeight: 1.5 }}>
                {issue.resolution}
              </div>
            </div>
          )}
          {issue.resolvedAt && (
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 10 }}>
              Resolved on {new Date(issue.resolvedAt).toLocaleDateString("en-IN",
                { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const RaiseIssue = () => {
  const fileRef     = useRef(null);
  const isMobile    = useIsMobile();
  const [form, setForm] = useState({
    title: "", description: "", category: "Maintenance", priority: "Medium", attachments: [],
  });
  const [preview,    setPreview]    = useState([]);
  const [issues,     setIssues]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg,        setMsg]        = useState("");
  const [tab,        setTab]        = useState("raise");
  const [textFoc,    setTextFoc]    = useState(false);

  const load = async () => {
    try { const r = await getMyIssues(); setIssues(r.data ?? []); }
    catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePhoto = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) return;
      const r = new FileReader();
      r.onload = (ev) => {
        setPreview(p => [...p, ev.target.result]);
        setForm(f => ({ ...f, attachments: [...f.attachments, ev.target.result] }));
      };
      r.readAsDataURL(file);
    });
  };

  const removePhoto = (i) => {
    setPreview(p => p.filter((_, idx) => idx !== i));
    setForm(f => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMsg("");
    try {
      await raiseIssue(form);
      setMsg("success");
      setForm({ title: "", description: "", category: "Maintenance", priority: "Medium", attachments: [] });
      setPreview([]);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to raise issue");
    } finally { setSubmitting(false); }
  };

  const openCount    = issues.filter(i => i.status === "Open").length;
  const inProgCount  = issues.filter(i => i.status === "In Progress").length;
  const resolvedCount= issues.filter(i => i.status === "Resolved").length;

  return (
    <div style={{ minHeight: "100vh", background: P.surface,
      fontFamily: "'Sora',sans-serif", paddingTop: isMobile ? 56 : 0, color: P.text }}>

      <div style={{ maxWidth: isMobile ? "100%" : 720, margin: "0 auto",
        padding: isMobile ? "12px 16px 80px" : "28px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: P.primary,
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Student Portal
          </div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 800, color: P.text }}>
            🔧 Issues & Complaints
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: P.muted }}>
            Raise issues directly to your warden and track their resolution
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Open",        v: openCount,     color: "#DC2626", bg: "#FEF2F2" },
            { label: "In Progress", v: inProgCount,   color: "#D97706", bg: "#FFFBEB" },
            { label: "Resolved",    v: resolvedCount, color: "#059669", bg: "#ECFDF5" },
          ].map(({ label, v, color, bg }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px",
              border: `1px solid ${P.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color }}>{loading ? "…" : v}</div>
              <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 12,
          padding: 4, marginBottom: 20, border: `1px solid ${P.border}`, width: "fit-content" }}>
          {[["raise", "🔧 Raise Issue"], ["history", "📋 My Issues"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding: "9px 18px", borderRadius: 9, border: "none",
                background: tab === k ? P.primary : "none",
                color: tab === k ? "#fff" : P.muted,
                fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 13,
                cursor: "pointer", minHeight: 40 }}>
              {l}
              {k === "history" && issues.length > 0 && (
                <span style={{ marginLeft: 6, background: tab === k ? "rgba(255,255,255,0.3)" : "#E5E7EB",
                  color: tab === k ? "#fff" : "#6B7280", fontSize: 11, borderRadius: 20, padding: "1px 6px" }}>
                  {issues.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Raise Issue Form */}
        {tab === "raise" && (
          <>
            {msg === "success" && (
              <div style={{ background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: 12,
                padding: "12px 16px", marginBottom: 16, color: "#065F46", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8 }}>
                ✅ Issue raised successfully! Warden has been notified.
                <button onClick={() => setMsg("")}
                  style={{ marginLeft: "auto", background: "none", border: "none",
                    cursor: "pointer", color: "#065F46", fontSize: 16 }}>×</button>
              </div>
            )}
            {msg && msg !== "success" && (
              <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 12,
                padding: "12px 16px", marginBottom: 16, color: "#991B1B", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8 }}>
                ❌ {msg}
                <button onClick={() => setMsg("")}
                  style={{ marginLeft: "auto", background: "none", border: "none",
                    cursor: "pointer", color: "#991B1B", fontSize: 16 }}>×</button>
              </div>
            )}

            <form onSubmit={submit}>
              <div style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 16,
                padding: isMobile ? "16px" : "24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 14 }}>

                {/* Title */}
                <div style={{ marginBottom: 16 }}>
                  <FInput label="Title" name="title" value={form.title} onChange={handleChange}
                    placeholder="Brief description of the issue" required/>
                </div>

                {/* Category + Priority */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.muted,
                      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                      Category
                    </label>
                    <select name="category" value={form.category} onChange={handleChange}
                      style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${P.border}`,
                        borderRadius: 12, fontSize: 13, fontFamily: "'Sora',sans-serif",
                        color: P.text, background: "#fff", outline: "none", cursor: "pointer",
                        boxSizing: "border-box", minHeight: 44 }}>
                      {CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.muted,
                      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                      Priority
                    </label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {PRIS.map(pri => {
                        const cfg = PRI_CFG[pri];
                        const sel = form.priority === pri;
                        return (
                          <button key={pri} type="button"
                            onClick={() => setForm(f => ({ ...f, priority: pri }))}
                            style={{ padding: "7px 12px", borderRadius: 10,
                              border: `1.5px solid ${sel ? cfg.color : P.border}`,
                              background: sel ? cfg.bg : "#fff",
                              color: sel ? cfg.color : P.muted,
                              fontFamily: "'Sora',sans-serif", fontSize: 12,
                              fontWeight: 600, cursor: "pointer", minHeight: 36 }}>
                            {cfg.icon} {pri}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.muted,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                    Description <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    rows={4} required placeholder="Describe the issue in detail…"
                    style={{ width: "100%", padding: "10px 14px",
                      border: `1.5px solid ${textFoc ? P.primary : P.border}`,
                      borderRadius: 12, fontSize: 13, fontFamily: "'Sora',sans-serif",
                      color: P.text, background: "#fff", outline: "none", resize: "vertical",
                      boxShadow: textFoc ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
                      transition: "all .15s", boxSizing: "border-box", minHeight: 100 }}
                    onFocus={() => setTextFoc(true)} onBlur={() => setTextFoc(false)}/>
                </div>

                {/* Attachments */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.muted,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                    Photos (optional, max 3)
                  </label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {preview.map((src, i) => (
                      <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
                        <img src={src} alt="" style={{ width: 72, height: 72, borderRadius: 10,
                          objectFit: "cover", border: `1px solid ${P.border}` }}/>
                        <button type="button" onClick={() => removePhoto(i)}
                          style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20,
                            borderRadius: "50%", background: "#DC2626", border: "2px solid #fff",
                            cursor: "pointer", fontSize: 10, color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                      </div>
                    ))}
                    {preview.length < 3 && (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        style={{ width: 72, height: 72, borderRadius: 10,
                          border: `2px dashed ${P.border}`, background: P.surface,
                          cursor: "pointer", display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", gap: 4,
                          color: P.muted, fontSize: 10, fontFamily: "'Sora',sans-serif" }}>
                        <span style={{ fontSize: 22 }}>📷</span>
                        Add
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" multiple
                      onChange={handlePhoto} style={{ display: "none" }}/>
                  </div>
                  <div style={{ fontSize: 11, color: P.muted, marginTop: 6 }}>
                    JPG/PNG, max 2MB each
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting || !form.title || !form.description}
                style={{ width: "100%", padding: "14px",
                  background: submitting || !form.title || !form.description ? "#E5E7EB" : P.primary,
                  color: submitting || !form.title || !form.description ? "#9CA3AF" : "#fff",
                  border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700,
                  cursor: submitting || !form.title || !form.description ? "not-allowed" : "pointer",
                  fontFamily: "'Sora',sans-serif", minHeight: 50,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {submitting ? (
                  <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)",
                    borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block",
                    animation: "ri-spin .7s linear infinite" }}/>
                  Submitting…</>
                ) : "Submit Issue →"}
              </button>
              <style>{`@keyframes ri-spin { to { transform: rotate(360deg) } }`}</style>
            </form>
          </>
        )}

        {/* Issues History */}
        {tab === "history" && (
          <>
            <div style={{ fontSize: 12, color: P.muted, marginBottom: 12 }}>
              {issues.length} issue{issues.length !== 1 ? "s" : ""} total
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px", color: P.muted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <div>Loading…</div>
              </div>
            ) : issues.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", color: P.muted,
                background: "#fff", borderRadius: 14, border: `1px solid ${P.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>No issues yet</div>
                <button onClick={() => setTab("raise")}
                  style={{ padding: "10px 20px", background: P.primary, color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
                  Raise your first issue
                </button>
              </div>
            ) : (
              issues.map(issue => <IssueCard key={issue._id} issue={issue}/>)
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RaiseIssue;
