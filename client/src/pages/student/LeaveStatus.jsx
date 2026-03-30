// src/pages/student/LeaveStatus.jsx — Fully responsive mobile + desktop
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getMyLeaves }    from "../../services/leaveService";
import { getUnreadCount } from "../../services/notificationService";
import { useAuth }        from "../../context/AuthContext";
import useIsMobile        from "../../hooks/useIsMobile";

if (!document.getElementById("ls-font")) {
  const l = document.createElement("link");
  l.id = "ls-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
}

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TYPE_CFG = {
  Casual:    { abbr:"CL", color:"#2563EB", bg:"#EFF6FF", dot:"#F59E0B", track:"#BFDBFE" },
  Medical:   { abbr:"ML", color:"#DC2626", bg:"#FEF2F2", dot:"#F87171", track:"#FECACA" },
  Emergency: { abbr:"EL", color:"#7C3AED", bg:"#F5F3FF", dot:"#A78BFA", track:"#DDD6FE" },
  Home:      { abbr:"HL", color:"#059669", bg:"#ECFDF5", dot:"#34D399", track:"#A7F3D0" },
  Event:     { abbr:"EV", color:"#0891B2", bg:"#EFF6FF", dot:"#22D3EE", track:"#A5F3FC" },
  Other:     { abbr:"OT", color:"#6B7280", bg:"#F9FAFB", dot:"#9CA3AF", track:"#E5E7EB" },
};
const getType = (t) => TYPE_CFG[t] || TYPE_CFG.Other;

const STATUS_CFG = {
  Pending:  { label:"Pending",  color:"#D97706", bg:"#FEF9C3", border:"#FDE047", icon:"⏳" },
  Approved: { label:"Approved", color:"#059669", bg:"#ECFDF5", border:"#6EE7B7", icon:"✅" },
  Rejected: { label:"Rejected", color:"#DC2626", bg:"#FEF2F2", border:"#FECACA", icon:"❌" },
};
const getStat = (s) => STATUS_CFG[s] || STATUS_CFG.Pending;

