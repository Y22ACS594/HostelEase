import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

/* ─── Google Font injection ─────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

/* ─── Mock data ─────────────────────────────────────── */
const MOCK_LEAVES = [
  { id:1, name:"Arjun Mehta",       role:"CSE – 2022",     type:"Home",      from:"2026-03-02", to:"2026-03-09", days:7,  status:"Pending",  remaining:28, avatar:"AM" },
  { id:2, name:"Priya Sharma",      role:"ECE – 2021",     type:"Medical",   from:"2026-03-02", to:"2026-03-06", days:4,  status:"Pending",  remaining:14, avatar:"PS" },
  { id:3, name:"Rohit Verma",       role:"MECH – 2023",    type:"Emergency", from:"2026-03-04", to:"2026-03-08", days:4,  status:"Approved", remaining:20, avatar:"RV" },
  { id:4, name:"Sneha Pillai",      role:"IT – 2022",      type:"Event",     from:"2026-03-10", to:"2026-03-12", days:2,  status:"Pending",  remaining:12, avatar:"SP" },
  { id:5, name:"Kiran Rao",         role:"CIVIL – 2021",   type:"Home",      from:"2026-03-11", to:"2026-03-18", days:7,  status:"Rejected", remaining:7,  avatar:"KR" },
  { id:6, name:"Divya Nair",        role:"CSE – 2023",     type:"Medical",   from:"2026-03-15", to:"2026-03-22", days:7,  status:"Pending",  remaining:28, avatar:"DN" },
  { id:7, name:"Aakash Singh",      role:"ECE – 2022",     type:"Home",      from:"2026-03-20", to:"2026-03-27", days:7,  status:"Approved", remaining:21, avatar:"AS" },
  { id:8, name:"Meena Krishnan",    role:"IT – 2023",      type:"Other",     from:"2026-03-22", to:"2026-03-24", days:2,  status:"Pending",  remaining:5,  avatar:"MK" },
];

const MONTHLY_DATA = [
  { month:"Sep", Approved:4,  Pending:2, Rejected:1 },
  { month:"Oct", Approved:6,  Pending:5, Rejected:2 },
  { month:"Nov", Approved:8,  Pending:3, Rejected:1 },
  { month:"Dec", Approved:5,  Pending:7, Rejected:3 },
  { month:"Jan", Approved:9,  Pending:4, Rejected:2 },
  { month:"Feb", Approved:11, Pending:6, Rejected:1 },
  { month:"Mar", Approved:7,  Pending:8, Rejected:2 },
];

const TYPE_DATA = [
  { name:"Home",      value:38 },
  { name:"Medical",   value:24 },
  { name:"Emergency", value:18 },
  { name:"Event",     value:12 },
  { name:"Other",     value:8  },
];

const PALETTE = {
  primary:   "#2563EB",
  approved:  "#059669",
  pending:   "#D97706",
  rejected:  "#DC2626",
  surface:   "#F8FAFF",
  border:    "#E8EEFF",
  text:      "#0F1629",
  muted:     "#6B7A99",
  pieColors: ["#2563EB","#059669","#F59E0B","#EC4899","#8B5CF6"],
};

