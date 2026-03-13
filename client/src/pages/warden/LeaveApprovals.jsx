import { useEffect, useState, useMemo, useCallback } from "react";
import { getAllLeaves, updateLeaveStatus, getLeaveStats } from "../../services/leaveService";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";

/* ── Google Font ─────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

/* ── Palette ─────────────────────────────────────────────── */
const P = {
  primary:  "#2563EB",
  approved: "#059669",
  pending:  "#D97706",
  rejected: "#DC2626",
  surface:  "#F8FAFF",
  border:   "#E8EEFF",
  text:     "#0F1629",
  muted:    "#6B7A99",
  pieColors:["#2563EB","#059669","#F59E0B","#EC4899","#8B5CF6","#0891B2"],
};

/* ── Priority config ─────────────────────────────────────── */
const PRIORITY_ORDER = { Emergency: 0, Medical: 1 };
const getPriority = (t) => PRIORITY_ORDER[t] ?? 99;

const PRIORITY_BADGE = {
  Emergency: { bg:"#FEF2F2", color:"#DC2626", icon:"🚨", label:"URGENT"  },
  Medical:   { bg:"#FFFBEB", color:"#D97706", icon:"🏥", label:"HIGH"    },
};

/* ── Status helpers ──────────────────────────────────────── */
const statusStyle = (s) => ({
  Pending:  { bg:"#FEF3C7", color:"#92400E" },
  Approved: { bg:"#D1FAE5", color:"#065F46" },
  Rejected: { bg:"#FEE2E2", color:"#991B1B" },
}[s] || { bg:"#F1F5F9", color:"#475569" });

/* ── Helpers ─────────────────────────────────────────────── */
const fmtDate = (d) => (d ? String(d).slice(0,10) : "—");
const daysBetween = (from, to) => {
  const a = new Date(from), b = new Date(to);
  return isNaN(a)||isNaN(b) ? "—" : Math.max(1, Math.ceil((b-a)/86400000)+1);
};
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const avatarColors = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2","#BE185D"];
const avatarBg = (n="") => avatarColors[(n.charCodeAt(0)||0) % avatarColors.length];
const initials  = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ icon, value, label, color, bg }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ background:"#fff", borderRadius:20, padding:"22px 24px",
      border:`1px solid ${P.border}`,
      boxShadow:hov?"0 6px 24px rgba(37,99,235,0.10)":"0 1px 4px rgba(0,0,0,0.04)",
      display:"flex", flexDirection:"column", gap:8, transition:"box-shadow .2s" }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ width:40,height:40,borderRadius:12,background:bg,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{icon}</div>
      <div style={{ fontSize:28,fontWeight:700,color:P.text,lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:13,color:P.muted,fontWeight:500 }}>{label}</div>
    </div>
  );
}

/* ── Chart Tooltip ───────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"#fff",border:`1px solid ${P.border}`,borderRadius:12,
      padding:"10px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.10)",
      fontFamily:"'Sora',sans-serif",fontSize:12 }}>
      <div style={{ fontWeight:600,color:P.text,marginBottom:6 }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ display:"flex",gap:8,alignItems:"center",color:P.muted,marginBottom:2 }}>
          <span style={{ width:8,height:8,borderRadius:2,background:p.color,display:"inline-block" }}/>
          {p.name}: <strong style={{ color:P.text }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ── Mini Calendar ───────────────────────────────────────── */
