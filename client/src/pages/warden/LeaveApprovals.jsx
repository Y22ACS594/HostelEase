// src/pages/warden/LeaveApprovals.jsx
// Mobile + Desktop responsive
// Optimistic approve/reject, 30s polling, tab-switch re-fetch, focus re-fetch
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { getAllLeaves, updateLeaveStatus, getLeaveStats } from "../../services/leaveService";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";

if (!document.getElementById("la-sora")) {
  const l = document.createElement("link");
  l.id = "la-sora"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
}

const P = {
  primary:"#2563EB", approved:"#059669", pending:"#D97706",
  rejected:"#DC2626", surface:"#F8FAFF", border:"#E8EEFF",
  text:"#0F1629", muted:"#6B7A99",
  pieColors:["#2563EB","#059669","#F59E0B","#EC4899","#8B5CF6","#0891B2"],
};

/* ── helpers ── */
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${bp - 1}px)`);
    const h = (e) => setM(e.matches);
    mq.addEventListener("change", h);
    setM(mq.matches);
    return () => mq.removeEventListener("change", h);
  }, [bp]);
  return m;
}

const PRIORITY_ORDER = { Emergency: 0, Medical: 1 };
const getPriority    = (t) => PRIORITY_ORDER[t] ?? 99;
const PRIORITY_BADGE = {
  Emergency: { bg:"#FEF2F2", color:"#DC2626", icon:"🚨", label:"URGENT" },
  Medical:   { bg:"#FFFBEB", color:"#D97706", icon:"🏥", label:"HIGH"   },
};
const statusStyle = (s) => ({
  Pending:  { bg:"#FEF3C7", color:"#92400E" },
  Approved: { bg:"#D1FAE5", color:"#065F46" },
  Rejected: { bg:"#FEE2E2", color:"#991B1B" },
}[s] || { bg:"#F1F5F9", color:"#475569" });

const fmtDate     = (d) => d ? String(d).slice(0,10) : "—";
const daysBetween = (from, to) => {
  const a = new Date(from), b = new Date(to);
  return isNaN(a)||isNaN(b) ? "—" : Math.max(1, Math.ceil((b-a)/86400000)+1);
};
const MONTH_NAMES  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const avatarColors = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2","#BE185D"];
const avatarBg = (n="") => avatarColors[(n.charCodeAt(0)||0) % avatarColors.length];
const initials  = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();

/* ── StatCard ── */
function StatCard({ icon, value, label, color, bg, pulse, compact }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:"#fff", borderRadius:16, padding: compact ? "14px 16px" : "22px 24px",
        border:`1px solid ${pulse ? color : P.border}`,
        boxShadow: hov ? `0 6px 24px ${color}22` : "0 1px 4px rgba(0,0,0,0.04)",
        display:"flex", flexDirection: compact ? "row" : "column",
        alignItems: compact ? "center" : "flex-start",
        gap: compact ? 10 : 8, transition:"box-shadow .2s, border-color .2s",
        position:"relative", overflow:"hidden" }}>
      {pulse && <span style={{ position:"absolute", top:8, right:10, width:8, height:8,
        borderRadius:"50%", background:color, animation:"la-pulse 1.5s ease infinite" }}/>}
      <div style={{ width: compact ? 32 : 40, height: compact ? 32 : 40, borderRadius:10,
        background:bg, display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: compact ? 16 : 18, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: compact ? 20 : 28, fontWeight:700, color:P.text, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize: compact ? 11 : 13, color:P.muted, fontWeight:500, marginTop:2 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Chart Tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:`1px solid ${P.border}`, borderRadius:12,
      padding:"10px 14px", boxShadow:"0 8px 24px rgba(0,0,0,0.10)",
      fontFamily:"'Sora',sans-serif", fontSize:12 }}>
      <div style={{ fontWeight:600, color:P.text, marginBottom:6 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ display:"flex", gap:8, alignItems:"center", color:P.muted, marginBottom:2 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:p.color, display:"inline-block" }}/>
          {p.name}: <strong style={{ color:P.text }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ── Mini Calendar ── */
function MiniCalendar({ leaves }) {
  const now = new Date();
  const [cur, setCur] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const year = cur.getFullYear(), month = cur.getMonth();
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const activeDates = new Set();
  leaves.filter(l => l.status !== "Rejected").forEach(l => {
    const from = new Date(l.fromDate), to = new Date(l.toDate);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate()+1))
      if (d.getMonth()===month && d.getFullYear()===year) activeDates.add(d.getDate());
  });
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const isToday = (d) => d===now.getDate() && month===now.getMonth() && year===now.getFullYear();
  return (
    <div style={{ fontFamily:"'Sora',sans-serif" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <button onClick={() => setCur(new Date(year,month-1,1))}
          style={{ border:"none", background:"none", cursor:"pointer", color:P.muted, fontSize:18, padding:"2px 6px" }}>‹</button>
        <span style={{ fontWeight:600, fontSize:13, color:P.text }}>{MONTH_NAMES[month]}, {year}</span>
        <button onClick={() => setCur(new Date(year,month+1,1))}
          style={{ border:"none", background:"none", cursor:"pointer", color:P.muted, fontSize:18, padding:"2px 6px" }}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:600, color:P.muted, padding:"3px 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {cells.map((d,i) => (
          <div key={i} style={{ height:28, display:"flex", alignItems:"center", justifyContent:"center",
            borderRadius:7, fontSize:11, fontWeight:isToday(d)?700:d?500:400,
            background:isToday(d)?P.primary:activeDates.has(d)?"#DBEAFE":"transparent",
            color:isToday(d)?"#fff":activeDates.has(d)?P.primary:d?P.text:"transparent",
            position:"relative" }}>
            {d||""}
            {d && activeDates.has(d) && !isToday(d) && (
              <span style={{ position:"absolute", bottom:2, left:"50%", transform:"translateX(-50%)",
                width:3, height:3, borderRadius:"50%", background:P.primary }}/>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop:12, borderTop:`1px solid ${P.border}`, paddingTop:10 }}>
        <div style={{ fontSize:11, color:P.muted, marginBottom:2 }}>Total on leave</div>
        <div style={{ fontSize:20, fontWeight:700, color:P.text }}>
          {leaves.filter(l => l.status!=="Rejected").length}
          <span style={{ fontSize:12, fontWeight:400, color:P.muted, marginLeft:6 }}>students</span>
        </div>
      </div>
    </div>
  );
}

/* ── Reject Modal ── */
function RejectModal({ leave, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  const [err, setErr]       = useState("");
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(15,22,41,0.55)",
        backdropFilter:"blur(4px)", zIndex:200, display:"flex",
        alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:420,
        overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.18)", fontFamily:"'Sora',sans-serif" }}>
        <div style={{ background:"linear-gradient(135deg,#DC2626,#B91C1C)", padding:"20px 24px" }}>
          <div style={{ fontSize:17, fontWeight:700, color:"#fff" }}>Reject Leave Request</div>
          <div style={{ fontSize:12, color:"#FECACA", marginTop:4 }}>
            {leave.student?.fullName} · {leave.leaveType} · {daysBetween(leave.fromDate,leave.toDate)} days
          </div>
        </div>
        <div style={{ padding:"20px 24px" }}>
          <label style={{ fontSize:13, fontWeight:600, color:P.text, display:"block", marginBottom:8 }}>
            Rejection Reason <span style={{ color:"#DC2626" }}>*</span>
          </label>
          <textarea rows={4} value={reason} onChange={e => { setReason(e.target.value); setErr(""); }}
            placeholder="Explain why this leave is being rejected…"
            style={{ width:"100%", border:`1.5px solid ${err?"#DC2626":P.border}`,
              borderRadius:12, padding:"10px 14px", fontSize:13, fontFamily:"'Sora',sans-serif",
              resize:"none", outline:"none", color:P.text, boxSizing:"border-box" }}/>
          {err && <div style={{ color:"#DC2626", fontSize:12, marginTop:4 }}>{err}</div>}
        </div>
        <div style={{ padding:"0 24px 20px", display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} disabled={loading}
            style={{ padding:"10px 20px", border:`1.5px solid ${P.border}`, borderRadius:12,
              background:"none", cursor:"pointer", fontSize:13, color:P.muted,
              fontFamily:"'Sora',sans-serif", minHeight:44 }}>
            Cancel
          </button>
          <button onClick={() => {
            if (reason.trim().length < 5) return setErr("Please enter at least 5 characters.");
            onConfirm(leave._id, reason.trim());
          }} disabled={loading}
            style={{ padding:"10px 22px", background:loading?"#FCA5A5":"#DC2626", border:"none",
              borderRadius:12, cursor:loading?"not-allowed":"pointer", fontSize:13, fontWeight:600,
              color:"#fff", fontFamily:"'Sora',sans-serif", minHeight:44 }}>
            {loading ? "Rejecting…" : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Leave Card ── */
function MobileLeaveCard({ leave, onApprove, onReject, actionLoading }) {
  const { bg:sBg, color:sColor } = statusStyle(leave.status);
  const name   = leave.student?.fullName ?? "Unknown";
  const dept   = leave.student?.department ?? "";
  const batch  = leave.student?.batch ?? "";
  const days   = daysBetween(leave.fromDate, leave.toDate);
  const pBadge = PRIORITY_BADGE[leave.leaveType];
  const isEmg  = leave.leaveType==="Emergency" && leave.status==="Pending";
  const isProc = actionLoading === leave._id;

  return (
    <div style={{ background:"#fff", border:`1.5px solid ${isEmg?"#FECACA":P.border}`,
      borderRadius:14, padding:"14px 16px", marginBottom:10,
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)", opacity:isProc?0.7:1,
      transition:"opacity .2s" }}>

      {/* Top: avatar + name + status */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:40, height:40, borderRadius:12, flexShrink:0,
          background:avatarBg(name), color:"#fff",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:700 }}>
          {initials(name)}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:P.text,
            display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            {name}
            {pBadge && leave.status==="Pending" && (
              <span style={{ fontSize:10, fontWeight:700, background:pBadge.bg,
                color:pBadge.color, padding:"2px 6px", borderRadius:12 }}>
                {pBadge.icon} {pBadge.label}
              </span>
            )}
          </div>
          <div style={{ fontSize:11, color:P.muted }}>{dept}{batch?` — ${batch}`:""}</div>
        </div>
        <span style={{ background:sBg, color:sColor, fontSize:10, fontWeight:700,
          padding:"4px 9px", borderRadius:20, flexShrink:0,
          display:"inline-flex", alignItems:"center", gap:4 }}>
          {isProc && <span style={{ width:9, height:9, border:`2px solid ${sColor}33`,
            borderTop:`2px solid ${sColor}`, borderRadius:"50%",
            display:"inline-block", animation:"la-spin .6s linear infinite" }}/>}
          {leave.status}
        </span>
      </div>

      {/* Details grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8,
        padding:"10px 12px", background:P.surface, borderRadius:10, marginBottom:10 }}>
        {[["Dates", `${fmtDate(leave.fromDate)} → ${fmtDate(leave.toDate)}`],
          ["Days",  `${days}d`],
          ["Type",  leave.leaveType || "Other"]
        ].map(([k,v]) => (
          <div key={k}>
            <div style={{ fontSize:9, fontWeight:700, color:P.muted,
              textTransform:"uppercase", letterSpacing:"0.06em" }}>{k}</div>
            <div style={{ fontSize:11, fontWeight:600, color:P.text, marginTop:2 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Reason */}
      {leave.reason && (
        <div style={{ fontSize:11, color:P.muted, marginBottom:10, lineHeight:1.4,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          📝 {leave.reason}
        </div>
      )}

      {/* Actions */}
      {leave.status==="Pending" && (
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => onApprove(leave._id)} disabled={!!actionLoading}
            style={{ flex:1, padding:"10px", background:actionLoading?"#D1FAE5":"#059669",
              color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:600,
              cursor:actionLoading?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif", minHeight:44 }}>
            {isProc ? "…" : "✓ Approve"}
          </button>
          <button onClick={() => onReject(leave)} disabled={!!actionLoading}
            style={{ flex:1, padding:"10px", background:"#fff", color:"#DC2626",
              border:"1.5px solid #DC2626", borderRadius:10, fontSize:13, fontWeight:600,
              cursor:actionLoading?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif", minHeight:44 }}>
            ✕ Reject
          </button>
        </div>
      )}
      {leave.status==="Rejected" && leave.rejectionReason && (
        <div style={{ padding:"8px 10px", background:"#FEF2F2", borderRadius:8,
          fontSize:11, color:"#991B1B" }}>
          <strong>Rejected:</strong> {leave.rejectionReason}
        </div>
      )}
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }) {
  const start = Math.max(1, page-2), end = Math.min(totalPages, page+2);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);
  const btn = (active, disabled=false) => ({
    minWidth:32, height:32, border:`1.5px solid ${active?P.primary:P.border}`,
    borderRadius:8, background:active?P.primary:"#fff",
    color:active?"#fff":P.muted, fontSize:13, cursor:disabled?"not-allowed":"pointer",
    fontFamily:"'Sora',sans-serif", opacity:disabled?0.4:1,
    display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px",
  });
  return (
    <div style={{ padding:"12px 16px", borderTop:`1px solid ${P.border}`,
      display:"flex", justifyContent:"space-between", alignItems:"center",
      background:"#FAFBFF", flexWrap:"wrap", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:12, color:P.muted }}>
          {total===0?"No results":`${Math.min((page-1)*limit+1,total)}–${Math.min(page*limit,total)} of ${total}`}
        </span>
        <div style={{ position:"relative" }}>
          <select value={limit} onChange={e => onLimitChange(Number(e.target.value))}
            style={{ appearance:"none", padding:"5px 26px 5px 8px", border:`1.5px solid ${P.border}`,
              borderRadius:8, fontSize:12, fontFamily:"'Sora',sans-serif", color:P.text,
              background:"#fff", cursor:"pointer", outline:"none" }}>
            {[10,20,50,100].map(n => <option key={n} value={n}>Show {n}</option>)}
          </select>
          <span style={{ position:"absolute", right:7, top:"50%", transform:"translateY(-50%)",
            color:P.muted, pointerEvents:"none", fontSize:9 }}>▼</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
        <button onClick={() => onPageChange(1)}          disabled={page===1}          style={btn(false,page===1)}>«</button>
        <button onClick={() => onPageChange(page-1)}     disabled={page===1}          style={btn(false,page===1)}>‹</button>
        {start>1 && <span style={{ fontSize:12, color:P.muted }}>…</span>}
        {pages.map(p => <button key={p} onClick={() => onPageChange(p)} style={btn(p===page)}>{p}</button>)}
        {end<totalPages && <span style={{ fontSize:12, color:P.muted }}>…</span>}
        <button onClick={() => onPageChange(page+1)}     disabled={page===totalPages} style={btn(false,page===totalPages)}>›</button>
        <button onClick={() => onPageChange(totalPages)} disabled={page===totalPages} style={btn(false,page===totalPages)}>»</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════ */
const LeaveApprovals = () => {
  const isMobile = useIsMobile();
  const [leaves,        setLeaves]        = useState([]);
  const [pagination,    setPagination]    = useState({ total:0, page:1, limit:20, totalPages:1 });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab,     setActiveTab]     = useState("requests");
  const [search,        setSearch]        = useState("");
  const [typeFilter,    setTypeFilter]    = useState("All");
  const [deptFilter,    setDeptFilter]    = useState("All");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [sortPriority,  setSortPriority]  = useState(true);
  const [rejectModal,   setRejectModal]   = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [fetching,      setFetching]      = useState(true);
  const [statsLoading,  setStatsLoading]  = useState(false);
  const [newBanner,     setNewBanner]     = useState(false);

  const lastPendingRef   = useRef(null);
  const currentParamsRef = useRef({ page:1, limit:20 });

  const doFetch = useCallback(async (params={}, silent=false) => {
    if (!silent) setFetching(true);
    try {
      const res  = await getAllLeaves(params);
      const raw  = res.data;
      const data = raw?.leaves ?? raw ?? [];
      const pg   = raw?.pagination ?? {
        total: Array.isArray(data)?data.length:0, page:1, limit:params.limit??20, totalPages:1,
      };
      setLeaves(Array.isArray(data)?data:[]);
      setPagination(pg);
      const newPending = Array.isArray(data) ? data.filter(l => l.status==="Pending").length : 0;
      if (lastPendingRef.current!==null && newPending>lastPendingRef.current && silent) setNewBanner(true);
      lastPendingRef.current = newPending;
    } catch(e) {
      if (!silent) { console.error(e); setLeaves([]); }
    } finally {
      if (!silent) setFetching(false);
    }
  }, []);

  const buildParams = useCallback((overrides={}) => {
    const p = {
      page:        overrides.page   ?? pagination.page,
      limit:       overrides.limit  ?? pagination.limit,
      leaveType:   overrides.type   ?? (typeFilter  !=="All"?typeFilter  :""),
      department:  overrides.dept   ?? (deptFilter  !=="All"?deptFilter  :""),
      status:      overrides.status ?? (statusFilter!=="All"?statusFilter:""),
      studentName: overrides.search ?? search,
    };
    currentParamsRef.current = p;
    return p;
  }, [pagination.page, pagination.limit, typeFilter, deptFilter, statusFilter, search]);

  const applyFilters = useCallback((overrides={}) => {
    doFetch(buildParams(overrides));
  }, [buildParams, doFetch]);

  useEffect(() => { doFetch({ page:1, limit:20 }); }, []);
  useEffect(() => { if (activeTab==="requests") doFetch(currentParamsRef.current); }, [activeTab]); // eslint-disable-line
  useEffect(() => {
    const id = setInterval(() => {
      if (activeTab==="requests") doFetch(currentParamsRef.current, true);
    }, 30_000);
    return () => clearInterval(id);
  }, [doFetch, activeTab]);
  useEffect(() => {
    const h = () => { if (!document.hidden && activeTab==="requests") doFetch(currentParamsRef.current, true); };
    document.addEventListener("visibilitychange", h);
    window.addEventListener("focus", h);
    return () => { document.removeEventListener("visibilitychange", h); window.removeEventListener("focus", h); };
  }, [doFetch, activeTab]);

  const fetchAnalytics = async () => {
    setStatsLoading(true);
    try { const res = await getLeaveStats(); setAnalyticsData(res.data); }
    catch(e) { console.error(e); }
    finally { setStatsLoading(false); }
  };
  useEffect(() => { if (activeTab==="analytics" && !analyticsData) fetchAnalytics(); }, [activeTab]); // eslint-disable-line

  const handleApprove = async (id) => {
    setActionLoading(id);
    setLeaves(prev => prev.map(l => l._id===id ? {...l, status:"Approved"} : l));
    try {
      await updateLeaveStatus(id, "Approved", "");
      doFetch(currentParamsRef.current, true);
    } catch(e) {
      setLeaves(prev => prev.map(l => l._id===id ? {...l, status:"Pending"} : l));
      alert(e.response?.data?.message || "Approve failed.");
    } finally { setActionLoading(null); }
  };

  const handleRejectConfirm = async (id, reason) => {
    setActionLoading(id);
    setLeaves(prev => prev.map(l => l._id===id ? {...l, status:"Rejected", rejectionReason:reason} : l));
    setRejectModal(null);
    try {
      await updateLeaveStatus(id, "Rejected", reason);
      doFetch(currentParamsRef.current, true);
    } catch(e) {
      setLeaves(prev => prev.map(l => l._id===id ? {...l, status:"Pending", rejectionReason:undefined} : l));
      alert(e.response?.data?.message || "Reject failed.");
    } finally { setActionLoading(null); }
  };

  const livePending  = leaves.filter(l => l.status==="Pending").length;
  const liveApproved = leaves.filter(l => l.status==="Approved").length;
  const liveRejected = leaves.filter(l => l.status==="Rejected").length;
  const summary = { total:pagination.total||leaves.length, pending:livePending, approved:liveApproved, rejected:liveRejected };

  const sortedLeaves = useMemo(() => {
    if (!sortPriority) return leaves;
    return [...leaves].sort((a,b) => {
      const pa=getPriority(a.leaveType), pb=getPriority(b.leaveType);
      if (pa!==pb) return pa-pb;
      if (a.status==="Pending"&&b.status!=="Pending") return -1;
      if (a.status!=="Pending"&&b.status==="Pending") return  1;
      return 0;
    });
  }, [leaves, sortPriority]);

  const monthlyChartData = useMemo(() => {
    if (!analyticsData?.monthly) return [];
    const map = {};
    analyticsData.monthly.forEach(({ _id, count }) => {
      const m = MONTH_NAMES[(_id.month||1)-1];
      if (!map[m]) map[m] = { month:m, Approved:0, Pending:0, Rejected:0 };
      map[m][_id.status] = count;
    });
    return Object.values(map);
  }, [analyticsData]);

  const typeChartData = useMemo(() =>
    (analyticsData?.byType||[]).map(({_id,count}) => ({name:_id||"Other",value:count})),
    [analyticsData]);

  const deptChartData = useMemo(() =>
    (analyticsData?.byDepartment||[]).slice(0,8).map(d => ({
      dept:d._id||"Other", Total:d.total, Approved:d.approved, Pending:d.pending, Rejected:d.rejected,
    })),
    [analyticsData]);

  const TYPES    = ["All","Casual","Medical","Emergency","Home","Event","Other"];
  const DEPTS    = ["All","CSE","ECE","IT","MECH","CIVIL"];
  const STATUSES = ["All","Pending","Approved","Rejected"];
  const todayStr = new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const emergencyPending = leaves.filter(l => l.leaveType==="Emergency" && l.status==="Pending");

  return (
    <div style={{ fontFamily:"'Sora',sans-serif", background:P.surface,
      minHeight:"100vh", padding:isMobile?"0 0 80px":"24px", color:P.text }}>
      <style>{`
        @keyframes la-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(217,119,6,.5)} 50%{box-shadow:0 0 0 6px rgba(217,119,6,0)} }
        @keyframes la-slide  { from{transform:translateY(-120%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes la-spin   { to{transform:rotate(360deg)} }
      `}</style>

      {rejectModal && (
        <RejectModal leave={rejectModal} onClose={() => setRejectModal(null)}
          onConfirm={handleRejectConfirm} loading={!!actionLoading}/>
      )}

      {newBanner && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)",
          zIndex:9999, background:"#111827", color:"#fff", borderRadius:14,
          padding:"12px 20px", fontSize:13, fontWeight:600,
          boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
          display:"flex", alignItems:"center", gap:12,
          animation:"la-slide .3s ease" }}>
          🔔 New leave request!
          <button onClick={() => { setNewBanner(false); doFetch({page:1,limit:pagination.limit}); }}
            style={{ background:P.primary, color:"#fff", border:"none", borderRadius:8,
              padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
            View
          </button>
          <button onClick={() => setNewBanner(false)}
            style={{ background:"none", border:"none", color:"rgba(255,255,255,0.55)",
              cursor:"pointer", fontSize:18, padding:0 }}>✕</button>
        </div>
      )}

      {/* ── MOBILE HEADER ── */}
      {isMobile ? (
        <div style={{ background:"#fff", borderBottom:`1px solid ${P.border}`,
          padding:"14px 16px", position:"sticky", top:56, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:P.primary,
                letterSpacing:"0.1em", textTransform:"uppercase" }}>Warden Portal</div>
              <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:P.text }}>Leave Management</h1>
            </div>
            <button onClick={() => applyFilters({page:pagination.page})}
              style={{ padding:"8px 14px", background:P.primary, color:"#fff", border:"none",
                borderRadius:10, fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>
              ↻ {fetching ? "…" : "Refresh"}
            </button>
          </div>
          {/* Mobile stat row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {[
              {icon:"📋",v:summary.total,   label:"Total",    color:P.primary,  bg:"#EFF6FF"},
              {icon:"✅",v:summary.approved, label:"Approved", color:P.approved, bg:"#ECFDF5"},
              {icon:"⏳",v:summary.pending,  label:"Pending",  color:P.pending,  bg:"#FFFBEB", pulse:summary.pending>0},
              {icon:"✖",v:summary.rejected,  label:"Rejected", color:P.rejected, bg:"#FEF2F2"},
            ].map(c => (
              <div key={c.label} style={{ background:"#fff", border:`1px solid ${c.pulse?c.color:P.border}`,
                borderRadius:10, padding:"8px", textAlign:"center", position:"relative" }}>
                {c.pulse && <span style={{ position:"absolute", top:4, right:4, width:6, height:6,
                  borderRadius:"50%", background:c.color, animation:"la-pulse 1.5s ease infinite" }}/>}
                <div style={{ fontSize:16, fontWeight:800, color:c.color }}>{fetching?"…":c.v}</div>
                <div style={{ fontSize:9, color:P.muted, marginTop:2 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── DESKTOP HEADER ── */
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:P.primary, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>
              HostelEase · Warden Portal
            </div>
            <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:P.text }}>Leave Management</h1>
            <p style={{ margin:"4px 0 0", fontSize:13, color:P.muted }}>{todayStr}</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {fetching && (
              <span style={{ fontSize:12, color:P.muted, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:14, height:14, border:`2px solid ${P.border}`,
                  borderTop:`2px solid ${P.primary}`, borderRadius:"50%",
                  display:"inline-block", animation:"la-spin .7s linear infinite" }}/>
                Syncing…
              </span>
            )}
            <button onClick={() => applyFilters({page:pagination.page})}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px",
                background:P.primary, color:"#fff", border:"none", borderRadius:12,
                fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:13,
                cursor:"pointer", boxShadow:"0 4px 14px rgba(37,99,235,0.35)" }}>
              ↻ Refresh
            </button>
          </div>
        </div>
      )}

      {/* ── DESKTOP STAT CARDS ── */}
      {!isMobile && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          <StatCard icon="📋" value={fetching?"…":summary.total}    label="Total Leaves" color={P.primary}  bg="#EFF6FF"/>
          <StatCard icon="✅" value={fetching?"…":summary.approved} label="Approved"     color={P.approved} bg="#ECFDF5"/>
          <StatCard icon="⏳" value={fetching?"…":summary.pending}  label="Pending"      color={P.pending}  bg="#FFFBEB" pulse={summary.pending>0}/>
          <StatCard icon="✖" value={fetching?"…":summary.rejected}  label="Rejected"     color={P.rejected} bg="#FEF2F2"/>
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={isMobile ? { padding:"12px 16px" } :
        { display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>

        {/* LEFT COLUMN */}
        <div>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, background:"#fff", borderRadius:14, padding:4,
            width:"fit-content", marginBottom:16, border:`1px solid ${P.border}`,
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            {[["requests","📋 Requests"],["analytics","📊 Analytics"]].map(([key,lbl]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ padding: isMobile ? "7px 14px" : "8px 20px", borderRadius:10, border:"none",
                  background:activeTab===key?P.primary:"none",
                  color:activeTab===key?"#fff":P.muted,
                  fontFamily:"'Sora',sans-serif", fontWeight:600,
                  fontSize: isMobile ? 12 : 13, cursor:"pointer", transition:"all .15s" }}>
                {lbl}
                {key==="requests" && livePending>0 && (
                  <span style={{ marginLeft:5, background:activeTab===key?"rgba(255,255,255,0.28)":P.pending,
                    color:"#fff", fontSize:10, borderRadius:20, padding:"1px 6px", fontWeight:700 }}>
                    {livePending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── REQUESTS TAB ── */}
          {activeTab==="requests" && (
            <div style={{ background:"#fff", borderRadius:16, border:`1px solid ${P.border}`,
              overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>

              {/* Filter bar */}
              <div style={{ padding:isMobile?"10px 12px":"14px 20px",
                borderBottom:`1px solid ${P.border}`,
                background:"#FAFBFF",
                display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
                  border:`1.5px solid ${P.border}`, borderRadius:10, background:"#fff",
                  flex:1, minWidth:130 }}>
                  <span style={{ color:P.muted, fontSize:13 }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && applyFilters()}
                    placeholder="Search student…"
                    style={{ border:"none", outline:"none", fontSize:12, color:P.text,
                      fontFamily:"'Sora',sans-serif", background:"none", width:"100%" }}/>
                </div>

                {!isMobile && [[TYPES,typeFilter,setTypeFilter,"Type"],
                  [DEPTS,deptFilter,setDeptFilter,"Dept"],
                  [STATUSES,statusFilter,setStatusFilter,"Status"]
                ].map(([opts,val,setter,ph]) => (
                  <div key={ph} style={{ position:"relative" }}>
                    <select value={val} onChange={e => setter(e.target.value)}
                      style={{ appearance:"none", padding:"8px 28px 8px 10px",
                        border:`1.5px solid ${P.border}`, borderRadius:10, fontSize:12,
                        fontFamily:"'Sora',sans-serif", color:P.text, background:"#fff",
                        cursor:"pointer", outline:"none" }}>
                      {opts.map(o => <option key={o}>{o==="All"?ph:o}</option>)}
                    </select>
                    <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
                      color:P.muted, pointerEvents:"none", fontSize:9 }}>▼</span>
                  </div>
                ))}

                {isMobile && (
                  <div style={{ position:"relative" }}>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                      style={{ appearance:"none", padding:"8px 28px 8px 10px",
                        border:`1.5px solid ${P.border}`, borderRadius:10, fontSize:12,
                        fontFamily:"'Sora',sans-serif", color:P.text, background:"#fff",
                        cursor:"pointer", outline:"none" }}>
                      {STATUSES.map(o => <option key={o}>{o==="All"?"Status":o}</option>)}
                    </select>
                    <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
                      color:P.muted, pointerEvents:"none", fontSize:9 }}>▼</span>
                  </div>
                )}

                <button onClick={() => applyFilters()}
                  style={{ padding:"8px 14px", background:P.primary, color:"#fff", border:"none",
                    borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer",
                    fontFamily:"'Sora',sans-serif" }}>
                  Apply
                </button>
                <button onClick={() => setSortPriority(!sortPriority)}
                  style={{ padding:"8px 10px", border:`1.5px solid ${sortPriority?P.rejected:P.border}`,
                    borderRadius:10, background:sortPriority?"#FEF2F2":"none",
                    color:sortPriority?P.rejected:P.muted,
                    fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  🚨 {sortPriority?"ON":"OFF"}
                </button>
                {(search||typeFilter!=="All"||deptFilter!=="All"||statusFilter!=="All") && (
                  <button onClick={() => {
                    setSearch(""); setTypeFilter("All"); setDeptFilter("All"); setStatusFilter("All");
                    doFetch({page:1,limit:pagination.limit});
                  }} style={{ padding:"8px 10px", border:`1.5px solid ${P.border}`, borderRadius:10,
                    background:"none", color:P.muted, fontFamily:"'Sora',sans-serif", fontSize:11, cursor:"pointer" }}>
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* Priority legend */}
              {sortPriority && (
                <div style={{ padding:"6px 16px", background:"#FFFBEB", borderBottom:`1px solid ${P.border}`,
                  display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:10, fontWeight:600, color:P.muted }}>PRIORITY:</span>
                  {[{icon:"🚨",label:"Emergency",color:P.rejected,bg:"#FEF2F2"},
                    {icon:"🏥",label:"Medical",  color:P.pending, bg:"#FFFBEB"},
                    {icon:"📋",label:"Others",   color:P.muted,   bg:"#F1F5F9"},
                  ].map(({icon,label,color,bg}) => (
                    <span key={label} style={{ display:"flex", alignItems:"center", gap:4, background:bg,
                      color, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>
                      {icon} {label}
                    </span>
                  ))}
                </div>
              )}

              {/* ── MOBILE: Card list ── */}
              {isMobile ? (
                <div style={{ padding:"12px" }}>
                  {fetching ? (
                    <div style={{ padding:"40px 20px", textAlign:"center", color:P.muted }}>
                      <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
                      <div>Loading…</div>
                    </div>
                  ) : sortedLeaves.length===0 ? (
                    <div style={{ padding:"40px 20px", textAlign:"center", color:P.muted }}>
                      <div style={{ fontSize:36, marginBottom:8 }}>🗂️</div>
                      <div style={{ fontWeight:600 }}>No leave requests found</div>
                    </div>
                  ) : sortedLeaves.map(leave => (
                    <MobileLeaveCard key={leave._id} leave={leave}
                      onApprove={handleApprove}
                      onReject={setRejectModal}
                      actionLoading={actionLoading}/>
                  ))}
                </div>
              ) : (
                /* ── DESKTOP: Table ── */
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"2fr 1.3fr 0.7fr 1.1fr 1fr 150px",
                    padding:"10px 20px", borderBottom:`1px solid ${P.border}`, background:"#F8FAFF" }}>
                    {["Student Name","Dates","Days","Type","Status","Action"].map(h => (
                      <div key={h} style={{ fontSize:11, fontWeight:600, color:P.muted,
                        textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>
                    ))}
                  </div>
                  <div>
                    {fetching ? (
                      <div style={{ padding:"48px 20px", textAlign:"center", color:P.muted }}>
                        <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
                        <div style={{ fontWeight:600 }}>Loading…</div>
                      </div>
                    ) : sortedLeaves.length===0 ? (
                      <div style={{ padding:"48px 20px", textAlign:"center", color:P.muted }}>
                        <div style={{ fontSize:36, marginBottom:8 }}>🗂️</div>
                        <div style={{ fontWeight:600 }}>No leave requests found</div>
                      </div>
                    ) : sortedLeaves.map((leave,idx) => {
                      const { bg:sBg, color:sColor } = statusStyle(leave.status);
                      const name  = leave.student?.fullName ?? "Unknown";
                      const dept  = leave.student?.department ?? "";
                      const batch = leave.student?.batch ?? "";
                      const days  = daysBetween(leave.fromDate, leave.toDate);
                      const pBadge = PRIORITY_BADGE[leave.leaveType];
                      const isEmg  = leave.leaveType==="Emergency" && leave.status==="Pending";
                      const isProc = actionLoading===leave._id;
                      return (
                        <div key={leave._id}
                          style={{ display:"grid", gridTemplateColumns:"2fr 1.3fr 0.7fr 1.1fr 1fr 150px",
                            padding:"14px 20px",
                            borderBottom:idx<sortedLeaves.length-1?`1px solid ${P.border}`:"none",
                            alignItems:"center", transition:"background .15s, opacity .2s",
                            background:isEmg?"#FFF8F8":"transparent", opacity:isProc?0.65:1 }}
                          onMouseEnter={e => e.currentTarget.style.background=isEmg?"#FEF0F0":"#F0F5FF"}
                          onMouseLeave={e => e.currentTarget.style.background=isEmg?"#FFF8F8":"transparent"}>

                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:12, flexShrink:0,
                              background:avatarBg(name), color:"#fff",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:12, fontWeight:700 }}>{initials(name)}</div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:P.text,
                                display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                                {name}
                                {pBadge && leave.status==="Pending" && (
                                  <span style={{ fontSize:10, fontWeight:700,
                                    background:pBadge.bg, color:pBadge.color, padding:"2px 6px", borderRadius:12 }}>
                                    {pBadge.icon} {pBadge.label}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize:11, color:P.muted }}>{dept}{batch?` — ${batch}`:""}</div>
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize:12, fontFamily:"'DM Mono',monospace", color:P.text }}>
                              {fmtDate(leave.fromDate)} — {fmtDate(leave.toDate)}
                            </div>
                            <div style={{ fontSize:11, color:P.muted, overflow:"hidden",
                              textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:150 }}>
                              {leave.reason?.slice(0,30)||"—"}
                            </div>
                          </div>

                          <div style={{ fontSize:13, fontWeight:600, color:P.text }}>
                            {days!=="—"?`${days}d`:"—"}
                          </div>

                          <div style={{ fontSize:12, color:P.muted, display:"flex", alignItems:"center", gap:5 }}>
                            <span style={{ width:6, height:6, borderRadius:"50%",
                              background:P.primary, display:"inline-block" }}/>
                            {leave.leaveType||"Other"}
                          </div>

                          <div>
                            <span style={{ background:sBg, color:sColor, fontSize:11, fontWeight:700,
                              padding:"4px 10px", borderRadius:20,
                              display:"inline-flex", alignItems:"center", gap:5 }}>
                              {isProc && <span style={{ width:10, height:10, border:"2px solid rgba(0,0,0,0.15)",
                                borderTop:`2px solid ${sColor}`, borderRadius:"50%",
                                display:"inline-block", animation:"la-spin .6s linear infinite" }}/>}
                              {leave.status}
                            </span>
                          </div>

                          <div style={{ display:"flex", gap:6 }}>
                            {leave.status==="Pending" ? (
                              <>
                                <button onClick={() => handleApprove(leave._id)} disabled={!!actionLoading}
                                  style={{ padding:"6px 12px", background:actionLoading?"#D1FAE5":P.approved,
                                    color:"#fff", border:"none", borderRadius:8, fontSize:12,
                                    fontWeight:600, cursor:actionLoading?"not-allowed":"pointer",
                                    fontFamily:"'Sora',sans-serif" }}>
                                  {isProc?"…":"Approve"}
                                </button>
                                <button onClick={() => setRejectModal(leave)} disabled={!!actionLoading}
                                  style={{ padding:"6px 12px", background:"#fff", color:P.rejected,
                                    border:`1.5px solid ${P.rejected}`, borderRadius:8, fontSize:12,
                                    fontWeight:600, cursor:actionLoading?"not-allowed":"pointer",
                                    fontFamily:"'Sora',sans-serif" }}>
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize:12, color:P.muted, fontStyle:"italic" }}>
                                {leave.status==="Rejected"?"Reason on file":"—"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <Pagination
                page={pagination.page} totalPages={pagination.totalPages}
                total={pagination.total} limit={pagination.limit}
                onPageChange={(p) => applyFilters({page:p})}
                onLimitChange={(l) => {
                  setPagination(prev => ({...prev,limit:l,page:1}));
                  doFetch({page:1,limit:l,
                    leaveType:typeFilter!=="All"?typeFilter:"",
                    department:deptFilter!=="All"?deptFilter:"",
                    status:statusFilter!=="All"?statusFilter:"",
                    studentName:search,
                  });
                }}
              />
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab==="analytics" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {statsLoading ? (
                <div style={{ background:"#fff", borderRadius:16, padding:"60px", textAlign:"center",
                  color:P.muted, border:`1px solid ${P.border}` }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
                  <div style={{ fontWeight:600 }}>Loading analytics…</div>
                </div>
              ) : (
                <>
                  <div style={{ background:"#fff", borderRadius:16, padding:isMobile?"16px":"20px 24px",
                    border:`1px solid ${P.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontWeight:700, fontSize:14, color:P.text, marginBottom:4 }}>Monthly Leave Trend</div>
                    <div style={{ fontSize:12, color:P.muted, marginBottom:14 }}>Leaves per month by status</div>
                    {monthlyChartData.length===0 ? (
                      <div style={{ height:180, display:"flex", alignItems:"center",
                        justifyContent:"center", color:P.muted, fontSize:13 }}>No monthly data yet</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={isMobile?180:220}>
                        <AreaChart data={monthlyChartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                          <defs>
                            {[["approved","#059669"],["pending","#D97706"],["rejected","#DC2626"]].map(([k,c]) => (
                              <linearGradient key={k} id={`g_${k}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={c} stopOpacity={0.18}/>
                                <stop offset="95%" stopColor={c} stopOpacity={0}/>
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF"/>
                          <XAxis dataKey="month" tick={{fontSize:10,fill:P.muted}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fontSize:10,fill:P.muted}} axisLine={false} tickLine={false}/>
                          <Tooltip content={<ChartTooltip/>}/>
                          <Legend iconType="circle" iconSize={8}/>
                          <Area type="monotone" dataKey="Approved" stroke="#059669" fill="url(#g_approved)" strokeWidth={2.5} dot={false}/>
                          <Area type="monotone" dataKey="Pending"  stroke="#D97706" fill="url(#g_pending)"  strokeWidth={2.5} dot={false}/>
                          <Area type="monotone" dataKey="Rejected" stroke="#DC2626" fill="url(#g_rejected)" strokeWidth={2}   dot={false} strokeDasharray="4 3"/>
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {!isMobile && (
                    <div style={{ background:"#fff", borderRadius:16, padding:"20px 24px",
                      border:`1px solid ${P.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                      <div style={{ fontWeight:700, fontSize:14, color:P.text, marginBottom:4 }}>Department-wise Breakdown</div>
                      <div style={{ fontSize:12, color:P.muted, marginBottom:14 }}>Leave counts per department</div>
                      {deptChartData.length===0 ? (
                        <div style={{ height:160, display:"flex", alignItems:"center",
                          justifyContent:"center", color:P.muted, fontSize:13 }}>No data available</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={deptChartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF"/>
                            <XAxis dataKey="dept" tick={{fontSize:10,fill:P.muted}} axisLine={false} tickLine={false}/>
                            <YAxis tick={{fontSize:10,fill:P.muted}} axisLine={false} tickLine={false}/>
                            <Tooltip content={<ChartTooltip/>}/>
                            <Legend iconType="circle" iconSize={8}/>
                            <Bar dataKey="Total"    fill="#BFDBFE" radius={[4,4,0,0]}/>
                            <Bar dataKey="Approved" fill="#059669" radius={[4,4,0,0]}/>
                            <Bar dataKey="Pending"  fill="#D97706" radius={[4,4,0,0]}/>
                            <Bar dataKey="Rejected" fill="#DC2626" radius={[4,4,0,0]}/>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  )}

                  {/* Snapshot */}
                  <div style={{ background:"#fff", borderRadius:16, padding:isMobile?"16px":"20px 24px",
                    border:`1px solid ${P.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontWeight:700, fontSize:14, color:P.text, marginBottom:14 }}>Snapshot</div>
                    {[
                      {label:"Total Requests", value:summary.total,    color:P.primary},
                      {label:"Approved",       value:summary.approved, color:P.approved},
                      {label:"Rejected",       value:summary.rejected, color:P.rejected},
                      {label:"Pending Review", value:summary.pending,  color:P.pending},
                      {label:"Approval Rate",  value:summary.total?`${Math.round((summary.approved/summary.total)*100)}%`:"0%", color:"#7C3AED"},
                    ].map(item => (
                      <div key={item.label} style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"center", marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ width:8, height:8, borderRadius:2,
                            background:item.color, display:"inline-block" }}/>
                          <span style={{ fontSize:12, color:P.muted }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize:15, fontWeight:700, color:P.text }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={fetchAnalytics}
                    style={{ alignSelf:"flex-end", padding:"8px 16px", background:"none",
                      border:`1.5px solid ${P.border}`, borderRadius:10, color:P.muted,
                      fontFamily:"'Sora',sans-serif", fontSize:12, cursor:"pointer" }}>
                    ↻ Refresh Analytics
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL (desktop only) ── */}
        {!isMobile && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:"#fff", borderRadius:16, padding:"18px 20px 14px",
              border:`1px solid ${P.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <MiniCalendar leaves={leaves}/>
            </div>

            <div style={{ background:"#fff", borderRadius:16, padding:"16px 20px",
              border:`1px solid ${P.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontWeight:700, fontSize:14, color:P.text, marginBottom:12 }}>Recent requests</div>
              {leaves.slice(0,4).map(leave => {
                const {bg:sBg,color:sColor} = statusStyle(leave.status);
                const pB = PRIORITY_BADGE[leave.leaveType];
                return (
                  <div key={leave._id} style={{ marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${P.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:P.text }}>{leave.student?.fullName??"Unknown"}</div>
                        <div style={{ fontSize:10, color:P.muted, marginTop:1, fontFamily:"'DM Mono',monospace" }}>
                          {fmtDate(leave.fromDate)} — {fmtDate(leave.toDate)}
                        </div>
                      </div>
                      <span style={{ background:sBg, color:sColor, fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>
                        {leave.status}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:4, alignItems:"center" }}>
                      {pB && <span style={{ fontSize:10, background:pB.bg, color:pB.color, padding:"2px 6px", borderRadius:10, fontWeight:600 }}>{pB.icon} {leave.leaveType}</span>}
                      <span style={{ fontSize:10, color:P.muted }}>{daysBetween(leave.fromDate,leave.toDate)} days</span>
                    </div>
                  </div>
                );
              })}
              {leaves.length===0 && <div style={{ fontSize:12, color:P.muted, textAlign:"center" }}>No leave requests yet.</div>}
            </div>

            <div style={{ background:`linear-gradient(135deg,${P.primary},#1D4ED8)`,
              borderRadius:16, padding:"16px 20px", color:"#fff",
              boxShadow:"0 8px 24px rgba(37,99,235,0.30)" }}>
              <div style={{ fontSize:11, fontWeight:600, opacity:0.85, marginBottom:6 }}>Awaiting Your Action</div>
              <div style={{ fontSize:32, fontWeight:700 }}>{livePending}</div>
              <div style={{ fontSize:11, opacity:0.75, marginTop:2 }}>pending leave requests</div>
              <button onClick={() => { setActiveTab("requests"); setStatusFilter("Pending"); applyFilters({page:1,status:"Pending"}); }}
                style={{ marginTop:12, padding:"8px 16px", background:"rgba(255,255,255,0.2)",
                  border:"1px solid rgba(255,255,255,0.3)", borderRadius:10, color:"#fff",
                  fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", width:"100%" }}>
                Review All Pending →
              </button>
            </div>

            {emergencyPending.length>0 && (
              <div style={{ background:"linear-gradient(135deg,#DC2626,#B91C1C)",
                borderRadius:16, padding:"14px 20px", color:"#fff",
                boxShadow:"0 8px 24px rgba(220,38,38,0.28)" }}>
                <div style={{ fontSize:11, fontWeight:600, opacity:0.9, marginBottom:3 }}>🚨 Emergency Requests</div>
                <div style={{ fontSize:26, fontWeight:700 }}>{emergencyPending.length}</div>
                <div style={{ fontSize:10, opacity:0.8, marginTop:2 }}>require immediate attention</div>
                <button onClick={() => {
                  setActiveTab("requests"); setTypeFilter("Emergency"); setStatusFilter("Pending");
                  doFetch({page:1,limit:pagination.limit,leaveType:"Emergency",status:"Pending"});
                }}
                  style={{ marginTop:10, padding:"7px 14px", background:"rgba(255,255,255,0.2)",
                    border:"1px solid rgba(255,255,255,0.3)", borderRadius:10, color:"#fff",
                    fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", width:"100%" }}>
                  Review Emergency →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile pending action bar */}
      {isMobile && livePending>0 && (
        <div style={{ position:"fixed", bottom:70, left:16, right:16, zIndex:100,
          background:`linear-gradient(135deg,${P.primary},#1D4ED8)`,
          borderRadius:14, padding:"12px 16px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          boxShadow:"0 8px 24px rgba(37,99,235,0.40)", color:"#fff" }}>
          <div>
            <div style={{ fontSize:11, opacity:0.8 }}>Awaiting review</div>
            <div style={{ fontSize:20, fontWeight:800 }}>{livePending} pending</div>
          </div>
          <button onClick={() => { setStatusFilter("Pending"); applyFilters({page:1,status:"Pending"}); }}
            style={{ padding:"8px 14px", background:"rgba(255,255,255,0.25)",
              border:"1px solid rgba(255,255,255,0.4)", borderRadius:10, color:"#fff",
              fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>
            Review →
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;