/* ─── Helper: avatar bg ──────────────────────────────── */
const AVATAR_COLORS = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2","#BE185D"];
const avatarBg = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ─── MiniCalendar ───────────────────────────────────── */
function MiniCalendar({ leaves }) {
  const today = new Date(2026, 2, 10); // March 10 2026
  const [cur, setCur] = useState(new Date(2026, 2, 1));

  const year  = cur.getFullYear();
  const month = cur.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];

  // Which dates have active leaves?
  const activeDates = new Set();
  leaves.filter(l => l.status !== "Rejected").forEach(l => {
    const from = new Date(l.from), to = new Date(l.to);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate()+1)) {
      if (d.getMonth() === month && d.getFullYear() === year)
        activeDates.add(d.getDate());
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div style={{ fontFamily:"'Sora', sans-serif" }}>
      {/* Nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={() => setCur(new Date(year, month-1,1))}
          style={{ border:"none", background:"none", cursor:"pointer", color:PALETTE.muted, fontSize:18, padding:"2px 6px", borderRadius:6 }}>‹</button>
        <span style={{ fontWeight:600, fontSize:14, color:PALETTE.text }}>{MONTHS[month]}, {year}</span>
        <button onClick={() => setCur(new Date(year, month+1,1))}
          style={{ border:"none", background:"none", cursor:"pointer", color:PALETTE.muted, fontSize:18, padding:"2px 6px", borderRadius:6 }}>›</button>
      </div>
      {/* Day headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:600, color:PALETTE.muted, padding:"4px 0" }}>{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {cells.map((d, i) => (
          <div key={i} style={{
            height:32, display:"flex", alignItems:"center", justifyContent:"center",
            borderRadius:8, fontSize:12, fontWeight: isToday(d) ? 700 : d ? 500 : 400,
            cursor: d ? "default" : "default",
            background: isToday(d) ? PALETTE.primary : activeDates.has(d) ? "#DBEAFE" : "transparent",
            color: isToday(d) ? "#fff" : activeDates.has(d) ? PALETTE.primary : d ? PALETTE.text : "transparent",
            position:"relative",
          }}>
            {d || ""}
            {d && activeDates.has(d) && !isToday(d) && (
              <span style={{ position:"absolute", bottom:3, left:"50%", transform:"translateX(-50%)",
                width:4, height:4, borderRadius:"50%", background: PALETTE.primary }} />
            )}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ marginTop:16, padding:"10px 12px", background:"#EFF6FF", borderRadius:10, fontSize:11, color:PALETTE.muted, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:10, height:10, borderRadius:2, background:"#DBEAFE", display:"inline-block", border:`1px solid ${PALETTE.primary}` }}/>
        N – students on leave per day
      </div>
      {/* Total */}
      <div style={{ marginTop:12, borderTop:`1px solid ${PALETTE.border}`, paddingTop:12 }}>
        <div style={{ fontSize:12, color:PALETTE.muted, marginBottom:2 }}>Total on leave</div>
        <div style={{ fontSize:22, fontWeight:700, color:PALETTE.text }}>
          {leaves.filter(l => l.status !== "Rejected").length}
          <span style={{ fontSize:13, fontWeight:400, color:PALETTE.muted, marginLeft:6 }}>students</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────── */
function StatCard({ icon, value, label, delta, color, bg }) {
  return (
    <div style={{
      background:"#fff", borderRadius:20, padding:"22px 24px",
      border:`1px solid ${PALETTE.border}`,
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
      display:"flex", flexDirection:"column", gap:8,
      transition:"box-shadow .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 6px 24px rgba(37,99,235,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"}
    >
      <div style={{ width:40, height:40, borderRadius:12, background:bg,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
        {icon}
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
        <span style={{ fontSize:28, fontWeight:700, color:PALETTE.text, lineHeight:1 }}>{value}</span>
        <span style={{ fontSize:11, fontWeight:600, color, background:`${color}18`,
          padding:"2px 7px", borderRadius:20, marginBottom:2 }}>
          {delta}
        </span>
      </div>
      <div style={{ fontSize:13, color:PALETTE.muted, fontWeight:500 }}>{label}</div>
    </div>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:`1px solid ${PALETTE.border}`,
      borderRadius:12, padding:"10px 14px", boxShadow:"0 8px 24px rgba(0,0,0,0.10)",
      fontFamily:"'Sora', sans-serif", fontSize:12 }}>
      <div style={{ fontWeight:600, color:PALETTE.text, marginBottom:6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", gap:8, alignItems:"center", color:PALETTE.muted, marginBottom:2 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:p.color, display:"inline-block" }}/>
          {p.name}: <strong style={{ color:PALETTE.text }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ─── Reject Modal ───────────────────────────────────── */
function RejectModal({ leave, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,22,41,0.55)",
      backdropFilter:"blur(4px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:24, width:420, overflow:"hidden",
        boxShadow:"0 32px 80px rgba(0,0,0,0.18)", fontFamily:"'Sora', sans-serif" }}>
        <div style={{ background:"linear-gradient(135deg,#DC2626,#B91C1C)", padding:"24px 28px" }}>
          <div style={{ fontSize:18, fontWeight:700, color:"#fff" }}>Reject Leave Request</div>
          <div style={{ fontSize:13, color:"#FECACA", marginTop:4 }}>
            {leave.name} · {leave.type} Leave · {leave.days} days
          </div>
        </div>
        <div style={{ padding:"24px 28px" }}>
          <label style={{ fontSize:13, fontWeight:600, color:PALETTE.text, display:"block", marginBottom:8 }}>
            Rejection Reason <span style={{ color:PALETTE.rejected }}>*</span>
          </label>
          <textarea rows={4} value={reason} onChange={e => { setReason(e.target.value); setErr(""); }}
            placeholder="Explain why this leave is being rejected…"
            style={{ width:"100%", border:`1.5px solid ${err ? PALETTE.rejected : PALETTE.border}`,
              borderRadius:12, padding:"10px 14px", fontSize:13, fontFamily:"'Sora',sans-serif",
              resize:"none", outline:"none", color:PALETTE.text, boxSizing:"border-box" }} />
          {err && <div style={{ color:PALETTE.rejected, fontSize:12, marginTop:4 }}>{err}</div>}
          <div style={{ fontSize:11, color:PALETTE.muted, marginTop:6 }}>
            This reason will be sent to the student via notification and email.
          </div>
        </div>
        <div style={{ padding:"0 28px 24px", display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"10px 20px", border:`1.5px solid ${PALETTE.border}`,
            borderRadius:12, background:"none", cursor:"pointer", fontSize:13, color:PALETTE.muted,
            fontFamily:"'Sora',sans-serif" }}>Cancel</button>
          <button onClick={() => {
            if (reason.trim().length < 5) return setErr("Please enter at least 5 characters.");
            onConfirm(leave.id, reason);
          }} style={{ padding:"10px 22px", background:PALETTE.rejected, border:"none",
            borderRadius:12, cursor:"pointer", fontSize:13, fontWeight:600, color:"#fff",
            fontFamily:"'Sora',sans-serif" }}>Confirm Rejection</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════ */
export default function LeaveDashboard() {
  const [leaves, setLeaves] = useState(MOCK_LEAVES);
  const [activeTab, setActiveTab] = useState("requests"); // requests | analytics
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rejectModal, setRejectModal] = useState(null);

  const stats = useMemo(() => ({
    total:    leaves.length,
    pending:  leaves.filter(l => l.status === "Pending").length,
    approved: leaves.filter(l => l.status === "Approved").length,
    rejected: leaves.filter(l => l.status === "Rejected").length,
  }), [leaves]);

  const filtered = useMemo(() => leaves.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) &&
        !l.role.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "All"   && l.type !== typeFilter)   return false;
    if (statusFilter !== "All" && l.status !== statusFilter) return false;
    if (deptFilter !== "All"   && !l.role.startsWith(deptFilter)) return false;
    return true;
  }), [leaves, search, typeFilter, statusFilter, deptFilter]);

  const handleApprove = (id) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status:"Approved" } : l));
  };
  const handleReject = (id, reason) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status:"Rejected", rejectionReason: reason } : l));
    setRejectModal(null);
  };

  const statusStyle = (s) => {
    const map = {
      Pending:  { bg:"#FEF3C7", color:"#92400E" },
      Approved: { bg:"#D1FAE5", color:"#065F46" },
      Rejected: { bg:"#FEE2E2", color:"#991B1B" },
    };
    return map[s] || { bg:"#F1F5F9", color:"#475569" };
  };

  const DEPTS = ["All","CSE","ECE","IT","MECH","CIVIL"];
  const TYPES = ["All","Home","Medical","Emergency","Event","Other"];
  const STATUSES = ["All","Pending","Approved","Rejected"];

  return (
    <div style={{ fontFamily:"'Sora', sans-serif", background:PALETTE.surface,
      minHeight:"100vh", padding:24, color:PALETTE.text }}>

      {/* ── Reject Modal ─────────────────────────────── */}
      {rejectModal && (
        <RejectModal
          leave={rejectModal}
          onClose={() => setRejectModal(null)}
          onConfirm={handleReject}
        />
      )}

      {/* ── Header ───────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:PALETTE.primary,
            letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>
            SmartHostel · Warden Portal
          </div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:PALETTE.text }}>
            Leave Management
          </h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:PALETTE.muted }}>
            Tuesday, 10 March 2026 · Academic Year 2025–26
          </p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px",
          background:PALETTE.primary, color:"#fff", border:"none", borderRadius:12,
          fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer",
          boxShadow:"0 4px 14px rgba(37,99,235,0.35)" }}>
          <span style={{ fontSize:16 }}>+</span> New Request
        </button>
      </div>

      {/* ── Stat Cards ───────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard icon="📋" value={stats.total}    label="Total Leaves"  delta="+12.5%"  color="#2563EB" bg="#EFF6FF" />
        <StatCard icon="✅" value={stats.approved}  label="Approved"      delta="+4.1%"   color="#059669" bg="#ECFDF5" />
        <StatCard icon="⏳" value={stats.pending}   label="Pending"       delta="+5.1%"   color="#D97706" bg="#FFFBEB" />
        <StatCard icon="❌" value={stats.rejected}  label="Rejected"      delta="+25.5%"  color="#DC2626" bg="#FEF2F2" />
      </div>

      {/* ── Main Content ─────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>

        {/* LEFT PANEL */}
        <div>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, background:"#fff", borderRadius:14,
            padding:4, width:"fit-content", marginBottom:20,
            border:`1px solid ${PALETTE.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            {[["requests","📋 Leave Requests"],["analytics","📊 Analytics"]].map(([key,label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ padding:"8px 20px", borderRadius:10, border:"none",
                  background: activeTab===key ? PALETTE.primary : "none",
                  color: activeTab===key ? "#fff" : PALETTE.muted,
                  fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:13,
                  cursor:"pointer", transition:"all .15s" }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB: REQUESTS ── */}
          {activeTab === "requests" && (
            <div style={{ background:"#fff", borderRadius:20,
              border:`1px solid ${PALETTE.border}`, overflow:"hidden",
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>

              {/* Filters */}
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${PALETTE.border}`,
                background:"#FAFBFF", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

                {/* Search */}
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px",
                  border:`1.5px solid ${PALETTE.border}`, borderRadius:10, background:"#fff",
                  flex:1, minWidth:160, maxWidth:240 }}>
                  <span style={{ color:PALETTE.muted, fontSize:14 }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search student…"
                    style={{ border:"none", outline:"none", fontSize:13, color:PALETTE.text,
                      fontFamily:"'Sora',sans-serif", background:"none", width:"100%" }} />
                </div>

                {/* Type filter */}
                <div style={{ position:"relative" }}>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    style={{ appearance:"none", padding:"8px 32px 8px 12px",
                      border:`1.5px solid ${PALETTE.border}`, borderRadius:10, fontSize:13,
                      fontFamily:"'Sora',sans-serif", color:PALETTE.text, background:"#fff",
                      cursor:"pointer", outline:"none" }}>
                    {TYPES.map(t => <option key={t}>{t === "All" ? "Type of leave" : t}</option>)}
                  </select>
                  <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                    color:PALETTE.muted, pointerEvents:"none", fontSize:10 }}>▼</span>
                </div>

                {/* Dept filter */}
                <div style={{ position:"relative" }}>
                  <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                    style={{ appearance:"none", padding:"8px 32px 8px 12px",
                      border:`1.5px solid ${PALETTE.border}`, borderRadius:10, fontSize:13,
                      fontFamily:"'Sora',sans-serif", color:PALETTE.text, background:"#fff",
                      cursor:"pointer", outline:"none" }}>
                    {DEPTS.map(d => <option key={d}>{d === "All" ? "Department" : d}</option>)}
                  </select>
                  <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                    color:PALETTE.muted, pointerEvents:"none", fontSize:10 }}>▼</span>
                </div>

                {/* Status filter */}
                <div style={{ position:"relative" }}>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    style={{ appearance:"none", padding:"8px 32px 8px 12px",
                      border:`1.5px solid ${PALETTE.border}`, borderRadius:10, fontSize:13,
                      fontFamily:"'Sora',sans-serif", color:PALETTE.text, background:"#fff",
                      cursor:"pointer", outline:"none" }}>
                    {STATUSES.map(s => <option key={s}>{s === "All" ? "All Status" : s}</option>)}
                  </select>
                  <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                    color:PALETTE.muted, pointerEvents:"none", fontSize:10 }}>▼</span>
                </div>

                {(search || typeFilter !== "All" || deptFilter !== "All" || statusFilter !== "All") && (
                  <button onClick={() => { setSearch(""); setTypeFilter("All"); setDeptFilter("All"); setStatusFilter("All"); }}
                    style={{ padding:"8px 12px", border:`1.5px solid ${PALETTE.border}`, borderRadius:10,
                      background:"none", color:PALETTE.muted, fontFamily:"'Sora',sans-serif",
                      fontSize:12, cursor:"pointer" }}>✕ Clear</button>
                )}
              </div>

              {/* Table header */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 1fr 140px",
                padding:"10px 20px", borderBottom:`1px solid ${PALETTE.border}`,
                background:"#F8FAFF" }}>
                {["Employee","Leave Request Dates","Days","Type","Status","Action"].map(h => (
                  <div key={h} style={{ fontSize:11, fontWeight:600, color:PALETTE.muted,
                    textTransform:"uppercase", letterSpacing:"0.06em", display:"flex", alignItems:"center", gap:4 }}>
                    {h}
                    {h === "Days" && <span style={{ cursor:"pointer", fontSize:10 }}>↕</span>}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div>
                {filtered.length === 0 ? (
                  <div style={{ padding:"48px 20px", textAlign:"center", color:PALETTE.muted }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>🗂️</div>
                    <div style={{ fontWeight:600 }}>No leave requests match your filters</div>
                  </div>
                ) : filtered.map((leave, idx) => {
                  const { bg: sBg, color: sColor } = statusStyle(leave.status);
                  return (
                    <div key={leave.id}
                      style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 1fr 140px",
                        padding:"14px 20px", borderBottom: idx < filtered.length - 1 ? `1px solid ${PALETTE.border}` : "none",
                        alignItems:"center", transition:"background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background="#F0F5FF"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>

                      {/* Name + role */}
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:12,
                          background:avatarBg(leave.name), color:"#fff",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:12, fontWeight:700, flexShrink:0 }}>
                          {leave.avatar}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:PALETTE.text }}>{leave.name}</div>
                          <div style={{ fontSize:11, color:PALETTE.muted }}>{leave.role}</div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div>
                        <div style={{ fontSize:12, fontFamily:"'DM Mono',monospace", color:PALETTE.text }}>
                          {leave.from} — {leave.to}
                        </div>
                        <div style={{ fontSize:11, color:PALETTE.muted }}>
                          out of remaining {leave.remaining}
                        </div>
                      </div>

                      {/* Days */}
                      <div style={{ fontSize:13, fontWeight:600, color:PALETTE.text }}>
                        {leave.days} days
                      </div>

                      {/* Type */}
                      <div style={{ fontSize:12, color:PALETTE.muted, display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:PALETTE.primary, display:"inline-block" }}/>
                        {leave.type}
                      </div>

                      {/* Status badge */}
                      <div>
                        <span style={{ background:sBg, color:sColor,
                          fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>
                          {leave.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display:"flex", gap:6 }}>
                        {leave.status === "Pending" ? (
                          <>
                            <button onClick={() => handleApprove(leave.id)}
                              style={{ padding:"6px 12px", background:PALETTE.approved, color:"#fff",
                                border:"none", borderRadius:8, fontSize:12, fontWeight:600,
                                cursor:"pointer", fontFamily:"'Sora',sans-serif",
                                transition:"opacity .15s" }}
                              onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                              onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                              Approve
                            </button>
                            <button onClick={() => setRejectModal(leave)}
                              style={{ padding:"6px 12px", background:"#fff", color:PALETTE.rejected,
                                border:`1.5px solid ${PALETTE.rejected}`, borderRadius:8, fontSize:12,
                                fontWeight:600, cursor:"pointer", fontFamily:"'Sora',sans-serif",
                                transition:"all .15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background=PALETTE.rejected; e.currentTarget.style.color="#fff"; }}
                              onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.color=PALETTE.rejected; }}>
                              Reject
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize:12, color:PALETTE.muted, fontStyle:"italic" }}>
                            {leave.status === "Rejected" ? "Reason on file" : "—"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{ padding:"12px 20px", borderTop:`1px solid ${PALETTE.border}`,
                display:"flex", justifyContent:"space-between", alignItems:"center",
                background:"#FAFBFF" }}>
                <span style={{ fontSize:12, color:PALETTE.muted }}>
                  Showing {filtered.length} of {leaves.length} requests
                </span>
                <div style={{ display:"flex", gap:6 }}>
                  {["←","1","2","→"].map((p,i) => (
                    <button key={i} style={{ width:28, height:28, border:`1.5px solid ${p==="1"?PALETTE.primary:PALETTE.border}`,
                      borderRadius:8, background: p==="1"?PALETTE.primary:"#fff",
                      color: p==="1"?"#fff":PALETTE.muted, fontSize:12, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Area chart */}
              <div style={{ background:"#fff", borderRadius:20, padding:"20px 24px",
                border:`1px solid ${PALETTE.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:PALETTE.text }}>Leave Trend</div>
                    <div style={{ fontSize:12, color:PALETTE.muted, marginTop:2 }}>Monthly breakdown by status</div>
                  </div>
                  <span style={{ fontSize:12, color:PALETTE.muted, background:"#F1F5F9",
                    padding:"4px 10px", borderRadius:8 }}>Last 7 months</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={MONTHLY_DATA} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                    <defs>
                      {[["approved","#059669"],["pending","#D97706"],["rejected","#DC2626"]].map(([k,c]) => (
                        <linearGradient key={k} id={`g_${k}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={c} stopOpacity={0.18}/>
                          <stop offset="95%" stopColor={c} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF" />
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:PALETTE.muted, fontFamily:"Sora" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:11, fill:PALETTE.muted, fontFamily:"Sora" }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="Approved" stroke="#059669" fill="url(#g_approved)" strokeWidth={2.5} dot={{ r:4, fill:"#059669", strokeWidth:0 }} activeDot={{ r:6 }}/>
                    <Area type="monotone" dataKey="Pending"  stroke="#D97706" fill="url(#g_pending)"  strokeWidth={2.5} dot={false}/>
                    <Area type="monotone" dataKey="Rejected" stroke="#DC2626" fill="url(#g_rejected)" strokeWidth={2}   dot={false} strokeDasharray="4 3"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie + bar side by side */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

                {/* Pie */}
                <div style={{ background:"#fff", borderRadius:20, padding:"20px 24px",
                  border:`1px solid ${PALETTE.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontWeight:700, fontSize:15, color:PALETTE.text, marginBottom:4 }}>Leave Type Mix</div>
                  <div style={{ fontSize:12, color:PALETTE.muted, marginBottom:12 }}>Distribution by category</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={TYPE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                        paddingAngle={3} dataKey="value">
                        {TYPE_DATA.map((_, i) => (
                          <Cell key={i} fill={PALETTE.pieColors[i % PALETTE.pieColors.length]} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" iconSize={8}
                        formatter={(v) => <span style={{ fontSize:11, color:PALETTE.muted, fontFamily:"Sora" }}>{v}</span>} />
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Quick stats */}
                <div style={{ background:"#fff", borderRadius:20, padding:"20px 24px",
                  border:`1px solid ${PALETTE.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontWeight:700, fontSize:15, color:PALETTE.text, marginBottom:4 }}>This Month</div>
                  <div style={{ fontSize:12, color:PALETTE.muted, marginBottom:18 }}>March 2026 snapshot</div>

                  {[
                    { label:"New Requests",    value:8,  color:PALETTE.primary  },
                    { label:"Approvals",        value:3,  color:PALETTE.approved },
                    { label:"Rejections",       value:1,  color:PALETTE.rejected },
                    { label:"Avg. Duration",    value:"5.2d", color:"#7C3AED" },
                    { label:"Students on Leave",value:6,  color:PALETTE.pending  },
                  ].map(item => (
                    <div key={item.label} style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ width:8, height:8, borderRadius:2, background:item.color, display:"inline-block" }}/>
                        <span style={{ fontSize:12, color:PALETTE.muted }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize:15, fontWeight:700, color:PALETTE.text }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Calendar + summary */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Calendar card */}
          <div style={{ background:"#fff", borderRadius:20, padding:"20px 20px 16px",
            border:`1px solid ${PALETTE.border}`,
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <MiniCalendar leaves={leaves} />
          </div>

          {/* Latest 3 requests */}
          <div style={{ background:"#fff", borderRadius:20, padding:"18px 20px",
            border:`1px solid ${PALETTE.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontWeight:700, fontSize:14, color:PALETTE.text, marginBottom:14 }}>
              My latest leaves
            </div>
            {leaves.slice(-3).reverse().map(leave => {
              const { bg: sBg, color: sColor } = statusStyle(leave.status);
              return (
                <div key={leave.id} style={{ marginBottom:12, paddingBottom:12,
                  borderBottom:`1px solid ${PALETTE.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:PALETTE.text }}>{leave.type} Leave (UPL)</div>
                      <div style={{ fontSize:11, color:PALETTE.muted, marginTop:2,
                        fontFamily:"'DM Mono',monospace" }}>
                        {leave.from} – {leave.to}
                      </div>
                    </div>
                    <span style={{ background:sBg, color:sColor,
                      fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>
                      {leave.status}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:12, marginTop:6 }}>
                    <span style={{ fontSize:11, color:PALETTE.muted }}>Time · {leave.days} days</span>
                    <span style={{ fontSize:11, color:PALETTE.muted }}>{leave.from}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending approvals counter */}
          <div style={{ background:`linear-gradient(135deg, ${PALETTE.primary}, #1D4ED8)`,
            borderRadius:20, padding:"18px 20px", color:"#fff",
            boxShadow:"0 8px 24px rgba(37,99,235,0.30)" }}>
            <div style={{ fontSize:12, fontWeight:600, opacity:0.85, marginBottom:8 }}>
              Awaiting Your Action
            </div>
            <div style={{ fontSize:36, fontWeight:700 }}>
              {leaves.filter(l => l.status === "Pending").length}
            </div>
            <div style={{ fontSize:12, opacity:0.75, marginTop:2 }}>pending leave requests</div>
            <button style={{ marginTop:14, padding:"8px 16px", background:"rgba(255,255,255,0.2)",
              border:"1px solid rgba(255,255,255,0.3)", borderRadius:10, color:"#fff",
              fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer",
              width:"100%", transition:"background .15s" }}
              onClick={() => { setActiveTab("requests"); setStatusFilter("Pending"); }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.2)"}>
              Review All Pending →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