function MiniCalendar({ leaves }) {
  const now = new Date();
  const [cur, setCur] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const year=cur.getFullYear(), month=cur.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const DAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];

  const activeDates=new Set();
  leaves.filter(l=>l.status!=="Rejected").forEach(l=>{
    const from=new Date(l.fromDate), to=new Date(l.toDate);
    for(let d=new Date(from);d<=to;d.setDate(d.getDate()+1))
      if(d.getMonth()===month&&d.getFullYear()===year) activeDates.add(d.getDate());
  });

  const cells=[];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  const isToday=(d)=>d===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();

  return (
    <div style={{ fontFamily:"'Sora',sans-serif" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
        <button onClick={()=>setCur(new Date(year,month-1,1))}
          style={{ border:"none",background:"none",cursor:"pointer",color:P.muted,fontSize:18,padding:"2px 6px",borderRadius:6 }}>‹</button>
        <span style={{ fontWeight:600,fontSize:14,color:P.text }}>{MONTH_NAMES[month]}, {year}</span>
        <button onClick={()=>setCur(new Date(year,month+1,1))}
          style={{ border:"none",background:"none",cursor:"pointer",color:P.muted,fontSize:18,padding:"2px 6px",borderRadius:6 }}>›</button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4 }}>
        {DAYS.map(d=><div key={d} style={{ textAlign:"center",fontSize:11,fontWeight:600,color:P.muted,padding:"4px 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2 }}>
        {cells.map((d,i)=>(
          <div key={i} style={{ height:32,display:"flex",alignItems:"center",justifyContent:"center",
            borderRadius:8,fontSize:12,fontWeight:isToday(d)?700:d?500:400,
            background:isToday(d)?P.primary:activeDates.has(d)?"#DBEAFE":"transparent",
            color:isToday(d)?"#fff":activeDates.has(d)?P.primary:d?P.text:"transparent",
            position:"relative" }}>
            {d||""}
            {d&&activeDates.has(d)&&!isToday(d)&&(
              <span style={{ position:"absolute",bottom:3,left:"50%",transform:"translateX(-50%)",
                width:4,height:4,borderRadius:"50%",background:P.primary }}/>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop:16,padding:"10px 12px",background:"#EFF6FF",borderRadius:10,
        fontSize:11,color:P.muted,display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ width:10,height:10,borderRadius:2,background:"#DBEAFE",display:"inline-block",
          border:`1px solid ${P.primary}` }}/>
        Total – students on leave per day
      </div>
      <div style={{ marginTop:12,borderTop:`1px solid ${P.border}`,paddingTop:12 }}>
        <div style={{ fontSize:12,color:P.muted,marginBottom:2 }}>Total on leave</div>
        <div style={{ fontSize:22,fontWeight:700,color:P.text }}>
          {leaves.filter(l=>l.status!=="Rejected").length}
          <span style={{ fontSize:13,fontWeight:400,color:P.muted,marginLeft:6 }}>students</span>
        </div>
      </div>
    </div>
  );
}

/* ── Reject Modal ────────────────────────────────────────── */
function RejectModal({ leave, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  const [err, setErr]       = useState("");
  const name = leave.student?.fullName ?? "Student";
  const days = daysBetween(leave.fromDate, leave.toDate);
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed",inset:0,background:"rgba(15,22,41,0.55)",
        backdropFilter:"blur(4px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"#fff",borderRadius:24,width:420,overflow:"hidden",
        boxShadow:"0 32px 80px rgba(0,0,0,0.18)",fontFamily:"'Sora',sans-serif" }}>
        <div style={{ background:"linear-gradient(135deg,#DC2626,#B91C1C)",padding:"24px 28px" }}>
          <div style={{ fontSize:18,fontWeight:700,color:"#fff" }}>Reject Leave Request</div>
          <div style={{ fontSize:13,color:"#FECACA",marginTop:4 }}>
            {name} · {leave.leaveType} · {days!=="—"?`${days} days`:""}
          </div>
        </div>
        <div style={{ padding:"24px 28px" }}>
          <label style={{ fontSize:13,fontWeight:600,color:P.text,display:"block",marginBottom:8 }}>
            Rejection Reason <span style={{ color:P.rejected }}>*</span>
          </label>
          <textarea rows={4} value={reason} onChange={e=>{setReason(e.target.value);setErr("");}}
            placeholder="Explain why this leave is being rejected…"
            style={{ width:"100%",border:`1.5px solid ${err?P.rejected:P.border}`,
              borderRadius:12,padding:"10px 14px",fontSize:13,fontFamily:"'Sora',sans-serif",
              resize:"none",outline:"none",color:P.text,boxSizing:"border-box" }}/>
          {err&&<div style={{ color:P.rejected,fontSize:12,marginTop:4 }}>{err}</div>}
          <div style={{ fontSize:11,color:P.muted,marginTop:6 }}>
            This reason will be sent to the student via notification and email.
          </div>
        </div>
        <div style={{ padding:"0 28px 24px",display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onClose} disabled={loading}
            style={{ padding:"10px 20px",border:`1.5px solid ${P.border}`,borderRadius:12,
              background:"none",cursor:"pointer",fontSize:13,color:P.muted,fontFamily:"'Sora',sans-serif" }}>
            Cancel
          </button>
          <button onClick={()=>{
            if(reason.trim().length<5) return setErr("Please enter at least 5 characters.");
            onConfirm(leave._id, reason.trim());
          }} disabled={loading}
            style={{ padding:"10px 22px",background:loading?"#FCA5A5":P.rejected,border:"none",
              borderRadius:12,cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:600,
              color:"#fff",fontFamily:"'Sora',sans-serif" }}>
            {loading?"Rejecting…":"Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Pagination Component ────────────────────────────────── */
function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }) {
  const start = Math.max(1, page-2);
  const end   = Math.min(totalPages, page+2);
  const pages = [];
  for(let p=start;p<=end;p++) pages.push(p);

  const btn = (active, disabled=false) => ({
    minWidth:32,height:32,border:`1.5px solid ${active?P.primary:P.border}`,
    borderRadius:8,background:active?P.primary:"#fff",
    color:active?"#fff":P.muted,fontSize:13,cursor:disabled?"not-allowed":"pointer",
    fontFamily:"'Sora',sans-serif",opacity:disabled?0.4:1,
    display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",
  });

  return (
    <div style={{ padding:"12px 20px",borderTop:`1px solid ${P.border}`,
      display:"flex",justifyContent:"space-between",alignItems:"center",
      background:"#FAFBFF",flexWrap:"wrap",gap:10 }}>
      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <span style={{ fontSize:12,color:P.muted }}>
          Showing {total===0?0:Math.min((page-1)*limit+1,total)}–{Math.min(page*limit,total)} of {total}
        </span>
        <div style={{ position:"relative" }}>
          <select value={limit} onChange={e=>onLimitChange(Number(e.target.value))}
            style={{ appearance:"none",padding:"5px 28px 5px 10px",border:`1.5px solid ${P.border}`,
              borderRadius:8,fontSize:12,fontFamily:"'Sora',sans-serif",color:P.text,
              background:"#fff",cursor:"pointer",outline:"none" }}>
            {[10,20,50,100].map(n=><option key={n} value={n}>Show {n}</option>)}
          </select>
          <span style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
            color:P.muted,pointerEvents:"none",fontSize:9 }}>▼</span>
        </div>
      </div>
      <div style={{ display:"flex",gap:4,alignItems:"center" }}>
        <button onClick={()=>onPageChange(1)}  disabled={page===1} style={btn(false,page===1)}>«</button>
        <button onClick={()=>onPageChange(page-1)} disabled={page===1} style={btn(false,page===1)}>‹</button>
        {start>1&&<span style={{ fontSize:12,color:P.muted,padding:"0 2px" }}>…</span>}
        {pages.map(p=>(
          <button key={p} onClick={()=>onPageChange(p)} style={btn(p===page)}>{p}</button>
        ))}
        {end<totalPages&&<span style={{ fontSize:12,color:P.muted,padding:"0 2px" }}>…</span>}
        <button onClick={()=>onPageChange(page+1)} disabled={page===totalPages} style={btn(false,page===totalPages)}>›</button>
        <button onClick={()=>onPageChange(totalPages)} disabled={page===totalPages} style={btn(false,page===totalPages)}>»</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const LeaveApprovals = () => {
  const [leaves, setLeaves]         = useState([]);
  const [pagination, setPagination] = useState({ total:0, page:1, limit:20, totalPages:1 });
  const [analyticsData, setAnalyticsData] = useState(null);

  const [activeTab, setActiveTab]       = useState("requests");
  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState("All");
  const [deptFilter, setDeptFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortPriority, setSortPriority] = useState(true);
  const [rejectModal, setRejectModal]   = useState(null);
  const [loading, setLoading]           = useState(false);
  const [fetching, setFetching]         = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  /* ── Internal fetch with explicit params ── */
  const doFetch = useCallback(async (params={}) => {
    setFetching(true);
    try {
      const res = await getAllLeaves(params);
      const raw = res.data;
      const data = raw?.leaves ?? raw ?? [];
      const pg   = raw?.pagination ?? { total:Array.isArray(data)?data.length:0, page:1, limit:params.limit??20, totalPages:1 };
      setLeaves(Array.isArray(data)?data:[]);
      setPagination(pg);
    } catch(e) {
      console.error(e);
      setLeaves([]);
    } finally { setFetching(false); }
  }, []);

  /* ── Initial load ── */
  useEffect(()=>{ doFetch({ page:1, limit:20 }); }, []);

  /* ── Analytics fetch ── */
  const fetchAnalytics = async () => {
    setStatsLoading(true);
    try {
      const res = await getLeaveStats();
      setAnalyticsData(res.data);
    } catch(e) { console.error(e); }
    finally { setStatsLoading(false); }
  };

  useEffect(()=>{
    if(activeTab==="analytics"&&!analyticsData) fetchAnalytics();
  },[activeTab]);

  /* ── Apply filters & go page 1 ── */
  const applyFilters = useCallback((overrides={}) => {
    const params = {
      page:       overrides.page   ?? 1,
      limit:      overrides.limit  ?? pagination.limit,
      leaveType:  overrides.type   ?? (typeFilter !=="All"?typeFilter :""),
      department: overrides.dept   ?? (deptFilter !=="All"?deptFilter :""),
      status:     overrides.status ?? (statusFilter!=="All"?statusFilter:""),
      studentName:overrides.search ?? search,
    };
    doFetch(params);
  }, [doFetch, pagination.limit, typeFilter, deptFilter, statusFilter, search]);

  /* ── Approve ── */
  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await updateLeaveStatus(id,"Approved","");
      applyFilters({ page:pagination.page });
    } catch(e) { alert(e.response?.data?.message||"Failed to approve"); }
    finally { setLoading(false); }
  };

  /* ── Reject ── */
  const handleRejectConfirm = async (id, reason) => {
    setLoading(true);
    try {
      await updateLeaveStatus(id,"Rejected",reason);
      setRejectModal(null);
      applyFilters({ page:pagination.page });
    } catch(e) { alert(e.response?.data?.message||"Failed to reject"); }
    finally { setLoading(false); }
  };

  /* ── Summary stats (prefer API stats, fallback to pagination total) ── */
  const summary = analyticsData?.summary ?? {
    total:pagination.total, pending:0, approved:0, rejected:0,
  };

  /* ── Priority-sorted current page ── */
  const sortedLeaves = useMemo(()=>{
    if(!sortPriority) return leaves;
    return [...leaves].sort((a,b)=>{
      const pa=getPriority(a.leaveType), pb=getPriority(b.leaveType);
      if(pa!==pb) return pa-pb;
      if(a.status==="Pending"&&b.status!=="Pending") return -1;
      if(a.status!=="Pending"&&b.status==="Pending") return  1;
      return 0;
    });
  },[leaves,sortPriority]);

  /* ── Chart datasets ── */
  const monthlyChartData = useMemo(()=>{
    if(!analyticsData?.monthly) return [];
    const map={};
    analyticsData.monthly.forEach(({_id,count})=>{
      const m=MONTH_NAMES[(_id.month||1)-1];
      if(!map[m]) map[m]={month:m,Approved:0,Pending:0,Rejected:0};
      map[m][_id.status]=count;
    });
    return Object.values(map);
  },[analyticsData]);

  const typeChartData = useMemo(()=>
    (analyticsData?.byType||[]).map(({_id,count})=>({name:_id||"Other",value:count}))
  ,[analyticsData]);

  const deptChartData = useMemo(()=>
    (analyticsData?.byDepartment||[]).slice(0,8).map(d=>({
      dept:d._id||"Other", Total:d.total, Approved:d.approved, Pending:d.pending, Rejected:d.rejected,
    }))
  ,[analyticsData]);

  const TYPES    = ["All","Casual","Medical","Emergency","Home","Event","Other"];
  const DEPTS    = ["All","CSE","ECE","IT","MECH","CIVIL"];
  const STATUSES = ["All","Pending","Approved","Rejected"];

  const todayStr = new Date().toLocaleDateString("en-IN",{
    weekday:"long",day:"numeric",month:"long",year:"numeric",
  });

  const emergencyPending = leaves.filter(l=>l.leaveType==="Emergency"&&l.status==="Pending");

  return (
    <div style={{ fontFamily:"'Sora',sans-serif",background:P.surface,minHeight:"100vh",padding:24,color:P.text }}>

      {rejectModal&&(
        <RejectModal leave={rejectModal} onClose={()=>setRejectModal(null)}
          onConfirm={handleRejectConfirm} loading={loading}/>
      )}

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:12 }}>
        <div>
          <div style={{ fontSize:11,fontWeight:600,color:P.primary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>
            HostelEase · Warden Portal
          </div>
          <h1 style={{ margin:0,fontSize:24,fontWeight:700,color:P.text }}>Leave Management</h1>
          <p style={{ margin:"4px 0 0",fontSize:13,color:P.muted }}>{todayStr}</p>
        </div>
        <button onClick={()=>applyFilters({ page:pagination.page })}
          style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 18px",background:P.primary,
            color:"#fff",border:"none",borderRadius:12,fontFamily:"'Sora',sans-serif",fontWeight:600,
            fontSize:13,cursor:"pointer",boxShadow:"0 4px 14px rgba(37,99,235,0.35)" }}>
          ↻ Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24 }}>
        <StatCard icon="📋" value={fetching?"…":summary.total}    label="Total Leaves"  color={P.primary}  bg="#EFF6FF"/>
        <StatCard icon="✅" value={fetching?"…":summary.approved}  label="Approved"      color={P.approved} bg="#ECFDF5"/>
        <StatCard icon="⏳" value={fetching?"…":summary.pending}   label="Pending"       color={P.pending}  bg="#FFFBEB"/>
        <StatCard icon="✖" value={fetching?"…":summary.rejected}  label="Rejected"      color={P.rejected} bg="#FEF2F2"/>
      </div>

      {/* Main layout */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:20,alignItems:"start" }}>

        {/* LEFT */}
        <div>
          {/* Tabs */}
          <div style={{ display:"flex",gap:4,background:"#fff",borderRadius:14,padding:4,
            width:"fit-content",marginBottom:20,border:`1px solid ${P.border}`,
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            {[["requests","📋 Leave Requests"],["analytics","📊 Analytics"]].map(([key,lbl])=>(
              <button key={key} onClick={()=>setActiveTab(key)}
                style={{ padding:"8px 20px",borderRadius:10,border:"none",
                  background:activeTab===key?P.primary:"none",
                  color:activeTab===key?"#fff":P.muted,fontFamily:"'Sora',sans-serif",
                  fontWeight:600,fontSize:13,cursor:"pointer",transition:"all .15s" }}>
                {lbl}
              </button>
            ))}
          </div>

          {/* ══ REQUESTS TAB ══ */}
          {activeTab==="requests"&&(
            <div style={{ background:"#fff",borderRadius:20,border:`1px solid ${P.border}`,
              overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>

              {/* Filter bar */}
              <div style={{ padding:"14px 20px",borderBottom:`1px solid ${P.border}`,
                background:"#FAFBFF",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>

                <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 14px",
                  border:`1.5px solid ${P.border}`,borderRadius:10,background:"#fff",flex:1,minWidth:150,maxWidth:220 }}>
                  <span style={{ color:P.muted,fontSize:14 }}>🔍</span>
                  <input value={search} onChange={e=>setSearch(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&applyFilters()}
                    placeholder="Search student…"
                    style={{ border:"none",outline:"none",fontSize:13,color:P.text,
                      fontFamily:"'Sora',sans-serif",background:"none",width:"100%" }}/>
                </div>

                {[[TYPES,typeFilter,setTypeFilter,"Type of leave"],
                  [DEPTS,deptFilter,setDeptFilter,"Department"],
                  [STATUSES,statusFilter,setStatusFilter,"All Status"]
                ].map(([opts,val,setter,ph])=>(
                  <div key={ph} style={{ position:"relative" }}>
                    <select value={val} onChange={e=>setter(e.target.value)}
                      style={{ appearance:"none",padding:"8px 32px 8px 12px",
                        border:`1.5px solid ${P.border}`,borderRadius:10,fontSize:13,
                        fontFamily:"'Sora',sans-serif",color:P.text,background:"#fff",
                        cursor:"pointer",outline:"none" }}>
                      {opts.map(o=><option key={o}>{o==="All"?ph:o}</option>)}
                    </select>
                    <span style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                      color:P.muted,pointerEvents:"none",fontSize:10 }}>▼</span>
                  </div>
                ))}

                <button onClick={()=>applyFilters()}
                  style={{ padding:"8px 16px",background:P.primary,color:"#fff",border:"none",
                    borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif" }}>
                  Apply
                </button>

                <button onClick={()=>setSortPriority(!sortPriority)}
                  style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 12px",
                    border:`1.5px solid ${sortPriority?P.rejected:P.border}`,borderRadius:10,
                    background:sortPriority?"#FEF2F2":"none",
                    color:sortPriority?P.rejected:P.muted,
                    fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer" }}>
                  🚨 Priority {sortPriority?"ON":"OFF"}
                </button>

                {(search||typeFilter!=="All"||deptFilter!=="All"||statusFilter!=="All")&&(
                  <button onClick={()=>{
                    setSearch("");setTypeFilter("All");setDeptFilter("All");setStatusFilter("All");
                    doFetch({page:1,limit:pagination.limit});
                  }} style={{ padding:"8px 12px",border:`1.5px solid ${P.border}`,borderRadius:10,
                    background:"none",color:P.muted,fontFamily:"'Sora',sans-serif",fontSize:12,cursor:"pointer" }}>
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* Priority legend strip */}
              {sortPriority&&(
                <div style={{ padding:"7px 20px",background:"#FFFBEB",borderBottom:`1px solid ${P.border}`,
                  display:"flex",gap:12,alignItems:"center" }}>
                  <span style={{ fontSize:11,fontWeight:600,color:P.muted }}>PRIORITY:</span>
                  {[{icon:"🚨",label:"Emergency",color:P.rejected,bg:"#FEF2F2"},
                    {icon:"🏥",label:"Medical",  color:P.pending, bg:"#FFFBEB"},
                    {icon:"📋",label:"Others",   color:P.muted,   bg:"#F1F5F9"}
                  ].map(({icon,label,color,bg})=>(
                    <span key={label} style={{ display:"flex",alignItems:"center",gap:4,background:bg,
                      color,fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20 }}>
                      {icon} {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Table header */}
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1.3fr 0.7fr 1.1fr 1fr 150px",
                padding:"10px 20px",borderBottom:`1px solid ${P.border}`,background:"#F8FAFF" }}>
                {["Student Name ","Leave Request Dates","Days","Type","Status","Action"].map(h=>(
                  <div key={h} style={{ fontSize:11,fontWeight:600,color:P.muted,
                    textTransform:"uppercase",letterSpacing:"0.06em" }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              <div>
                {fetching?(
                  <div style={{ padding:"48px 20px",textAlign:"center",color:P.muted }}>
                    <div style={{ fontSize:28,marginBottom:8 }}>⏳</div>
                    <div style={{ fontWeight:600 }}>Loading leave requests…</div>
                  </div>
                ):sortedLeaves.length===0?(
                  <div style={{ padding:"48px 20px",textAlign:"center",color:P.muted }}>
                    <div style={{ fontSize:36,marginBottom:8 }}>🗂️</div>
                    <div style={{ fontWeight:600 }}>No leave requests found</div>
                  </div>
                ):sortedLeaves.map((leave,idx)=>{
                  const {bg:sBg,color:sColor}=statusStyle(leave.status);
                  const name =leave.student?.fullName??"Unknown";
                  const dept =leave.student?.department??"";
                  const batch=leave.student?.batch??leave.student?.year??"";
                  const days =daysBetween(leave.fromDate,leave.toDate);
                  const pBadge=PRIORITY_BADGE[leave.leaveType];
                  const isEmergency=leave.leaveType==="Emergency"&&leave.status==="Pending";

                  return (
                    <div key={leave._id}
                      style={{ display:"grid",gridTemplateColumns:"2fr 1.3fr 0.7fr 1.1fr 1fr 150px",
                        padding:"14px 20px",
                        borderBottom:idx<sortedLeaves.length-1?`1px solid ${P.border}`:"none",
                        alignItems:"center",transition:"background .15s",
                        background:isEmergency?"#FFF8F8":"transparent" }}
                      onMouseEnter={e=>e.currentTarget.style.background=isEmergency?"#FEF0F0":"#F0F5FF"}
                      onMouseLeave={e=>e.currentTarget.style.background=isEmergency?"#FFF8F8":"transparent"}>

                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:36,height:36,borderRadius:12,background:avatarBg(name),
                          color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:12,fontWeight:700,flexShrink:0 }}>
                          {initials(name)}
                        </div>
                        <div>
                          <div style={{ fontSize:13,fontWeight:600,color:P.text,
                            display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                            {name}
                            {pBadge&&leave.status==="Pending"&&(
                              <span style={{ fontSize:10,fontWeight:700,background:pBadge.bg,
                                color:pBadge.color,padding:"2px 6px",borderRadius:12 }}>
                                {pBadge.icon} {pBadge.label}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize:11,color:P.muted }}>
                            {dept}{batch?` – ${batch}`:""}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize:12,fontFamily:"'DM Mono',monospace",color:P.text }}>
                          {fmtDate(leave.fromDate)} – {fmtDate(leave.toDate)}
                        </div>
                        <div style={{ fontSize:11,color:P.muted,overflow:"hidden",
                          textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:150 }}>
                          {leave.reason?.slice(0,30)||"—"}
                        </div>
                      </div>

                      <div style={{ fontSize:13,fontWeight:600,color:P.text }}>
                        {days!=="—"?`${days}d`:"—"}
                      </div>

                      <div style={{ fontSize:12,color:P.muted,display:"flex",alignItems:"center",gap:5 }}>
                        <span style={{ width:6,height:6,borderRadius:"50%",background:P.primary,display:"inline-block" }}/>
                        {leave.leaveType||"Other"}
                      </div>

                      <div>
                        <span style={{ background:sBg,color:sColor,fontSize:11,fontWeight:700,
                          padding:"4px 10px",borderRadius:20 }}>
                          {leave.status}
                        </span>
                      </div>

                      <div style={{ display:"flex",gap:6 }}>
                        {leave.status==="Pending"?(
                          <>
                            <button onClick={()=>handleApprove(leave._id)} disabled={loading}
                              style={{ padding:"6px 12px",background:P.approved,color:"#fff",border:"none",
                                borderRadius:8,fontSize:12,fontWeight:600,
                                cursor:loading?"not-allowed":"pointer",fontFamily:"'Sora',sans-serif" }}>
                              Approve
                            </button>
                            <button onClick={()=>setRejectModal(leave)} disabled={loading}
                              style={{ padding:"6px 12px",background:"#fff",color:P.rejected,
                                border:`1.5px solid ${P.rejected}`,borderRadius:8,fontSize:12,
                                fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'Sora',sans-serif" }}>
                              Reject
                            </button>
                          </>
                        ):(
                          <span style={{ fontSize:12,color:P.muted,fontStyle:"italic" }}>
                            {leave.status==="Rejected"?"Reason on file":"—"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={(p)=>applyFilters({page:p})}
                onLimitChange={(l)=>{
                  setPagination(prev=>({...prev,limit:l,page:1}));
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

          {/* ══ ANALYTICS TAB ══ */}
          {activeTab==="analytics"&&(
            <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
              {statsLoading?(
                <div style={{ background:"#fff",borderRadius:20,padding:"60px",textAlign:"center",
                  color:P.muted,border:`1px solid ${P.border}` }}>
                  <div style={{ fontSize:28,marginBottom:8 }}>⏳</div>
                  <div style={{ fontWeight:600 }}>Loading analytics…</div>
                </div>
              ):(
                <>
                  {/* Monthly Trend */}
                  <div style={{ background:"#fff",borderRadius:20,padding:"20px 24px",
                    border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                      <div>
                        <div style={{ fontWeight:700,fontSize:15,color:P.text }}>Monthly Leave Trend</div>
                        <div style={{ fontSize:12,color:P.muted,marginTop:2 }}>
                          Number of leaves applied each month — by status
                        </div>
                      </div>
                      <span style={{ fontSize:12,color:P.muted,background:"#F1F5F9",
                        padding:"4px 10px",borderRadius:8 }}>
                        {new Date().getFullYear()}
                      </span>
                    </div>
                    {monthlyChartData.length===0?(
                      <div style={{ height:220,display:"flex",alignItems:"center",justifyContent:"center",color:P.muted,fontSize:13 }}>
                        No monthly data yet
                      </div>
                    ):(
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={monthlyChartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                          <defs>
                            {[["approved","#059669"],["pending","#D97706"],["rejected","#DC2626"]].map(([k,c])=>(
                              <linearGradient key={k} id={`g_${k}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={c} stopOpacity={0.18}/>
                                <stop offset="95%" stopColor={c} stopOpacity={0}/>
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF"/>
                          <XAxis dataKey="month" tick={{fontSize:11,fill:P.muted,fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fontSize:11,fill:P.muted,fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                          <Tooltip content={<ChartTooltip/>}/>
                          <Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:P.muted,fontFamily:"Sora"}}>{v}</span>}/>
                          <Area type="monotone" dataKey="Approved" stroke="#059669" fill="url(#g_approved)" strokeWidth={2.5} dot={{r:4,fill:"#059669",strokeWidth:0}} activeDot={{r:6}}/>
                          <Area type="monotone" dataKey="Pending"  stroke="#D97706" fill="url(#g_pending)"  strokeWidth={2.5} dot={false}/>
                          <Area type="monotone" dataKey="Rejected" stroke="#DC2626" fill="url(#g_rejected)" strokeWidth={2}   dot={false} strokeDasharray="4 3"/>
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Dept bar chart */}
                  <div style={{ background:"#fff",borderRadius:20,padding:"20px 24px",
                    border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontWeight:700,fontSize:15,color:P.text,marginBottom:4 }}>
                      Department-wise Breakdown
                    </div>
                    <div style={{ fontSize:12,color:P.muted,marginBottom:14 }}>
                      Leave counts per department — approved vs pending vs rejected
                    </div>
                    {deptChartData.length===0?(
                      <div style={{ height:180,display:"flex",alignItems:"center",justifyContent:"center",color:P.muted,fontSize:13 }}>
                        No department data available
                      </div>
                    ):(
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={deptChartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF"/>
                          <XAxis dataKey="dept" tick={{fontSize:11,fill:P.muted,fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fontSize:11,fill:P.muted,fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                          <Tooltip content={<ChartTooltip/>}/>
                          <Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:P.muted,fontFamily:"Sora"}}>{v}</span>}/>
                          <Bar dataKey="Total"    fill="#BFDBFE" radius={[4,4,0,0]}/>
                          <Bar dataKey="Approved" fill="#059669" radius={[4,4,0,0]}/>
                          <Bar dataKey="Pending"  fill="#D97706" radius={[4,4,0,0]}/>
                          <Bar dataKey="Rejected" fill="#DC2626" radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Pie + Snapshot */}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                    <div style={{ background:"#fff",borderRadius:20,padding:"20px 24px",
                      border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                      <div style={{ fontWeight:700,fontSize:15,color:P.text,marginBottom:4 }}>Leave Type Mix</div>
                      <div style={{ fontSize:12,color:P.muted,marginBottom:12 }}>Distribution by category</div>
                      {typeChartData.length===0?(
                        <div style={{ height:200,display:"flex",alignItems:"center",justifyContent:"center",color:P.muted,fontSize:13 }}>No data yet</div>
                      ):(
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={typeChartData} cx="50%" cy="50%"
                              innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                              {typeChartData.map((_,i)=><Cell key={i} fill={P.pieColors[i%P.pieColors.length]}/>)}
                            </Pie>
                            <Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:P.muted,fontFamily:"Sora"}}>{v}</span>}/>
                            <Tooltip content={<ChartTooltip/>}/>
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div style={{ background:"#fff",borderRadius:20,padding:"20px 24px",
                      border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                      <div style={{ fontWeight:700,fontSize:15,color:P.text,marginBottom:4 }}>Snapshot</div>
                      <div style={{ fontSize:12,color:P.muted,marginBottom:18 }}>Current leave statistics</div>
                      {[
                        {label:"Total Requests",     value:summary.total,    color:P.primary },
                        {label:"Approved",           value:summary.approved, color:P.approved},
                        {label:"Rejected",           value:summary.rejected, color:P.rejected},
                        {label:"Pending Review",     value:summary.pending,  color:P.pending },
                        {label:"Approval Rate",      value:summary.total?`${Math.round((summary.approved/summary.total)*100)}%`:"0%",color:"#7C3AED"},
                        {label:"Emergency + Medical",value:typeChartData.filter(t=>["Emergency","Medical"].includes(t.name)).reduce((s,t)=>s+t.value,0),color:P.rejected},
                      ].map(item=>(
                        <div key={item.label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <span style={{ width:8,height:8,borderRadius:2,background:item.color,display:"inline-block" }}/>
                            <span style={{ fontSize:12,color:P.muted }}>{item.label}</span>
                          </div>
                          <span style={{ fontSize:15,fontWeight:700,color:P.text }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={fetchAnalytics}
                    style={{ alignSelf:"flex-end",padding:"8px 16px",background:"none",
                      border:`1.5px solid ${P.border}`,borderRadius:10,color:P.muted,
                      fontFamily:"'Sora',sans-serif",fontSize:12,cursor:"pointer" }}>
                    ↻ Refresh Analytics
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

          <div style={{ background:"#fff",borderRadius:20,padding:"20px 20px 16px",
            border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <MiniCalendar leaves={leaves}/>
          </div>

          <div style={{ background:"#fff",borderRadius:20,padding:"18px 20px",
            border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontWeight:700,fontSize:14,color:P.text,marginBottom:14 }}>Recent requests</div>
            {leaves.slice(0,4).map(leave=>{
              const {bg:sBg,color:sColor}=statusStyle(leave.status);
              const pB=PRIORITY_BADGE[leave.leaveType];
              return (
                <div key={leave._id} style={{ marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${P.border}` }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:12,fontWeight:600,color:P.text }}>{leave.student?.fullName??"Unknown"}</div>
                      <div style={{ fontSize:11,color:P.muted,marginTop:2,fontFamily:"'DM Mono',monospace" }}>
                        {fmtDate(leave.fromDate)} – {fmtDate(leave.toDate)}
                      </div>
                    </div>
                    <span style={{ background:sBg,color:sColor,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20 }}>
                      {leave.status}
                    </span>
                  </div>
                  <div style={{ display:"flex",gap:6,marginTop:4,alignItems:"center" }}>
                    {pB&&<span style={{ fontSize:10,background:pB.bg,color:pB.color,padding:"2px 6px",borderRadius:10,fontWeight:600 }}>
                      {pB.icon} {leave.leaveType}
                    </span>}
                    <span style={{ fontSize:11,color:P.muted }}>{daysBetween(leave.fromDate,leave.toDate)} days</span>
                  </div>
                </div>
              );
            })}
            {leaves.length===0&&<div style={{ fontSize:12,color:P.muted,textAlign:"center" }}>No leave requests yet.</div>}
          </div>

          {/* Pending widget */}
          <div style={{ background:`linear-gradient(135deg,${P.primary},#1D4ED8)`,
            borderRadius:20,padding:"18px 20px",color:"#fff",
            boxShadow:"0 8px 24px rgba(37,99,235,0.30)" }}>
            <div style={{ fontSize:12,fontWeight:600,opacity:0.85,marginBottom:8 }}>Awaiting Your Action</div>
            <div style={{ fontSize:36,fontWeight:700 }}>{summary.pending??0}</div>
            <div style={{ fontSize:12,opacity:0.75,marginTop:2 }}>pending leave requests</div>
            <button onClick={()=>{setActiveTab("requests");setStatusFilter("Pending");applyFilters({page:1,status:"Pending"});}}
              style={{ marginTop:14,padding:"8px 16px",background:"rgba(255,255,255,0.2)",
                border:"1px solid rgba(255,255,255,0.3)",borderRadius:10,color:"#fff",
                fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",width:"100%" }}>
              Review All Pending →
            </button>
          </div>

          {/* Emergency alert widget */}
          {emergencyPending.length>0&&(
            <div style={{ background:"linear-gradient(135deg,#DC2626,#B91C1C)",
              borderRadius:20,padding:"16px 20px",color:"#fff",
              boxShadow:"0 8px 24px rgba(220,38,38,0.28)" }}>
              <div style={{ fontSize:12,fontWeight:600,opacity:0.9,marginBottom:4 }}>🚨 Emergency Requests</div>
              <div style={{ fontSize:28,fontWeight:700 }}>{emergencyPending.length}</div>
              <div style={{ fontSize:11,opacity:0.8,marginTop:2 }}>require immediate attention</div>
              <button onClick={()=>{setActiveTab("requests");setTypeFilter("Emergency");setStatusFilter("Pending");
                doFetch({page:1,limit:pagination.limit,leaveType:"Emergency",status:"Pending"});}}
                style={{ marginTop:12,padding:"7px 14px",background:"rgba(255,255,255,0.2)",
                  border:"1px solid rgba(255,255,255,0.3)",borderRadius:10,color:"#fff",
                  fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",width:"100%" }}>
                Review Emergency →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApprovals;