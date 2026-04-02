// client/src/pages/gatekeeper/GatekeeperDashboard.jsx
// Full gatekeeper portal — mobile + desktop responsive
// Features: ID search, approved list, mark exit, deny, exit log, PDF download

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getApprovedList,
  searchStudent,
  markExit,
  denyAtGate,
  getExitLogs,
  getGateStats,
} from "../../services/gateService";

// ── Load Sora font ───────────────────────────────────────────────────
if (!document.getElementById("gkd-sora")) {
  const l = document.createElement("link");
  l.id = "gkd-sora"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
}

// ── Design tokens ────────────────────────────────────────────────────
const P = {
  primary:  "#059669", dark:   "#047857", light:  "#D1FAE5",
  text:     "#0F1629", muted:  "#6B7A99", border: "#E8EEFF",
  surface:  "#F0FDF4", card:   "#fff",
  warn:     "#D97706", danger: "#DC2626", info: "#2563EB",
};

// ── Helpers ──────────────────────────────────────────────────────────
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

const initials = (n = "") => n.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const avatarColors = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#0891B2", "#BE185D"];
const avatarBg = (n = "") => avatarColors[(n.charCodeAt(0) || 0) % avatarColors.length];

const fmtDate = (d) => d ? String(d).slice(0, 10) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

const gateStatusStyle = (gs) => ({
  Exited:  { bg: "#D1FAE5", color: "#065F46", label: "Exited"  },
  Denied:  { bg: "#FEE2E2", color: "#991B1B", label: "Denied"  },
  Pending: { bg: "#FEF3C7", color: "#92400E", label: "At Gate" },
  null:    { bg: "#EFF6FF", color: "#1E40AF", label: "Approved" },
}[gs] || { bg: "#F1F5F9", color: "#475569", label: gs || "—" });

