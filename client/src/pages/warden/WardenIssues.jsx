// pages/warden/WardenIssues.jsx
import { useState, useEffect, useCallback } from "react";
import { getAllIssues, getIssueStats, updateIssueStatus } from "../../services/issueService";

if (!document.getElementById("wi-font")) {
  const l = document.createElement("link");
  l.id = "wi-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
}

const P = { primary:"#2563EB",surface:"#F8FAFF",border:"#E8EEFF",text:"#0F1629",muted:"#6B7A99" };

const PRI_CFG  = {
  Low:    { color:"#059669",bg:"#ECFDF5",border:"#6EE7B7",icon:"🟢",order:4 },
  Medium: { color:"#D97706",bg:"#FFFBEB",border:"#FDE68A",icon:"🟡",order:3 },
  High:   { color:"#EA580C",bg:"#FFF7ED",border:"#FED7AA",icon:"🟠",order:2 },
  Urgent: { color:"#DC2626",bg:"#FEF2F2",border:"#FECACA",icon:"🔴",order:1 },
};
const STAT_CFG = {
  Open:         { color:"#DC2626",bg:"#FEF2F2",border:"#FECACA",icon:"🔴" },
  "In Progress":{ color:"#D97706",bg:"#FFFBEB",border:"#FDE68A",icon:"🔧" },
  Resolved:     { color:"#059669",bg:"#ECFDF5",border:"#6EE7B7",icon:"✅" },
  Closed:       { color:"#6B7280",bg:"#F9FAFB",border:"#E5E7EB",icon:"🔒" },
};