const getDays   = (from, to) => Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1);
const fmtLong   = (iso) => { const d = new Date(iso + "T00:00:00"); return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort  = (iso) => { const d = new Date(iso + "T00:00:00"); return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`; };
const fmtRange  = (from, to) => getDays(from, to) === 1 ? fmtLong(from) : `${fmtLong(from)} – ${fmtLong(to)}`;
const fmtRangeS = (from, to) => getDays(from, to) === 1 ? fmtShort(from) : `${fmtShort(from)} – ${fmtShort(to)}`;

const avatarColors = ["#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#BE185D"];
const avatarBg  = (n = "") => avatarColors[(n.charCodeAt(0) || 0) % avatarColors.length];

// ── Leave Detail Modal ──
function LeaveModal({ leave, onClose }) {
  const from = leave.fromDate?.slice(0, 10) || "";
  const to   = leave.toDate?.slice(0, 10) || "";
  const days = getDays(from, to);
  const stat = getStat(leave.status);
  const typ  = getType(leave.leaveType);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0,
        background: "rgba(15,22,41,0.4)", backdropFilter: "blur(3px)", zIndex: 200 }}/>
      <div style={{ position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: Math.min(460, window.innerWidth - 32),
        background: "#fff", borderRadius: 20, zIndex: 201,
        boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        fontFamily: "'Sora',sans-serif", overflow: "hidden",
        animation: "ls-modal-in .22s ease" }}>
        <style>{`@keyframes ls-modal-in{from{opacity:0;transform:translate(-50%,-48%) scale(.97)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px",
          background: `linear-gradient(135deg,${typ.color},${typ.color}cc)` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)",
                textTransform: "uppercase", letterSpacing: "0.1em" }}>{leave.leaveType} Leave</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 2 }}>
                {fmtRange(from, to)}
              </div>
            </div>
            <button onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)", border: "none",
                cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 20 }}>
            <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
              background: stat.bg, color: stat.color, border: `1px solid ${stat.border}` }}>
              {stat.icon} {stat.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              {days} day{days > 1 ? "s" : ""}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 16 }}>
            {[
              ["From", fmtLong(from)],
              ["To",   fmtLong(to)],
              ["Destination", leave.destination || "—"],
              ["Contact",     leave.contactDuringLeave || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF",
                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{v}</div>
              </div>
            ))}
          </div>

          {leave.reason && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF",
                textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Reason</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6,
                background: "#F9FAFB", borderRadius: 10, padding: "10px 12px" }}>
                {leave.reason}
              </div>
            </div>
          )}

          {leave.status === "Rejected" && (leave.rejectionReason || leave.remarks) && (
            <div style={{ padding: "12px 14px", background: "#FEF2F2",
              borderRadius: 10, border: "1px solid #FECACA" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#991B1B",
                textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                Warden Remark
              </div>
              <div style={{ fontSize: 13, color: "#991B1B", fontWeight: 500, lineHeight: 1.5 }}>
                {leave.rejectionReason || leave.remarks}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Leave Card (mobile) ──
function MobileLeaveCard({ leave, onOpen }) {
  const from = leave.fromDate?.slice(0, 10) || "";
  const to   = leave.toDate?.slice(0, 10) || "";
  const days = getDays(from, to);
  const stat = getStat(leave.status);
  const typ  = getType(leave.leaveType);

  return (
    <div onClick={() => onOpen(leave)}
      style={{ background: "#fff", border: `1px solid #E5E7EB`, borderRadius: 14,
        padding: "14px 16px", marginBottom: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        borderLeft: `3px solid ${typ.color}`,
        cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
            {leave.leaveType} Leave
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            {fmtRange(from, to)} · {days}d
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
          background: stat.bg, color: stat.color, border: `1px solid ${stat.border}` }}>
          {stat.icon} {stat.label}
        </span>
      </div>
      {leave.reason && (
        <div style={{ fontSize: 12, color: "#9CA3AF",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {leave.reason.slice(0, 50)}
        </div>
      )}
    </div>
  );
}

// ══ MAIN ══
const LeaveStatus = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [filter,  setFilter]  = useState("All");
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    getMyLeaves().then(r => setLeaves(r.data ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total    = leaves.length;
  const approved = leaves.filter(l => l.status === "Approved");
  const pending  = leaves.filter(l => l.status === "Pending");
  const rejected = leaves.filter(l => l.status === "Rejected");

  const displayed = useMemo(() => {
    return leaves
      .filter(l => filter === "All" || l.status === filter)
      .filter(l => !search ||
        l.leaveType?.toLowerCase().includes(search.toLowerCase()) ||
        l.reason?.toLowerCase().includes(search.toLowerCase()));
  }, [leaves, filter, search]);

  const FILTERS = ["All", "Pending", "Approved", "Rejected"];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFF",
      fontFamily: "'Sora',sans-serif", paddingTop: isMobile ? 56 : 0 }}>

      {/* Desktop header */}
      {!isMobile && (
        <div style={{ background: "#fff", borderBottom: "1px solid #E8EEFF",
          padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Student Portal</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F1629" }}>Leave Status</h1>
          </div>
          <button onClick={() => navigate("/student/apply-leave")}
            style={{ padding: "10px 20px", background: "#2563EB", color: "#fff",
              border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
            + Apply Leave
          </button>
        </div>
      )}

      <div style={{ padding: isMobile ? "12px 16px 80px" : "24px 32px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
          gap: 10, marginBottom: 16 }}>
          {[
            { label: "Total",    v: total,             color: "#2563EB", bg: "#EFF6FF", icon: "📋" },
            { label: "Approved", v: approved.length,   color: "#059669", bg: "#ECFDF5", icon: "✅" },
            { label: "Pending",  v: pending.length,    color: "#D97706", bg: "#FFFBEB", icon: "⏳" },
            { label: "Rejected", v: rejected.length,   color: "#DC2626", bg: "#FEF2F2", icon: "❌" },
          ].map(({ label, v, color, bg, icon }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #E8EEFF", borderRadius: 14,
              padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
              <div>
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color }}>{loading ? "…" : v}</div>
                <div style={{ fontSize: 11, color: "#6B7A99" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ background: "#fff", border: "1px solid #E8EEFF", borderRadius: 14,
          padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10 }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: "7px 14px", borderRadius: 20,
                    background: filter === f ? "#2563EB" : "#F9FAFB",
                    color: filter === f ? "#fff" : "#6B7A99",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${filter === f ? "#2563EB" : "#E8EEFF"}`,
                    fontFamily: "'Sora',sans-serif", whiteSpace: "nowrap", minHeight: 36 }}>
                  {f}
                  {f !== "All" && <span style={{ marginLeft: 4, fontSize: 10 }}>
                    ({leaves.filter(l => l.status === f).length})
                  </span>}
                </button>
              ))}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by type or reason…"
              style={{ flex: 1, padding: "8px 14px", border: "1.5px solid #E8EEFF",
                borderRadius: 10, fontSize: 13, fontFamily: "'Sora',sans-serif",
                color: "#0F1629", outline: "none", boxSizing: "border-box", minHeight: 40 }}/>
          </div>
        </div>

        {/* Apply button (mobile) */}
        {isMobile && (
          <button onClick={() => navigate("/student/apply-leave")}
            style={{ width: "100%", padding: "12px", background: "#2563EB", color: "#fff",
              border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Sora',sans-serif", marginBottom: 16, minHeight: 48 }}>
            + Apply for Leave
          </button>
        )}

        {/* Results count */}
        <div style={{ fontSize: 12, color: "#6B7A99", marginBottom: 12 }}>
          {displayed.length} request{displayed.length !== 1 ? "s" : ""}
        </div>

        {/* Leave list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#6B7A99" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div>Loading your leaves…</div>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7A99",
            background: "#fff", borderRadius: 14, border: "1px solid #E8EEFF" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No leave requests</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>
              {filter !== "All" ? `No ${filter.toLowerCase()} requests found.` : "You haven't applied for any leave yet."}
            </div>
            <button onClick={() => navigate("/student/apply-leave")}
              style={{ padding: "10px 24px", background: "#2563EB", color: "#fff",
                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
              Apply for Leave
            </button>
          </div>
        ) : isMobile ? (
          displayed.map(leave => (
            <MobileLeaveCard key={leave._id} leave={leave} onOpen={setModal}/>
          ))
        ) : (
          /* Desktop table */
          <div style={{ background: "#fff", border: "1px solid #E8EEFF", borderRadius: 14,
            overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 100px 180px 100px",
              padding: "12px 20px", background: "#F8FAFF", borderBottom: "1px solid #E8EEFF" }}>
              {["Leave Period","Type","Duration","Reason","Status"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6B7A99",
                  textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
              ))}
            </div>
            {displayed.map(leave => {
              const from = leave.fromDate?.slice(0, 10) || "";
              const to   = leave.toDate?.slice(0, 10) || "";
              const days = getDays(from, to);
              const stat = getStat(leave.status);
              const typ  = getType(leave.leaveType);
              return (
                <div key={leave._id} onClick={() => setModal(leave)}
                  style={{ display: "grid", gridTemplateColumns: "1fr 160px 100px 180px 100px",
                    padding: "14px 20px", borderBottom: "1px solid #E8EEFF",
                    cursor: "pointer", transition: "background .12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F0F5FF"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1629" }}>
                      {fmtRange(from, to)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10,
                      background: typ.bg, color: typ.color }}>{leave.leaveType}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#6B7A99" }}>{days}d</div>
                  <div style={{ fontSize: 12, color: "#6B7A99",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {leave.reason?.slice(0, 28) || "—"}
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                      background: stat.bg, color: stat.color, border: `1px solid ${stat.border}` }}>
                      {stat.icon} {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && <LeaveModal leave={modal} onClose={() => setModal(null)}/>}
    </div>
  );
};

export default LeaveStatus;