// ── Stat Card ────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color, bg, compact }) {
  return (
    <div style={{
      background: P.card, borderRadius: compact ? 12 : 16,
      padding: compact ? "12px 14px" : "20px 22px",
      border: `1.5px solid ${P.border}`,
      display: "flex", flexDirection: compact ? "row" : "column",
      alignItems: compact ? "center" : "flex-start", gap: compact ? 10 : 8,
    }}>
      <div style={{
        width: compact ? 30 : 40, height: compact ? 30 : 40,
        borderRadius: 10, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: compact ? 14 : 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: compact ? 18 : 26, fontWeight: 700, color: P.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: compact ? 10 : 12, color: P.muted, fontWeight: 500, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Result Card shown after ID search ────────────────────────────────
function SearchResultCard({ result, onMarkExit, onDeny, loading, onClose }) {
  const { student, leave, hasActiveApproval } = result;
  const gs    = leave?.gateStatus ?? null;
  const style = gateStatusStyle(gs);
  const name  = student?.fullName || "Unknown";
  const [denyMode, setDenyMode] = useState(false);
  const [reason,   setReason]   = useState("");
  const [dErr,     setDErr]     = useState("");

  const borderColor = hasActiveApproval
    ? (gs === "Denied" ? P.danger : P.primary)
    : P.danger;

  return (
    <div style={{
      background: P.card, border: `2px solid ${borderColor}`,
      borderRadius: 16, padding: "20px", marginBottom: 16,
      position: "relative",
    }}>
      {/* Close */}
      <button onClick={onClose} style={{
        position: "absolute", top: 14, right: 14,
        background: "none", border: "none", cursor: "pointer",
        color: P.muted, fontSize: 18, lineHeight: 1,
      }}>✕</button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: avatarBg(name), color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700,
        }}>{initials(name)}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: P.text }}>{name}</div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 13,
            color: P.info, fontWeight: 500, marginTop: 2,
          }}>{student?.rollNumber}</div>
          <div style={{ fontSize: 12, color: P.muted }}>
            {student?.department} · Room {student?.roomNumber || "—"}
          </div>
        </div>
      </div>

      {/* Verdict banner */}
      {hasActiveApproval ? (
        <div style={{
          borderRadius: 12, padding: "14px 16px", marginBottom: 16,
          background: gs === "Exited" ? "#D1FAE5" : gs === "Denied" ? "#FEF2F2" : "#ECFDF5",
          border: `1.5px solid ${gs === "Denied" ? "#FCA5A5" : "#6EE7B7"}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ fontSize: 24 }}>
            {gs === "Exited" ? "✅" : gs === "Denied" ? "🚫" : "✅"}
          </div>
          <div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: gs === "Denied" ? P.danger : P.dark,
            }}>
              {gs === "Exited" ? "Already Exited" : gs === "Denied" ? "Exit Denied" : "Leave Approved — Allow Exit"}
            </div>
            <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>
              {leave?.destination ? `Destination: ${leave.destination}` : ""}
              {leave?.fromDate ? ` · ${fmtDate(leave.fromDate)} → ${fmtDate(leave.toDate)}` : ""}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          borderRadius: 12, padding: "14px 16px", marginBottom: 16,
          background: "#FEF2F2", border: "1.5px solid #FCA5A5",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ fontSize: 24 }}>🚫</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: P.danger }}>
              No Active Leave Approval
            </div>
            <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>
              This student does not have an approved leave for today. Do NOT allow exit.
            </div>
          </div>
        </div>
      )}

      {/* Leave details */}
      {leave && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, padding: "12px 14px", background: P.surface,
          borderRadius: 10, marginBottom: 16,
        }}>
          {[
            ["Leave Type",   leave.leaveType],
            ["Destination",  leave.destination || "—"],
            ["From Date",    fmtDate(leave.fromDate)],
            ["To Date",      fmtDate(leave.toDate)],
            ["Approved by",  leave.approvedBy?.name || "Warden"],
            ["Exit Time",    gs === "Exited" ? fmtTime(leave.exitedAt) : "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10, fontWeight: 600, color: P.muted,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Deny form */}
      {denyMode && (
        <div style={{ marginBottom: 14 }}>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setDErr(""); }}
            placeholder="Reason for denying exit…"
            style={{
              width: "100%", padding: "10px 14px", boxSizing: "border-box",
              border: `1.5px solid ${dErr ? P.danger : P.border}`, borderRadius: 10,
              fontSize: 13, fontFamily: "'Sora',sans-serif", resize: "none", outline: "none",
            }}
          />
          {dErr && <div style={{ color: P.danger, fontSize: 12, marginTop: 4 }}>{dErr}</div>}
        </div>
      )}

      {/* Action buttons */}
      {hasActiveApproval && !gs && (
        <div style={{ display: "flex", gap: 10 }}>
          {denyMode ? (
            <>
              <button
                onClick={() => {
                  if (reason.trim().length < 3) return setDErr("Please enter a reason.");
                  onDeny(leave._id, reason);
                  setDenyMode(false);
                }}
                disabled={loading}
                style={{
                  flex: 1, padding: "12px", background: P.danger, color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Sora',sans-serif", minHeight: 46,
                }}>
                Confirm Deny
              </button>
              <button onClick={() => setDenyMode(false)} style={{
                flex: 1, padding: "12px", background: "#fff", color: P.muted,
                border: `1.5px solid ${P.border}`, borderRadius: 10, fontSize: 13,
                fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif", minHeight: 46,
              }}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onMarkExit(leave._id)}
                disabled={loading}
                style={{
                  flex: 2, padding: "12px", background: loading ? "#6EE7B7" : P.primary,
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Sora',sans-serif", minHeight: 46,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                {loading && <span style={{
                  width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
                  borderTop: "2px solid #fff", borderRadius: "50%",
                  display: "inline-block", animation: "gkd-spin .7s linear infinite",
                }}/>}
                ✓ Mark Exit & Allow
              </button>
              <button
                onClick={() => setDenyMode(true)}
                disabled={loading}
                style={{
                  flex: 1, padding: "12px", background: "#fff", color: P.danger,
                  border: `1.5px solid ${P.danger}`, borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Sora',sans-serif", minHeight: 46,
                }}>
                Deny
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Approved list table row (desktop) ────────────────────────────────
function ApprovedRow({ leave, onMarkExit, onDeny, loading, idx }) {
  const name    = leave.student?.fullName || "Unknown";
  const roll    = leave.student?.rollNumber || "—";
  const gs      = leave.gateStatus ?? null;
  const style   = gateStatusStyle(gs);
  const isProc  = loading === leave._id;
  const [denyMode, setDenyMode] = useState(false);
  const [reason,   setReason]   = useState("");

  return (
    <tr style={{
      background: idx % 2 === 0 ? "#fafafa" : "#fff",
      transition: "background .15s",
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#F0FDF4"}
      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "#fafafa" : "#fff"}>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: avatarBg(name), color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700,
          }}>{initials(name)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{name}</div>
            <div style={{ fontSize: 11, color: P.muted }}>{leave.student?.department || "—"}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: P.info }}>
        {roll}
      </td>
      <td style={{ padding: "12px 16px", fontSize: 12, color: P.muted }}>
        {fmtDate(leave.fromDate)} → {fmtDate(leave.toDate)}
      </td>
      <td style={{ padding: "12px 16px", fontSize: 12, color: P.muted }}>
        {leave.destination || "—"}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <span style={{
          background: style.bg, color: style.color,
          fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
        }}>{style.label}</span>
      </td>
      <td style={{ padding: "12px 16px" }}>
        {gs === null ? (
          denyMode ? (
            <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason…"
                style={{
                  padding: "6px 10px", border: `1px solid ${P.border}`,
                  borderRadius: 8, fontSize: 12, outline: "none",
                  fontFamily: "'Sora',sans-serif", width: 160,
                }}
              />
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => { if (reason.trim().length > 2) { onDeny(leave._id, reason); setDenyMode(false); } }}
                  disabled={!!loading}
                  style={{
                    padding: "5px 10px", background: P.danger, color: "#fff",
                    border: "none", borderRadius: 7, fontSize: 11,
                    fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif",
                  }}>Confirm</button>
                <button onClick={() => setDenyMode(false)} style={{
                  padding: "5px 8px", background: "#fff", color: P.muted,
                  border: `1px solid ${P.border}`, borderRadius: 7, fontSize: 11,
                  cursor: "pointer",
                }}>✕</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => onMarkExit(leave._id)}
                disabled={!!loading}
                style={{
                  padding: "7px 14px", background: isProc ? "#6EE7B7" : P.primary,
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Sora',sans-serif",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                {isProc && <span style={{
                  width: 12, height: 12,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTop: "2px solid #fff", borderRadius: "50%",
                  display: "inline-block",
                  animation: "gkd-spin .7s linear infinite",
                }}/>}
                Mark Exit
              </button>
              <button
                onClick={() => setDenyMode(true)}
                disabled={!!loading}
                style={{
                  padding: "7px 12px", background: "#fff", color: P.danger,
                  border: `1px solid ${P.danger}`, borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Sora',sans-serif",
                }}>Deny</button>
            </div>
          )
        ) : (
          <span style={{ fontSize: 12, color: P.muted, fontStyle: "italic" }}>
            {gs === "Exited" ? `Exited ${fmtTime(leave.exitedAt)}` : "Denied at gate"}
          </span>
        )}
      </td>
    </tr>
  );
}

// ── Mobile Approved Card ──────────────────────────────────────────────
function MobileApprovedCard({ leave, onMarkExit, onDeny, loading }) {
  const name   = leave.student?.fullName || "Unknown";
  const gs     = leave.gateStatus ?? null;
  const style  = gateStatusStyle(gs);
  const isProc = loading === leave._id;
  const [denyMode, setDenyMode] = useState(false);
  const [reason,   setReason]   = useState("");

  return (
    <div style={{
      background: P.card, border: `1.5px solid ${P.border}`,
      borderRadius: 14, padding: "14px 16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: avatarBg(name), color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700,
        }}>{initials(name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.text }}>{name}</div>
          <div style={{
            fontFamily: "'DM Mono',monospace", fontSize: 11,
            color: P.info, marginTop: 1,
          }}>{leave.student?.rollNumber}</div>
        </div>
        <span style={{
          background: style.bg, color: style.color,
          fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
        }}>{style.label}</span>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 8, padding: "10px 12px", background: P.surface, borderRadius: 10, marginBottom: 10,
      }}>
        {[
          ["Dates", `${fmtDate(leave.fromDate)} → ${fmtDate(leave.toDate)}`],
          ["Destination", leave.destination || "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.muted,
              textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: P.text, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      {gs === null && (
        denyMode ? (
          <div>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Deny reason…"
              style={{
                width: "100%", padding: "8px 12px", boxSizing: "border-box",
                border: `1.5px solid ${P.border}`, borderRadius: 8,
                fontSize: 12, fontFamily: "'Sora',sans-serif", resize: "none", outline: "none", marginBottom: 8,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { if (reason.trim().length > 2) { onDeny(leave._id, reason); setDenyMode(false); } }}
                style={{ flex: 1, padding: "10px", background: P.danger, color: "#fff", border: "none",
                  borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Sora',sans-serif", minHeight: 40 }}>
                Confirm Deny
              </button>
              <button onClick={() => setDenyMode(false)} style={{
                flex: 1, padding: "10px", background: "#fff", color: P.muted,
                border: `1.5px solid ${P.border}`, borderRadius: 9, fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif", minHeight: 40,
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onMarkExit(leave._id)}
              disabled={!!loading}
              style={{
                flex: 2, padding: "10px", background: isProc ? "#6EE7B7" : P.primary,
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Sora',sans-serif", minHeight: 42,
              }}>
              {isProc ? "…" : "✓ Mark Exit"}
            </button>
            <button
              onClick={() => setDenyMode(true)}
              disabled={!!loading}
              style={{
                flex: 1, padding: "10px", background: "#fff", color: P.danger,
                border: `1.5px solid ${P.danger}`, borderRadius: 10,
                fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Sora',sans-serif", minHeight: 42,
              }}>
              Deny
            </button>
          </div>
        )
      )}
      {gs === "Exited" && (
        <div style={{ fontSize: 11, color: P.dark, fontWeight: 600 }}>
          ✅ Exited at {fmtTime(leave.exitedAt)}
        </div>
      )}
      {gs === "Denied" && (
        <div style={{ fontSize: 11, color: P.danger, fontWeight: 600 }}>
          🚫 Denied — {leave.gateDeniedReason}
        </div>
      )}
    </div>
  );
}

// ── PDF Generator ─────────────────────────────────────────────────────
function generatePDF(leaves) {
  const today = new Date().toLocaleDateString("en-IN", { dateStyle: "long" });
  const rows  = leaves.map((l, i) => [
    i + 1,
    l.student?.rollNumber || "—",
    l.student?.fullName   || "—",
    l.student?.department || "—",
    fmtDate(l.fromDate),
    fmtDate(l.toDate),
    l.destination         || "—",
    l.gateStatus === "Exited" ? `Exited ${fmtTime(l.exitedAt)}` : (l.gateStatus || "Approved"),
  ]);

  const rowsHtml = rows.map(([n, roll, name, dept, from, to, dest, status]) => `
    <tr>
      <td>${n}</td><td>${roll}</td><td>${name}</td><td>${dept}</td>
      <td>${from}</td><td>${to}</td><td>${dest}</td><td>${status}</td>
    </tr>`).join("");

  const html = `<html><head><title>Gate List ${today}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:20px;font-size:12px}
      h1{font-size:18px;margin-bottom:4px}
      .sub{color:#6b7280;font-size:12px;margin-bottom:20px}
      table{width:100%;border-collapse:collapse}
      th{background:#059669;color:#fff;padding:8px 10px;text-align:left;font-size:11px}
      td{padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:11px}
      tr:nth-child(even) td{background:#f9fafb}
      .footer{margin-top:20px;color:#9ca3af;font-size:10px;text-align:center}
    </style></head><body>
    <h1>HostelEase — Approved Leave List</h1>
    <div class="sub">Date: ${today} &nbsp;·&nbsp; Total: ${leaves.length} students</div>
    <table>
      <thead><tr>
        <th>#</th><th>Roll No.</th><th>Name</th><th>Dept</th>
        <th>From</th><th>To</th><th>Destination</th><th>Gate Status</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div class="footer">Generated by HostelEase Gatekeeper Portal · ${today}</div>
    </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.print();
}

// ─────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function GatekeeperDashboard() {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  // State
  const [tab,       setTab]       = useState("scan");   // scan | approved | logs
  const [leaves,    setLeaves]    = useState([]);
  const [logs,      setLogs]      = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [actionLd,  setActionLd]  = useState(null);    // leaveId being processed

  // Search state
  const [searchId,  setSearchId]  = useState("");
  const [searching, setSearching] = useState(false);
  const [result,    setResult]    = useState(null);     // { student, leave, hasActiveApproval }
  const [notFound,  setNotFound]  = useState(false);

  // Filter
  const [filter,    setFilter]    = useState("all");   // all | pending | exited | denied

  const inputRef = useRef(null);

  // ── Fetch all data ──────────────────────────────────────────────
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [lRes, sRes] = await Promise.all([
        getApprovedList(),
        getGateStats(),
      ]);
      setLeaves(lRes.data.leaves || []);
      setStats(sRes.data);
    } catch (e) {
      console.error("Gate fetch error:", e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const r = await getExitLogs();
      setLogs(r.data.logs || []);
    } catch (e) { console.error("Log fetch error:", e); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (tab === "logs") fetchLogs();
  }, [tab, fetchLogs]);

  // Poll every 30s
  useEffect(() => {
    const id = setInterval(() => fetchAll(true), 30_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  // ── Search by roll number ────────────────────────────────────────
  const handleSearch = async () => {
    const id = searchId.trim().toUpperCase();
    if (!id) return;
    setSearching(true); setResult(null); setNotFound(false);
    try {
      const r = await searchStudent(id);
      setResult(r.data);
    } catch (e) {
      if (e.response?.status === 404) setNotFound(true);
      else console.error(e);
    } finally { setSearching(false); }
  };

  // ── Mark Exit ────────────────────────────────────────────────────
  const handleMarkExit = async (leaveId) => {
    setActionLd(leaveId);
    try {
      await markExit(leaveId);
      await fetchAll(true);
      // Update result card if open
      if (result?.leave?._id === leaveId) {
        setResult(prev => ({
          ...prev,
          leave: { ...prev.leave, gateStatus: "Exited", exitedAt: new Date() },
        }));
      }
    } catch (e) {
      alert(e.response?.data?.message || "Failed to mark exit.");
    } finally { setActionLd(null); }
  };

  // ── Deny at Gate ─────────────────────────────────────────────────
  const handleDeny = async (leaveId, reason) => {
    setActionLd(leaveId);
    try {
      await denyAtGate(leaveId, reason);
      await fetchAll(true);
      if (result?.leave?._id === leaveId) {
        setResult(prev => ({
          ...prev,
          leave: { ...prev.leave, gateStatus: "Denied", gateDeniedReason: reason },
        }));
      }
    } catch (e) {
      alert(e.response?.data?.message || "Failed to deny exit.");
    } finally { setActionLd(null); }
  };

  // ── Filtered leaves list ─────────────────────────────────────────
  const filteredLeaves = leaves.filter(l => {
    if (filter === "all")     return true;
    if (filter === "pending") return !l.gateStatus;
    if (filter === "exited")  return l.gateStatus === "Exited";
    if (filter === "denied")  return l.gateStatus === "Denied";
    return true;
  });

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: "'Sora',sans-serif",
      background: P.surface, minHeight: "100vh",
      padding: isMobile ? "0 0 80px" : "24px",
      color: P.text,
    }}>
      <style>{`
        @keyframes gkd-spin  { to { transform: rotate(360deg) } }
        @keyframes gkd-slide { from { transform: translateY(-10px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>

      {/* ── DESKTOP HEADER ── */}
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: P.primary,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              HostelEase · Gatekeeper Portal
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: P.text }}>
              Gate Control Dashboard
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: P.muted }}>{today}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => generatePDF(leaves)} style={{
              padding: "10px 18px", background: "#EFF6FF", color: P.info,
              border: `1.5px solid ${P.info}`, borderRadius: 12,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Sora',sans-serif",
            }}>
              ↓ Print/PDF List
            </button>
            <button onClick={() => fetchAll()} style={{
              padding: "10px 18px", background: P.primary, color: "#fff",
              border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Sora',sans-serif",
            }}>
              ↻ Refresh
            </button>
            <button onClick={logout} style={{
              padding: "10px 16px", background: "#fff", color: P.danger,
              border: `1.5px solid ${P.danger}`, borderRadius: 12,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Sora',sans-serif",
            }}>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ── MOBILE HEADER ── */}
      {isMobile && (
        <div style={{
          background: `linear-gradient(135deg, ${P.primary}, ${P.dark})`,
          padding: "56px 16px 16px", // 56px for MobileTopBar offset
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)",
                fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Gatekeeper Portal
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Gate Control</div>
            </div>
            <button onClick={() => generatePDF(leaves)} style={{
              padding: "8px 14px", background: "rgba(255,255,255,0.2)",
              color: "#fff", border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 10, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Sora',sans-serif",
            }}>↓ PDF</button>
          </div>
          {/* Mobile stat pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { label: "Approved", v: stats?.totalApproved ?? "…", bg: "rgba(255,255,255,0.15)" },
              { label: "Exited",   v: stats?.exited        ?? "…", bg: "rgba(255,255,255,0.15)" },
              { label: "At Gate",  v: stats?.pendingExit   ?? "…", bg: "rgba(255,255,255,0.15)" },
            ].map(c => (
              <div key={c.label} style={{
                background: c.bg, borderRadius: 20, padding: "5px 14px",
                display: "flex", gap: 6, alignItems: "center",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{c.v}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DESKTOP STATS ── */}
      {!isMobile && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          <StatCard icon="✅" value={stats?.totalApproved ?? "…"} label="Total Approved" color={P.primary}  bg="#ECFDF5"/>
          <StatCard icon="🚶" value={stats?.exited        ?? "…"} label="Exited Today"   color={P.dark}     bg="#D1FAE5"/>
          <StatCard icon="⏳" value={stats?.pendingExit   ?? "…"} label="Yet to Exit"    color={P.warn}     bg="#FEF3C7"/>
          <StatCard icon="🚫" value={stats?.denied        ?? "…"} label="Denied at Gate" color={P.danger}   bg="#FEF2F2"/>
        </div>
      )}

      {/* ── TABS (mobile) ── */}
      {isMobile && (
        <div style={{
          display: "flex", background: "#fff",
          borderBottom: `1px solid ${P.border}`, padding: "0 16px",
        }}>
          {[["scan","🔍 Scan"], ["approved","✅ List"], ["logs","📋 Logs"]].map(([key, lbl]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "12px 8px",
              border: "none", background: "none",
              borderBottom: tab === key ? `2.5px solid ${P.primary}` : "2.5px solid transparent",
              color: tab === key ? P.primary : P.muted,
              fontFamily: "'Sora',sans-serif", fontWeight: 600,
              fontSize: 12, cursor: "pointer",
            }}>{lbl}</button>
          ))}
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={isMobile ? { padding: "16px" } :
        { display: "grid", gridTemplateColumns: "420px 1fr", gap: 20, alignItems: "start" }}>

        {/* ── LEFT: SCAN PANEL ── */}
        {(!isMobile || tab === "scan") && (
          <div>
            {/* Search Box */}
            <div style={{
              background: P.card, borderRadius: 16, padding: "22px",
              border: `1.5px solid ${P.border}`, marginBottom: 16,
              boxShadow: "0 2px 12px rgba(5,150,105,0.08)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.muted,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                Student ID Check
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: searching || result || notFound ? 0 : 0 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchId}
                  onChange={(e) => { setSearchId(e.target.value.toUpperCase()); setResult(null); setNotFound(false); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Y22ACS594"
                  style={{
                    flex: 1, padding: "13px 16px",
                    border: `1.5px solid ${P.border}`, borderRadius: 12,
                    fontSize: 16, fontFamily: "'DM Mono', monospace",
                    fontWeight: 500, color: P.text, outline: "none",
                    letterSpacing: "0.08em", background: "#fff",
                    transition: "border-color .2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = P.primary}
                  onBlur={(e)  => e.target.style.borderColor = P.border}
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchId.trim()}
                  style={{
                    padding: "13px 20px",
                    background: searching || !searchId.trim() ? "#6EE7B7" : P.primary,
                    color: "#fff", border: "none", borderRadius: 12,
                    fontSize: 14, fontWeight: 700,
                    cursor: (searching || !searchId.trim()) ? "not-allowed" : "pointer",
                    fontFamily: "'Sora',sans-serif",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "background .2s", minWidth: 80,
                  }}>
                  {searching
                    ? <span style={{
                        width: 18, height: 18,
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTop: "2px solid #fff", borderRadius: "50%",
                        display: "inline-block",
                        animation: "gkd-spin .7s linear infinite",
                      }}/>
                    : "Check"
                  }
                </button>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 11, color: P.muted }}>
                Enter student roll number → press Check or Enter
              </p>
            </div>

            {/* Search result */}
            {notFound && (
              <div style={{
                background: "#FEF2F2", border: "1.5px solid #FCA5A5",
                borderRadius: 14, padding: "18px 20px", marginBottom: 16,
                animation: "gkd-slide .25s ease",
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🚫</div>
                <div style={{ fontWeight: 700, color: P.danger, marginBottom: 4 }}>
                  Student not found: "{searchId}"
                </div>
                <div style={{ fontSize: 12, color: P.muted }}>
                  No student record found with this ID. Do NOT allow exit.
                </div>
              </div>
            )}

            {result && (
              <div style={{ animation: "gkd-slide .25s ease" }}>
                <SearchResultCard
                  result={result}
                  onMarkExit={handleMarkExit}
                  onDeny={handleDeny}
                  loading={!!actionLd}
                  onClose={() => { setResult(null); setSearchId(""); inputRef.current?.focus(); }}
                />
              </div>
            )}

            {/* Quick stats on desktop (below search) */}
            {!isMobile && (
              <div style={{
                background: `linear-gradient(135deg, ${P.primary}, ${P.dark})`,
                borderRadius: 16, padding: "20px 22px",
                color: "#fff",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, marginBottom: 6 }}>
                  Today's Progress
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
                  {stats?.exited ?? "…"}
                  <span style={{ fontSize: 16, fontWeight: 400, opacity: 0.75, marginLeft: 8 }}>
                    / {stats?.totalApproved ?? "…"} exited
                  </span>
                </div>
                <div style={{
                  height: 6, background: "rgba(255,255,255,0.25)",
                  borderRadius: 10, marginTop: 12,
                }}>
                  <div style={{
                    height: "100%",
                    width: stats?.totalApproved
                      ? `${Math.round((stats.exited / stats.totalApproved) * 100)}%`
                      : "0%",
                    background: "#fff", borderRadius: 10,
                    transition: "width .5s ease",
                  }}/>
                </div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 6 }}>
                  {stats?.pendingExit ?? "…"} students yet to exit · {stats?.denied ?? 0} denied
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RIGHT: APPROVED LIST ── */}
        {(!isMobile || tab === "approved") && (
          <div>
            {/* List header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12, flexWrap: "wrap", gap: 8,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: P.text }}>
                Approved Students
                <span style={{
                  marginLeft: 8, background: P.light, color: P.dark,
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                }}>{filteredLeaves.length}</span>
              </div>
              {/* Filter pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["all","All"], ["pending","At Gate"], ["exited","Exited"], ["denied","Denied"]].map(([key, lbl]) => (
                  <button key={key} onClick={() => setFilter(key)} style={{
                    padding: "5px 14px", borderRadius: 20,
                    border: `1.5px solid ${filter === key ? P.primary : P.border}`,
                    background: filter === key ? P.primary : "#fff",
                    color: filter === key ? "#fff" : P.muted,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Sora',sans-serif",
                  }}>{lbl}</button>
                ))}
              </div>
            </div>

            {/* Desktop table */}
            {!isMobile && (
              <div style={{
                background: P.card, borderRadius: 16, border: `1px solid ${P.border}`,
                overflow: "hidden",
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F0FDF4", borderBottom: `1px solid ${P.border}` }}>
                      {["Name", "Roll No.", "Leave Dates", "Destination", "Status", "Action"].map(h => (
                        <th key={h} style={{
                          padding: "11px 16px", textAlign: "left",
                          fontSize: 11, fontWeight: 600, color: P.muted,
                          textTransform: "uppercase", letterSpacing: "0.06em",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: P.muted }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                        <div>Loading approved list…</div>
                      </td></tr>
                    ) : filteredLeaves.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: P.muted }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                        <div>No students in this category</div>
                      </td></tr>
                    ) : filteredLeaves.map((leave, idx) => (
                      <ApprovedRow
                        key={leave._id} leave={leave} idx={idx}
                        onMarkExit={handleMarkExit} onDeny={handleDeny}
                        loading={actionLd}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile card list */}
            {isMobile && (
              loading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: P.muted }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                  <div>Loading…</div>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: P.muted }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                  <div>No students in this category</div>
                </div>
              ) : filteredLeaves.map(leave => (
                <MobileApprovedCard
                  key={leave._id} leave={leave}
                  onMarkExit={handleMarkExit} onDeny={handleDeny}
                  loading={actionLd}
                />
              ))
            )}
          </div>
        )}

        {/* ── EXIT LOGS (mobile tab only; desktop shows as a separate panel below main grid) ── */}
        {isMobile && tab === "logs" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: P.text, marginBottom: 12 }}>
              Today's Exit Log
            </div>
            {logs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: P.muted }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                <div>No exits logged yet today</div>
              </div>
            ) : logs.map((l, i) => {
              const gs = gateStatusStyle(l.gateStatus);
              return (
                <div key={l._id || i} style={{
                  background: P.card, borderRadius: 12, padding: "14px 16px",
                  border: `1.5px solid ${P.border}`, marginBottom: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: P.text }}>
                      {l.student?.fullName || "Unknown"}
                    </div>
                    <span style={{
                      background: gs.bg, color: gs.color,
                      fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                    }}>{gs.label}</span>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: P.info }}>
                    {l.student?.rollNumber}
                  </div>
                  <div style={{ fontSize: 11, color: P.muted, marginTop: 4 }}>
                    {l.gateStatus === "Exited"
                      ? `Exited at ${fmtTime(l.exitedAt)}`
                      : `Denied — ${l.gateDeniedReason || "—"}`
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DESKTOP: Exit log below main grid ── */}
      {!isMobile && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: P.text }}>
              Today's Exit Log
              <span style={{
                marginLeft: 8, background: P.light, color: P.dark,
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              }}>{logs.length}</span>
            </div>
            <button onClick={fetchLogs} style={{
              padding: "7px 14px", background: "#fff", color: P.muted,
              border: `1.5px solid ${P.border}`, borderRadius: 10,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Sora',sans-serif",
            }}>↻ Refresh</button>
          </div>
          <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, overflow: "hidden" }}>
            {logs.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: P.muted, fontSize: 13 }}>
                No exit events logged yet today.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F0FDF4", borderBottom: `1px solid ${P.border}` }}>
                    {["Student", "Roll No.", "Dept", "Exit Time", "Gate Status", "By"].map(h => (
                      <th key={h} style={{
                        padding: "10px 16px", textAlign: "left",
                        fontSize: 11, fontWeight: 600, color: P.muted,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => {
                    const gs = gateStatusStyle(l.gateStatus);
                    return (
                      <tr key={l._id || i} style={{ borderBottom: `1px solid ${P.border}` }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#F0FDF4"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "11px 16px", fontWeight: 600, fontSize: 13, color: P.text }}>
                          {l.student?.fullName || "—"}
                        </td>
                        <td style={{ padding: "11px 16px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: P.info }}>
                          {l.student?.rollNumber || "—"}
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: P.muted }}>
                          {l.student?.department || "—"}
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: P.text }}>
                          {fmtTime(l.exitedAt)}
                        </td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{
                            background: gs.bg, color: gs.color,
                            fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                          }}>{gs.label}</span>
                          {l.gateStatus === "Denied" && l.gateDeniedReason && (
                            <div style={{ fontSize: 10, color: P.muted, marginTop: 2 }}>
                              {l.gateDeniedReason}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: P.muted }}>
                          {l.exitMarkedBy?.name || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}