const timeAgo = (d) => {
  const s=(Date.now()-new Date(d))/1000;
  if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

/* ── Resolve Modal ─────────────────────────────────────── */
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
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed",inset:0,background:"rgba(15,22,41,0.55)",
        backdropFilter:"blur(4px)",zIndex:200,display:"flex",
        alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif" }}>
      <div style={{ background:"#fff",borderRadius:24,width:440,overflow:"hidden",
        boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ background:"linear-gradient(135deg,#2563EB,#1D4ED8)",padding:"22px 28px" }}>
          <div style={{ fontSize:16,fontWeight:700,color:"#fff",marginBottom:4 }}>
            Update Issue Status
          </div>
          <div style={{ fontSize:12,color:"rgba(255,255,255,0.7)" }}>
            {issue.title}
          </div>
        </div>
        <div style={{ padding:"24px 28px" }}>
          {/* Status selector */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12,fontWeight:600,color:P.muted,
              textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:10 }}>
              New Status
            </label>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8 }}>
              {["In Progress","Resolved","Closed","Open"].map(s=>{
                const cfg = STAT_CFG[s];
                const sel = status===s;
                return (
                  <button key={s} type="button" onClick={()=>setStatus(s)}
                    style={{ padding:"10px",borderRadius:12,
                      border:`1.5px solid ${sel?cfg.color:P.border}`,
                      background:sel?cfg.bg:"#fff",
                      color:sel?cfg.color:P.muted,
                      fontFamily:"'Sora',sans-serif",fontSize:13,
                      fontWeight:600,cursor:"pointer",
                      display:"flex",alignItems:"center",gap:6 }}>
                    {cfg.icon} {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <label style={{ fontSize:12,fontWeight:600,color:P.muted,
              textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:8 }}>
              Resolution / Remarks
            </label>
            <textarea value={resolution} onChange={e=>setResolution(e.target.value)} rows={3}
              placeholder="Describe what was done to fix the issue…"
              style={{ width:"100%",padding:"10px 14px",border:`1.5px solid ${P.border}`,
                borderRadius:12,fontSize:13,fontFamily:"'Sora',sans-serif",
                color:P.text,background:"#fff",outline:"none",
                resize:"vertical",boxSizing:"border-box" }}/>
            <div style={{ fontSize:11,color:P.muted,marginTop:4 }}>
              This message will be sent to the student via notification.
            </div>
          </div>
        </div>
        <div style={{ padding:"0 28px 24px",display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onClose}
            style={{ padding:"10px 20px",border:`1.5px solid ${P.border}`,borderRadius:12,
              background:"none",cursor:"pointer",fontSize:13,color:P.muted,
              fontFamily:"'Sora',sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding:"10px 22px",background:saving?"rgba(37,99,235,0.5)":P.primary,
              border:"none",borderRadius:12,cursor:saving?"not-allowed":"pointer",
              fontSize:13,fontWeight:600,color:"#fff",fontFamily:"'Sora',sans-serif",
              display:"flex",alignItems:"center",gap:8 }}>
            {saving?(
              <><span style={{ width:12,height:12,border:"2px solid rgba(255,255,255,0.4)",
                borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block",
                animation:"spin .7s linear infinite" }}/>Saving…</>
            ):"✓ Update Status"}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </div>
  );
}

/* ── Issue Row ─────────────────────────────────────────── */
function IssueRow({ issue, onUpdate }) {
  const [open,   setOpen]   = useState(false);
  const [modal,  setModal]  = useState(false);
  const p = PRI_CFG[issue.priority]  || PRI_CFG.Medium;
  const s = STAT_CFG[issue.status]   || STAT_CFG.Open;
  const studentName = issue.student?.fullName ?? "Unknown";
  const roll        = issue.student?.rollNumber ?? "";
  const dept        = issue.student?.department ?? "";

  return (
    <>
      {modal && (
        <ResolveModal issue={issue}
          onClose={()=>setModal(false)}
          onSave={async (id,data)=>{ await onUpdate(id,data); setModal(false); }}/>
      )}
      <div style={{ background:"#fff",borderRadius:16,
        border:open?`1.5px solid ${P.primary}`:`1.5px solid ${P.border}`,
        overflow:"hidden",marginBottom:10,
        boxShadow:open?"0 8px 24px rgba(37,99,235,0.10)":"0 1px 4px rgba(0,0,0,0.04)",
        transition:"all .2s" }}>
        <div onClick={()=>setOpen(o=>!o)}
          style={{ padding:"16px 20px",cursor:"pointer",
            display:"flex",alignItems:"center",gap:14,
            background: issue.priority==="Urgent"&&issue.status==="Open" ? "#FFF8F8" : "#fff" }}>

          {/* Priority + category */}
          <div style={{ width:90,flexShrink:0 }}>
            <span style={{ display:"flex",alignItems:"center",gap:5,
              fontSize:11,fontWeight:700,color:p.color,
              background:p.bg,border:`1px solid ${p.border}`,
              padding:"3px 8px",borderRadius:20,width:"fit-content",marginBottom:4 }}>
              {p.icon} {issue.priority}
            </span>
            <div style={{ fontSize:10,color:P.muted,background:"#F1F5F9",
              padding:"2px 6px",borderRadius:10,width:"fit-content" }}>
              {issue.category}
            </div>
          </div>

          {/* Title + student */}
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:14,fontWeight:700,color:P.text,marginBottom:3 }}>
              {issue.title}
            </div>
            <div style={{ fontSize:12,color:P.muted }}>
              {studentName} {roll?`· ${roll}`:""} {dept?`· ${dept}`:""}
            </div>
          </div>

          {/* Time */}
          <div style={{ fontSize:11,color:P.muted,flexShrink:0,textAlign:"right",
            fontFamily:"'DM Mono',monospace" }}>
            {timeAgo(issue.createdAt)}
          </div>

          {/* Status */}
          <div style={{ flexShrink:0 }}>
            <span style={{ fontSize:12,fontWeight:700,color:s.color,
              background:s.bg,border:`1px solid ${s.border}`,
              padding:"4px 10px",borderRadius:20 }}>
              {s.icon} {issue.status}
            </span>
          </div>

          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth="2.5"
            style={{ transform:open?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {open && (
          <div style={{ borderTop:`1px solid ${P.border}`,padding:"16px 20px",background:"#FAFBFF" }}>
            <div style={{ fontSize:13,color:P.muted,lineHeight:1.6,marginBottom:12 }}>
              {issue.description}
            </div>
            {issue.attachments?.length > 0 && (
              <div style={{ display:"flex",gap:8,marginBottom:12 }}>
                {issue.attachments.map((src,i)=>(
                  <img key={i} src={src} alt="" style={{ width:64,height:64,
                    borderRadius:10,objectFit:"cover",border:`1px solid ${P.border}` }}/>
                ))}
              </div>
            )}
            {issue.resolution && (
              <div style={{ background:"#ECFDF5",border:"1px solid #6EE7B7",
                borderRadius:10,padding:"10px 14px",marginBottom:12 }}>
                <div style={{ fontSize:11,fontWeight:700,color:"#065F46",marginBottom:4 }}>
                  ✅ Resolution
                </div>
                <div style={{ fontSize:13,color:"#065F46" }}>{issue.resolution}</div>
              </div>
            )}
            <button onClick={()=>setModal(true)}
              style={{ padding:"9px 18px",background:P.primary,color:"#fff",
                border:"none",borderRadius:10,cursor:"pointer",
                fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:600,
                boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
              🔧 Update Status
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════ */
const WardenIssues = () => {
  const [issues,  setIssues]  = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total:0, totalPages:1, page:1 });
  const [statusF, setStatusF] = useState("");
  const [priorityF, setPriorityF] = useState("");

  const load = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const params = { page, limit:20 };
      if (statusF)   params.status   = statusF;
      if (priorityF) params.priority = priorityF;
      const [ir, sr] = await Promise.all([getAllIssues(params), getIssueStats()]);
      setIssues(ir.data.issues ?? []);
      setPagination(ir.data.pagination ?? { total:0,totalPages:1,page:1 });
      setStats(sr.data);
    } catch {}
    finally { setLoading(false); }
  }, [statusF, priorityF]);

  useEffect(() => { load(1); }, [statusF, priorityF]);

  const handleUpdate = async (id, data) => {
    await updateIssueStatus(id, data);
    load(1);
  };

  const todayStr = new Date().toLocaleDateString("en-IN",{
    weekday:"long",day:"numeric",month:"long",year:"numeric"
  });

  return (
    <div style={{ fontFamily:"'Sora',sans-serif",background:P.surface,
      minHeight:"100vh",padding:24,color:P.text }}>

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:28,flexWrap:"wrap",gap:12 }}>
        <div>
          <div style={{ fontSize:11,fontWeight:600,color:P.primary,
            letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>
            HostelEase · Warden Portal
          </div>
          <h1 style={{ margin:0,fontSize:24,fontWeight:700,color:P.text }}>
            🔧 Student Issues
          </h1>
          <p style={{ margin:"4px 0 0",fontSize:13,color:P.muted }}>{todayStr}</p>
        </div>
        <button onClick={()=>load(1)}
          style={{ padding:"10px 18px",background:P.primary,color:"#fff",border:"none",
            borderRadius:12,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13,
            cursor:"pointer",boxShadow:"0 4px 14px rgba(37,99,235,0.35)" }}>
          ↻ Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:24 }}>
        {[
          { icon:"📋", v:stats?.total     ?? 0, l:"Total",      bg:"#EFF6FF", c:P.primary },
          { icon:"🔴", v:stats?.open      ?? 0, l:"Open",       bg:"#FEF2F2", c:"#DC2626" },
          { icon:"🔧", v:stats?.inProgress?? 0, l:"In Progress",bg:"#FFFBEB", c:"#D97706" },
          { icon:"✅", v:stats?.resolved  ?? 0, l:"Resolved",   bg:"#ECFDF5", c:"#059669" },
          { icon:"🚨", v:stats?.urgent    ?? 0, l:"Urgent Open",bg:"#FEF2F2", c:"#DC2626" },
        ].map(({ icon,v,l,bg,c })=>(
          <div key={l} style={{ background:"#fff",borderRadius:18,padding:"18px 20px",
            border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
            textAlign:"center" }}>
            <div style={{ width:36,height:36,borderRadius:10,background:bg,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:17,margin:"0 auto 8px" }}>{icon}</div>
            <div style={{ fontSize:22,fontWeight:700,color:P.text }}>{v}</div>
            <div style={{ fontSize:11,color:P.muted,marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
        {/* Status */}
        <div style={{ position:"relative" }}>
          <select value={statusF} onChange={e=>setStatusF(e.target.value)}
            style={{ appearance:"none",padding:"8px 32px 8px 12px",
              border:`1.5px solid ${P.border}`,borderRadius:12,fontSize:13,
              fontFamily:"'Sora',sans-serif",color:P.text,background:"#fff",
              cursor:"pointer",outline:"none" }}>
            <option value="">All Status</option>
            {["Open","In Progress","Resolved","Closed"].map(s=>(
              <option key={s}>{s}</option>
            ))}
          </select>
          <span style={{ position:"absolute",right:10,top:"50%",
            transform:"translateY(-50%)",color:P.muted,pointerEvents:"none",fontSize:10 }}>▼</span>
        </div>

        {/* Priority */}
        <div style={{ position:"relative" }}>
          <select value={priorityF} onChange={e=>setPriorityF(e.target.value)}
            style={{ appearance:"none",padding:"8px 32px 8px 12px",
              border:`1.5px solid ${P.border}`,borderRadius:12,fontSize:13,
              fontFamily:"'Sora',sans-serif",color:P.text,background:"#fff",
              cursor:"pointer",outline:"none" }}>
            <option value="">All Priority</option>
            {["Urgent","High","Medium","Low"].map(p=>(
              <option key={p}>{p}</option>
            ))}
          </select>
          <span style={{ position:"absolute",right:10,top:"50%",
            transform:"translateY(-50%)",color:P.muted,pointerEvents:"none",fontSize:10 }}>▼</span>
        </div>

        {(statusF||priorityF) && (
          <button onClick={()=>{setStatusF("");setPriorityF("");}}
            style={{ padding:"8px 14px",border:`1.5px solid ${P.border}`,borderRadius:12,
              background:"none",color:P.muted,fontFamily:"'Sora',sans-serif",
              fontSize:12,cursor:"pointer" }}>
            ✕ Clear
          </button>
        )}

        <span style={{ marginLeft:"auto",fontSize:12,color:P.muted }}>
          {loading?"…":pagination.total} issues
        </span>
      </div>

      {/* Issue list */}
      {loading ? (
        <div style={{ textAlign:"center",padding:"60px",color:P.muted }}>
          <div style={{ fontSize:28,marginBottom:8 }}>⏳</div>
          <div style={{ fontWeight:600 }}>Loading issues…</div>
        </div>
      ) : issues.length === 0 ? (
        <div style={{ textAlign:"center",padding:"60px",color:P.muted }}>
          <div style={{ fontSize:48,marginBottom:12 }}>🔧</div>
          <div style={{ fontWeight:700,fontSize:16,color:P.text,marginBottom:6 }}>
            No issues found
          </div>
          <div style={{ fontSize:13 }}>
            {statusF||priorityF ? "Try changing filters" : "No issues have been raised by students yet"}
          </div>
        </div>
      ) : (
        issues.map(issue => (
          <IssueRow key={issue._id} issue={issue} onUpdate={handleUpdate}/>
        ))
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div style={{ display:"flex",justifyContent:"center",gap:6,marginTop:20 }}>
          {Array.from({ length: pagination.totalPages }, (_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>load(p)}
              style={{ width:32,height:32,borderRadius:8,fontSize:13,cursor:"pointer",
                border:`1.5px solid ${pagination.page===p?P.primary:P.border}`,
                background:pagination.page===p?P.primary:"#fff",
                color:pagination.page===p?"#fff":P.muted,
                fontFamily:"'Sora',sans-serif" }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WardenIssues;