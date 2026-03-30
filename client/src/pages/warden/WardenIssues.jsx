// src/pages/warden/WardenIssues.jsx — Fully responsive
import { useState, useEffect, useCallback } from "react";
import { getAllIssues, getIssueStats, updateIssueStatus } from "../../services/issueService";
import useIsMobile from "../../hooks/useIsMobile";

if (!document.getElementById("wi-font")) {
  const l = document.createElement("link");
  l.id = "wi-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(l);
}

const P = { primary: "#059669", surface: "#F0FDF4", border: "#D1FAE5", text: "#0F1629", muted: "#6B7A99" };

const PRI_CFG = {
  Low:    { color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", icon: "🟢", order: 4 },
  Medium: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "🟡", order: 3 },
  High:   { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA", icon: "🟠", order: 2 },
  Urgent: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: "🔴", order: 1 },
};

const STAT_CFG = {
  Open:          { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: "🔴" },
  "In Progress": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "🔧" },
  Resolved:      { color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", icon: "✅" },
  Closed:        { color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", icon: "🔒" },
};

const CAT_ICONS = { Maintenance: "🔨", Internet: "📡", Plumbing: "🚿", Electrical: "⚡", Cleanliness: "🧹", Security: "🔐", Other: "📝" };

const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// ── Resolve Modal ──
function ResolveModal({ issue, onClose, onSave }) {
  const [status,     setStatus]     = useState(issue.status === "Open" ? "In Progress" : "Resolved");
  const [resolution, setResolution] = useState(issue.resolution || "");
  const [saving,     setSaving]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(issue._id, { status, resolution });
    setSaving(false);
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(15,22,41,0.55)",
        backdropFilter: "blur(4px)", zIndex: 200, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
        fontFamily: "'Sora',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440,
        overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ background: "linear-gradient(135deg,#059669,#047857)", padding: "20px 24px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Update Issue Status</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{issue.title}</div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: P.muted,
              textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
              New Status
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {["In Progress", "Resolved", "Closed", "Open"].map(s => {
                const cfg = STAT_CFG[s];
                const sel = status === s;
                return (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    style={{ padding: "10px", borderRadius: 12,
                      border: `1.5px solid ${sel ? cfg.color : P.border}`,
                      background: sel ? cfg.bg : "#fff",
                      color: sel ? cfg.color : P.muted,
                      fontFamily: "'Sora',sans-serif", fontSize: 13,
                      fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6, minHeight: 44 }}>
                    {cfg.icon} {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: P.muted,
              textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>
              Resolution / Remarks
            </label>
            <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3}
              placeholder="Describe what was done to fix the issue…"
              style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${P.border}`,
                borderRadius: 12, fontSize: 13, fontFamily: "'Sora',sans-serif",
                color: P.text, background: "#fff", outline: "none",
                resize: "vertical", boxSizing: "border-box" }}/>
            <div style={{ fontSize: 11, color: P.muted, marginTop: 4 }}>
              This message will be sent to the student via notification.
            </div>
          </div>
        </div>
        <div style={{ padding: "0 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose}
            style={{ padding: "10px 20px", border: `1.5px solid ${P.border}`, borderRadius: 12,
              background: "none", cursor: "pointer", fontSize: 13, color: P.muted,
              fontFamily: "'Sora',sans-serif", minHeight: 44 }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "10px 22px", background: saving ? "rgba(5,150,105,0.5)" : P.primary,
              border: "none", borderRadius: 12, cursor: saving ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'Sora',sans-serif",
              display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
            {saving ? "Saving…" : "✓ Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Issue Card ──
function IssueCard({ issue, onUpdate, isMobile }) {
  const [expanded, setExpanded] = useState(false);
  const [modal,    setModal]    = useState(false);
  const pri  = PRI_CFG[issue.priority]  || PRI_CFG.Medium;
  const stat = STAT_CFG[issue.status]   || STAT_CFG.Open;
  const student = issue.student?.fullName ?? "Unknown";
  const roll    = issue.student?.rollNumber ?? "";
  const dept    = issue.student?.department ?? "";
  const catIcon = CAT_ICONS[issue.category] || CAT_ICONS.Other;

  return (
    <>
      {modal && (
        <ResolveModal issue={issue}
          onClose={() => setModal(false)}
          onSave={async (id, data) => { await onUpdate(id, data); setModal(false); }}/>
      )}
      <div style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 14,
        padding: "14px 16px", marginBottom: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10,
            background: pri.bg, border: `1px solid ${pri.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0 }}>
            {catIcon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: P.text,
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {issue.title}
            </div>
            <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>
              {student} {roll ? `· ${roll}` : ""} {dept ? `· ${dept}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
              background: pri.bg, color: pri.color, border: `1px solid ${pri.border}` }}>
              {pri.icon} {issue.priority}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
              background: stat.bg, color: stat.color, border: `1px solid ${stat.border}` }}>
              {stat.icon} {issue.status}
            </span>
          </div>
        </div>

        {/* Category + time */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8,
            background: P.surface, color: P.muted, border: `1px solid ${P.border}` }}>
            {issue.category || "Other"}
          </span>
          <span style={{ fontSize: 11, color: P.muted }}>{timeAgo(issue.createdAt)}</span>
        </div>

        {/* Description (expandable) */}
        {issue.description && (
          <div style={{ fontSize: 12, color: P.muted, lineHeight: 1.5, marginBottom: 10,
            overflow: expanded ? "visible" : "hidden",
            display: expanded ? "block" : "-webkit-box",
            WebkitLineClamp: expanded ? "none" : 2,
            WebkitBoxOrient: "vertical" }}>
            {issue.description}
          </div>
        )}
        {issue.description && issue.description.length > 100 && (
          <button onClick={() => setExpanded(x => !x)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12,
              color: P.primary, fontFamily: "'Sora',sans-serif", padding: 0, marginBottom: 10 }}>
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* Resolution note */}
        {issue.resolution && (
          <div style={{ padding: "8px 10px", background: "#F0FDF4", borderRadius: 8,
            fontSize: 12, color: "#065F46", marginBottom: 10 }}>
            <strong>Resolution:</strong> {issue.resolution}
          </div>
        )}

        {/* Action */}
        <button onClick={() => setModal(true)}
          style={{ width: "100%", padding: "10px", background: "#ECFDF5", color: P.primary,
            border: `1px solid ${P.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Sora',sans-serif", minHeight: 44 }}>
          Update Status →
        </button>
      </div>
    </>
  );
}

// ══ MAIN ══
const WardenIssues = () => {
  const isMobile = useIsMobile();
  const [issues,  setIssues]  = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusF, setStatusF] = useState("All");
  const [priF,    setPriF]    = useState("All");
  const [search,  setSearch]  = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [issRes, stRes] = await Promise.all([getAllIssues(), getIssueStats().catch(() => null)]);
      const raw = issRes.data;
      setIssues(Array.isArray(raw) ? raw : raw?.issues ?? []);
      if (stRes) setStats(stRes.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id, data) => {
    await updateIssueStatus(id, data);
    setIssues(prev => prev.map(x => x._id === id ? { ...x, ...data } : x));
  };

  const displayed = issues
    .filter(i => statusF === "All" || i.status === statusF)
    .filter(i => priF === "All" || i.priority === priF)
    .filter(i => !search || i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.student?.fullName?.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...displayed].sort((a, b) =>
    (PRI_CFG[a.priority]?.order ?? 9) - (PRI_CFG[b.priority]?.order ?? 9)
  );

  const statCards = [
    { label: "Total",       v: issues.length,                                      color: "#2563EB", bg: "#EFF6FF", icon: "📋" },
    { label: "Open",        v: issues.filter(i => i.status === "Open").length,     color: "#DC2626", bg: "#FEF2F2", icon: "🔴" },
    { label: "In Progress", v: issues.filter(i => i.status === "In Progress").length, color: "#D97706", bg: "#FFFBEB", icon: "🔧" },
    { label: "Resolved",    v: issues.filter(i => i.status === "Resolved").length, color: "#059669", bg: "#ECFDF5", icon: "✅" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: P.surface, fontFamily: "'Sora',sans-serif",
      paddingTop: isMobile ? 56 : 0 }}>

      {!isMobile && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${P.border}`, padding: "20px 32px" }}>
          <div style={{ fontSize: 11, color: P.primary, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Warden Portal</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: P.text }}>Issues & Complaints</h1>
        </div>
      )}

      <div style={{ padding: isMobile ? "12px 16px 80px" : "24px 32px" }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
          gap: 10, marginBottom: 16 }}>
          {statCards.map(({ label, v, color, bg, icon }) => (
            <div key={label} style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 14,
              padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
              <div>
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color }}>{v}</div>
                <div style={{ fontSize: 11, color: P.muted }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 14,
          padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search issues or student name…"
              style={{ flex: 1, padding: "10px 14px", border: `1.5px solid ${P.border}`,
                borderRadius: 10, fontSize: 13, fontFamily: "'Sora',sans-serif",
                color: P.text, outline: "none", boxSizing: "border-box" }}/>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={statusF} onChange={e => setStatusF(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", border: `1.5px solid ${P.border}`,
                  borderRadius: 10, fontSize: 13, fontFamily: "'Sora',sans-serif",
                  color: P.text, background: "#fff", outline: "none", cursor: "pointer" }}>
                <option value="All">All Status</option>
                {["Open", "In Progress", "Resolved", "Closed"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={priF} onChange={e => setPriF(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", border: `1.5px solid ${P.border}`,
                  borderRadius: 10, fontSize: 13, fontFamily: "'Sora',sans-serif",
                  color: P.text, background: "#fff", outline: "none", cursor: "pointer" }}>
                <option value="All">All Priority</option>
                {["Urgent", "High", "Medium", "Low"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div style={{ fontSize: 12, color: P.muted, marginBottom: 12 }}>
          {sorted.length} issue{sorted.length !== 1 ? "s" : ""} found
        </div>

        {/* Issue cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 20px", color: P.muted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div>Loading issues…</div>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: P.muted,
            background: "#fff", borderRadius: 14, border: `1px solid ${P.border}` }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No issues found</div>
            <div style={{ fontSize: 13 }}>All clear! No complaints match the current filters.</div>
          </div>
        ) : (
          sorted.map(issue => (
            <IssueCard key={issue._id} issue={issue} onUpdate={handleUpdate} isMobile={isMobile}/>
          ))
        )}
      </div>
    </div>
  );
};

export default WardenIssues;
