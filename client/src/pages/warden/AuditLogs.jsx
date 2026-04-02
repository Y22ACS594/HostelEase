// src/pages/warden/AuditLogs.jsx
// Mobile + Desktop responsive
import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

/* ── Font ─────────────────────────────────────────────────── */
if (!document.getElementById("al-sora")) {
  const l = document.createElement("link");
  l.id = "al-sora"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
}

/* ── Mobile hook ─────────────────────────────────────────── */
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${bp - 1}px)`);
    const h = (e) => setM(e.matches);
    mq.addEventListener("change", h); setM(mq.matches);
    return () => mq.removeEventListener("change", h);
  }, [bp]);
  return m;
}

/* ── Palette ─────────────────────────────────────────────── */
const P = {
  primary: "#2563EB",
  surface: "#F8FAFF",
  border:  "#E8EEFF",
  text:    "#0F1629",
  muted:   "#6B7A99",
  green:   "#059669",
  amber:   "#D97706",
  red:     "#DC2626",
  purple:  "#7C3AED",
};

/* ── Action → style map ──────────────────────────────────── */
const ACTION_MAP = {
  login:    { icon: "🔑", color: P.primary, bg: "#EFF6FF" },
  logout:   { icon: "🚪", color: P.muted,   bg: "#F1F5F9" },
  create:   { icon: "➕", color: P.green,   bg: "#ECFDF5" },
  update:   { icon: "✏️",  color: P.amber,   bg: "#FFFBEB" },
  delete:   { icon: "🗑️", color: P.red,     bg: "#FEF2F2" },
  approve:  { icon: "✅", color: P.green,   bg: "#ECFDF5" },
  reject:   { icon: "❌", color: P.red,     bg: "#FEF2F2" },
  allocate: { icon: "🛏️", color: P.purple,  bg: "#F5F3FF" },
  payment:  { icon: "💳", color: P.green,   bg: "#ECFDF5" },
  gate:     { icon: "🔐", color: P.purple,  bg: "#F5F3FF" },
  default:  { icon: "📝", color: P.muted,   bg: "#F1F5F9" },
};

const getAction = (action = "") => {
  const key = Object.keys(ACTION_MAP).find((k) =>
    action.toLowerCase().includes(k)
  );
  return ACTION_MAP[key] || ACTION_MAP.default;
};

const fmtDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const fmtDateShort = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const AuditLogs = () => {
  const isMobile = useIsMobile();

  const [logs,        setLogs]        = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [actionFilter,setActionFilter]= useState("");

  const LIMIT = 20;

  const fetchLogs = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pg, limit: LIMIT,
        ...(actionFilter && { action: actionFilter }),
      });
      const res = await api.get(`/audit?${params}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const filteredLogs = search
    ? logs.filter((l) =>
        (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
        (l.actor?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (l.description || "").toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const ACTIONS = ["", "login", "logout", "create", "update", "delete", "approve", "reject", "allocate", "gate"];

  /* ── Pagination buttons ── */
  const PagBtn = ({ disabled, onClick, children }) => (
    <button disabled={disabled} onClick={onClick} style={{
      width: 32, height: 32, border: `1.5px solid ${P.border}`,
      borderRadius: 8, background: "#fff",
      color: disabled ? P.border : P.muted,
      fontSize: 13, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{children}</button>
  );

  /* ════════════════════════════════════════════════════ */
  return (
    <div style={{
      fontFamily: "'Sora', sans-serif",
      background: P.surface, minHeight: "100vh",
      padding: isMobile ? "0 0 24px" : "24px",
      color: P.text,
    }}>
      <style>{`@keyframes al-spin { to { transform: rotate(360deg) } }`}</style>

      {/* ── MOBILE HEADER ── */}
      {isMobile && (
        <div style={{
          background: "#fff", borderBottom: `1px solid ${P.border}`,
          padding: "14px 16px", position: "sticky", top: 56, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.primary,
                letterSpacing: "0.1em", textTransform: "uppercase" }}>Warden Portal</div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: P.text }}>Audit Logs</h1>
            </div>
            <button onClick={() => fetchLogs(1)} style={{
              padding: "8px 14px", background: P.primary, color: "#fff", border: "none",
              borderRadius: 10, fontFamily: "'Sora',sans-serif", fontWeight: 600,
              fontSize: 13, cursor: "pointer",
            }}>
              {loading ? (
                <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)",
                  borderTop: "2px solid #fff", borderRadius: "50%",
                  display: "inline-block", animation: "al-spin .7s linear infinite" }}/>
              ) : "↻ Refresh"}
            </button>
          </div>
          {/* Mobile filters */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
              border: `1.5px solid ${P.border}`, borderRadius: 10, background: "#fff", flex: 1 }}>
              <span style={{ color: P.muted, fontSize: 13 }}>🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                style={{ border: "none", outline: "none", fontSize: 12, color: P.text,
                  fontFamily: "'Sora',sans-serif", background: "none", width: "100%" }}/>
            </div>
            <div style={{ position: "relative" }}>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
                style={{ appearance: "none", padding: "8px 28px 8px 10px",
                  border: `1.5px solid ${P.border}`, borderRadius: 10, fontSize: 12,
                  fontFamily: "'Sora',sans-serif", color: P.text, background: "#fff",
                  cursor: "pointer", outline: "none" }}>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a === "" ? "All" : a.charAt(0).toUpperCase() + a.slice(1)}
                  </option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 8, top: "50%",
                transform: "translateY(-50%)", color: P.muted,
                pointerEvents: "none", fontSize: 9 }}>▼</span>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP HEADER ── */}
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: P.primary,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              HostelEase · Warden Portal
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: P.text }}>Audit Logs</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: P.muted }}>
              {todayStr} · {total} total events
            </p>
          </div>
          <button onClick={() => fetchLogs(1)} style={{
            padding: "10px 18px", background: P.primary, color: "#fff", border: "none",
            borderRadius: 12, fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 13,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
          }}>↻ Refresh</button>
        </div>
      )}

      {/* ── PANEL ── */}
      <div style={{
        background: "#fff",
        borderRadius: isMobile ? 0 : 20,
        border: isMobile ? "none" : `1px solid ${P.border}`,
        boxShadow: isMobile ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
        margin: isMobile ? "0" : "0",
      }}>

        {/* ── DESKTOP FILTERS ── */}
        {!isMobile && (
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${P.border}`,
            background: "#FAFBFF", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
              border: `1.5px solid ${P.border}`, borderRadius: 10, background: "#fff",
              flex: 1, minWidth: 160, maxWidth: 280 }}>
              <span style={{ color: P.muted, fontSize: 14 }}>🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actor, action, description…"
                style={{ border: "none", outline: "none", fontSize: 13, color: P.text,
                  fontFamily: "'Sora',sans-serif", background: "none", width: "100%" }}/>
            </div>
            <div style={{ position: "relative" }}>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
                style={{ appearance: "none", padding: "8px 32px 8px 12px",
                  border: `1.5px solid ${P.border}`, borderRadius: 10, fontSize: 13,
                  fontFamily: "'Sora',sans-serif", color: P.text, background: "#fff",
                  cursor: "pointer", outline: "none" }}>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a === "" ? "All Actions" : a.charAt(0).toUpperCase() + a.slice(1)}
                  </option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%",
                transform: "translateY(-50%)", color: P.muted, pointerEvents: "none", fontSize: 10 }}>▼</span>
            </div>
            {(search || actionFilter) && (
              <button onClick={() => { setSearch(""); setActionFilter(""); }}
                style={{ padding: "8px 12px", border: `1.5px solid ${P.border}`, borderRadius: 10,
                  background: "none", color: P.muted, fontFamily: "'Sora',sans-serif",
                  fontSize: 12, cursor: "pointer" }}>
                ✕ Clear
              </button>
            )}
          </div>
        )}

        {/* ── DESKTOP TABLE HEADER ── */}
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 1.2fr",
            padding: "10px 20px", borderBottom: `1px solid ${P.border}`, background: "#F8FAFF" }}>
            {["Actor", "Action", "Description", "Timestamp"].map((h) => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: P.muted,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>
        )}

        {/* ── ROWS ── */}
        <div>
          {loading ? (
            <div style={{ padding: "60px 24px", textAlign: "center", color: P.muted }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
              <div style={{ fontWeight: 600 }}>Loading audit logs…</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center", color: P.muted }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🗂️</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>No audit logs found</div>
            </div>
          ) : isMobile ? (
            /* ── MOBILE: Card list ── */
            <div style={{ padding: "12px 16px" }}>
              {filteredLogs.map((log, idx) => {
                const { icon, color, bg } = getAction(log.action);
                return (
                  <div key={log._id || idx} style={{
                    background: "#fff", border: `1.5px solid ${P.border}`,
                    borderRadius: 14, padding: "14px 16px", marginBottom: 10,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                    {/* Top row: actor + timestamp */}
                    <div style={{ display: "flex", alignItems: "center",
                      justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10,
                          background: "#EFF6FF", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                          👤
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: P.text }}>
                            {log.actor?.name || "System"}
                          </div>
                          <div style={{ fontSize: 11, color: P.muted }}>
                            {log.actor?.role || "—"}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: P.muted,
                        fontFamily: "'DM Mono', monospace", textAlign: "right" }}>
                        {fmtDateShort(log.createdAt)}
                      </div>
                    </div>

                    {/* Action badge */}
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
                        background: bg, color, fontSize: 11, fontWeight: 700,
                        padding: "4px 10px", borderRadius: 20 }}>
                        {icon} {log.action || "—"}
                      </span>
                    </div>

                    {/* Description */}
                    {(log.description || log.details) && (
                      <div style={{ fontSize: 12, color: P.muted, lineHeight: 1.4 }}>
                        {log.description || log.details}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── DESKTOP: Table rows ── */
            filteredLogs.map((log, idx) => {
              const { icon, color, bg } = getAction(log.action);
              return (
                <div key={log._id || idx}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 1.2fr",
                    padding: "14px 20px",
                    borderBottom: idx < filteredLogs.length - 1 ? `1px solid ${P.border}` : "none",
                    alignItems: "center", transition: "background .15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F0F5FF")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EFF6FF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, flexShrink: 0 }}>👤</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>
                        {log.actor?.name || "System"}
                      </div>
                      <div style={{ fontSize: 11, color: P.muted }}>{log.actor?.role || "—"}</div>
                    </div>
                  </div>

                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
                      background: bg, color, fontSize: 11, fontWeight: 700,
                      padding: "4px 10px", borderRadius: 20 }}>
                      {icon} {log.action || "—"}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: P.muted, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={log.description || log.details || ""}>
                    {log.description || log.details || "—"}
                  </div>

                  <div style={{ fontSize: 11, color: P.muted, fontFamily: "'DM Mono', monospace" }}>
                    {fmtDateTime(log.createdAt)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── PAGINATION ── */}
        {!loading && totalPages > 1 && (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${P.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#FAFBFF", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: P.muted }}>
              Page {page} of {totalPages} · {total} events
            </span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <PagBtn disabled={page <= 1} onClick={() => fetchLogs(page - 1)}>←</PagBtn>
              {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                const pg = Math.max(1, page - (isMobile ? 1 : 2)) + i;
                if (pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => fetchLogs(pg)} style={{
                    width: 32, height: 32,
                    border: `1.5px solid ${pg === page ? P.primary : P.border}`,
                    borderRadius: 8,
                    background: pg === page ? P.primary : "#fff",
                    color: pg === page ? "#fff" : P.muted,
                    fontSize: 13, cursor: "pointer",
                    fontFamily: "'Sora',sans-serif",
                  }}>{pg}</button>
                );
              })}
              <PagBtn disabled={page >= totalPages} onClick={() => fetchLogs(page + 1)}>→</PagBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;