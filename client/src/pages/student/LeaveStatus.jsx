// pages/student/LeaveStatus.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyLeaves }    from "../../services/leaveService";
import { getUnreadCount } from "../../services/notificationService";
import { useAuth }        from "../../context/AuthContext";
import "./LeaveStatus.css";

/* ══════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
══════════════════════════════════════════════════════════ */
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const TYPE_CFG = {
  Casual:    { abbr:"CL", color:"#2563EB", dot:"#F59E0B", track:"#BFDBFE" },
  Medical:   { abbr:"ML", color:"#DC2626", dot:"#F87171", track:"#FECACA" },
  Emergency: { abbr:"EL", color:"#7C3AED", dot:"#A78BFA", track:"#DDD6FE" },
  Home:      { abbr:"HL", color:"#059669", dot:"#34D399", track:"#A7F3D0" },
  Event:     { abbr:"EV", color:"#0891B2", dot:"#22D3EE", track:"#A5F3FC" },
  Other:     { abbr:"OT", color:"#6B7280", dot:"#9CA3AF", track:"#E5E7EB" },
};
const getType = (t) => TYPE_CFG[t] || TYPE_CFG.Other;

const STATUS_CFG = {
  Pending:  { label:"Pending",  color:"#D97706", bg:"#FEF9C3", border:"#FDE047" },
  Approved: { label:"Approved", color:"#059669", bg:"#ECFDF5", border:"#6EE7B7" },
  Rejected: { label:"Rejected", color:"#DC2626", bg:"#FEF2F2", border:"#FECACA" },
};
const getStat = (s) => STATUS_CFG[s] || STATUS_CFG.Pending;

const getDays   = (from, to) => Math.max(1, Math.ceil((new Date(to)-new Date(from))/86400000)+1);
const fmtLong   = (iso) => { const d=new Date(iso+"T00:00:00"); return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort  = (iso) => { const d=new Date(iso+"T00:00:00"); return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`; };
const fmtRange  = (from,to) => getDays(from,to)===1 ? fmtLong(from) : `${fmtLong(from)} - ${fmtLong(to)}`;
const fmtRangeS = (from,to) => getDays(from,to)===1 ? fmtShort(from) : `${fmtShort(from)} - ${fmtShort(to)}`;

const getGreeting = () => {
  const h = new Date().getHours();
  return h<12 ? "Good morning" : h<17 ? "Good afternoon" : "Good evening";
};
const fmtTime = () => new Date().toLocaleString("en-IN",{
  day:"2-digit", month:"short", year:"numeric",
  hour:"2-digit", minute:"2-digit", hour12:true,
});

const avatarColors = ["#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#BE185D"];
const avatarBg  = (n="") => avatarColors[(n.charCodeAt(0)||0) % avatarColors.length];
const initials  = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";

/* ══════════════════════════════════════════════════════════
   SVG ICONS
══════════════════════════════════════════════════════════ */
const IcoBell    = ({sz=18}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoPlus    = ({sz=16}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoArrow   = ()        => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoChevR   = ()        => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoChevD   = ()        => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoClose   = ()        => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoCheck   = ({sz=10}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoX       = ({sz=10}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoClock   = ()        => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoMapPin  = ({sz=11}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoPhone   = ({sz=11}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.86 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoNote    = ({sz=11}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoAlert   = ({sz=12}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoCal     = ({sz=11}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoFilter  = ()        => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;

/* ══════════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════════ */
function Av({ name="", size=36, src }) {
  const bg = avatarBg(name);
  if (src) return <img src={src} alt={name} style={{ width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>;
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",
      background:`linear-gradient(135deg,${bg},${bg}bb)`,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:size*0.38,fontWeight:700,color:"#fff",flexShrink:0 }}>
      {initials(name)}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BAR CHART with hover tooltips
══════════════════════════════════════════════════════════ */
function BarChart({ data=[], labels=[], color="#93C5FD", activeColor="#2563EB", height=90, title="" }) {
  const [tip, setTip] = useState(null); // {x,y,label,val}
  const max = Math.max(...data, 1);
  const barH = height - 28;

  return (
    <div style={{ position:"relative", userSelect:"none" }}>
      <div style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:12 }}>{title}</div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:barH+22 }}>
        {data.map((v, i) => {
          const h = Math.max((v/max)*barH, v>0?3:0);
          const isMax = v===Math.max(...data);
          return (
            <div key={i} style={{ display:"flex",flexDirection:"column",
              alignItems:"center",flex:1,gap:4,cursor:"pointer" }}
              onMouseEnter={(e)=>{
                const r=e.currentTarget.getBoundingClientRect();
                const pr=e.currentTarget.closest(".ls-chart-wrap").getBoundingClientRect();
                setTip({ x:r.left-pr.left+r.width/2, y:pr.top-pr.top, label:labels[i]||i, val:v });
              }}
              onMouseLeave={()=>setTip(null)}>
              <div className="ls-bar"
                style={{ width:"100%",maxWidth:18,height:h,borderRadius:"3px 3px 0 0",
                  background:isMax?activeColor:color,
                  alignSelf:"flex-end",transition:"height .3s ease,background .15s" }}/>
              <span style={{ fontSize:9,color:"#9CA3AF",fontFamily:"Inter,sans-serif",
                whiteSpace:"nowrap" }}>
                {labels[i]||""}
              </span>
            </div>
          );
        })}
      </div>

      {tip && (
        <div className="ls-chart-tooltip"
          style={{ left:tip.x, top:0, transform:"translate(-50%,-115%)" }}>
          {tip.label}: {tip.val}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DONUT CHART
══════════════════════════════════════════════════════════ */
function Donut({ used=0, total=1, label="" }) {
  const r=30, cx=38, cy=38, circ=2*Math.PI*r;
  const pct = total>0 ? Math.min(used/total,1) : 0;
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="8"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2563EB" strokeWidth="8"
          strokeDasharray={`${circ*pct} ${circ*(1-pct)}`}
          strokeDashoffset={circ*0.25}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}/>
        <text x={cx} y={cy-4} textAnchor="middle"
          style={{fontSize:14,fontWeight:800,fill:"#111827",fontFamily:"Inter,sans-serif"}}>
          {used}
        </text>
        <text x={cx} y={cy+10} textAnchor="middle"
          style={{fontSize:9,fill:"#9CA3AF",fontFamily:"Inter,sans-serif"}}>
          /{total}
        </text>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PROGRESS ROW
══════════════════════════════════════════════════════════ */
function ProgressRow({ abbr, used, total, color, track }) {
  const pct = total>0 ? Math.round((used/total)*100) : 0;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:9 }}>
      <span style={{ width:20,fontSize:10,fontWeight:700,color:"#9CA3AF",
        flexShrink:0,fontFamily:"Inter,sans-serif" }}>{abbr}</span>
      <div style={{ flex:1,height:5,background:track||"#E5E7EB",
        borderRadius:100,overflow:"hidden" }}>
        <div style={{ height:"100%",width:`${pct}%`,
          background:color,borderRadius:100,transition:"width .4s ease" }}/>
      </div>
      <span style={{ fontSize:11,color:"#6B7280",
        fontFamily:"'DM Mono',monospace",flexShrink:0 }}>
        {used}/{total}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEPPER
══════════════════════════════════════════════════════════ */
function Stepper({ status }) {
  const step = status==="Pending" ? 2 : 3;
  const endC = status==="Approved"?"#059669":status==="Rejected"?"#DC2626":"#9CA3AF";
  const endL = status==="Approved"?"Approved":status==="Rejected"?"Declined":"Pending";
  const STEPS = [
    {label:"Applied",      done:step>=1, col:"#111827"},
    {label:"Under Review", done:step>=2, col:"#111827"},
    {label:endL,           done:step>=3, col:endC},
  ];
  return (
    <div style={{ display:"flex",alignItems:"flex-start",marginBottom:24 }}>
      {STEPS.map((s,i)=>(
        <div key={i} style={{ display:"flex",alignItems:"flex-start",
          flex:i<2?1:"none" }}>
          <div style={{ display:"flex",flexDirection:"column",
            alignItems:"center",gap:7,minWidth:76 }}>
            <div className={`ls-step-node${s.done?" ls-step-node--done":""}`}
              style={s.done?{background:s.col,borderColor:s.col,
                boxShadow:`0 0 0 3px ${s.col}22`}:{}}/>
            <span className={`ls-step-lbl${s.done?" ls-step-lbl--done":""}`}
              style={s.done?{color:s.col}:{}}>{s.label}</span>
          </div>
          {i<2 && (
            <div className={`ls-connector${step>i+1?" ls-connector--done":""}`}
              style={step>i+1?{background:STEPS[i+1].col}:{}}/>
          )}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LEAVE DETAIL MODAL
══════════════════════════════════════════════════════════ */
function LeaveModal({ leave, onClose }) {
  const from = leave.fromDate?.slice(0,10)||"";
  const to   = leave.toDate?.slice(0,10)  ||"";
  const days = getDays(from,to);
  const type = getType(leave.leaveType);
  const stat = getStat(leave.status);
  const rej  = leave.rejectionReason||leave.remarks||leave.remark||null;

  return (
    <div className="ls-modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="ls-modal">
        {/* Modal header */}
        <div style={{ padding:"20px 24px 16px",borderBottom:"1px solid #F3F4F6",
          display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:"#9CA3AF",
              textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5 }}>
              {days} {days===1?"Day":"Days"} Application
            </div>
            <div style={{ fontSize:20,fontWeight:800,color:"#111827",
              letterSpacing:"-0.4px",marginBottom:6 }}>
              {fmtRange(from,to)}
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <span style={{ width:8,height:8,borderRadius:"50%",
                background:type.dot,display:"inline-block" }}/>
              <span style={{ fontSize:13,fontWeight:600,color:type.color }}>
                {leave.leaveType}
              </span>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span className="ls-stat-chip"
              style={{ color:stat.color,background:stat.bg,border:`1px solid ${stat.border}` }}>
              {stat.label}
            </span>
            <button onClick={onClose}
              style={{ width:32,height:32,borderRadius:"50%",border:"none",
                background:"#F3F4F6",cursor:"pointer",display:"flex",
                alignItems:"center",justifyContent:"center",color:"#6B7280" }}>
              <IcoClose/>
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div style={{ padding:"20px 24px" }}>
          <Stepper status={leave.status}/>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 24px",marginBottom:16 }}>
            {[
              { icon:<IcoMapPin/>, label:"Destination", val:leave.destination, mono:false },
              { icon:<IcoCal/>,    label:"Duration",    val:`${days} ${days===1?"day":"days"}`, mono:false },
              { icon:<IcoCal/>,    label:"From",        val:fmtLong(from), mono:true },
              { icon:<IcoCal/>,    label:"To",          val:fmtLong(to),   mono:true },
            ].map(({icon,label,val,mono})=>(
              <div key={label}>
                <div style={{ display:"flex",alignItems:"center",gap:5,
                  fontSize:10,fontWeight:700,color:"#9CA3AF",
                  textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5 }}>
                  {icon}{label}
                </div>
                <div style={{ fontSize:14,color:"#111827",fontWeight:500,
                  lineHeight:1.5,fontFamily:mono?"'DM Mono',monospace":"inherit",
                  fontSize:mono?13:14 }}>{val||"—"}</div>
              </div>
            ))}

            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ display:"flex",alignItems:"center",gap:5,
                fontSize:10,fontWeight:700,color:"#9CA3AF",
                textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5 }}>
                <IcoNote/>Reason
              </div>
              <div style={{ fontSize:14,color:"#111827",fontWeight:400,lineHeight:1.6 }}>
                {leave.reason||"—"}
              </div>
            </div>

            {leave.emergencyContact && (
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:5,
                  fontSize:10,fontWeight:700,color:"#9CA3AF",
                  textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5 }}>
                  <IcoPhone/>Emergency Contact
                </div>
                <div style={{ fontSize:14,color:"#111827",fontWeight:500,
                  fontFamily:"'DM Mono',monospace",fontSize:13 }}>
                  {leave.emergencyContact}
                </div>
              </div>
            )}
          </div>

          {leave.status==="Rejected" && (
            <div style={{ background:"#FEF2F2",border:"1px solid #FECACA",
              borderRadius:12,padding:"14px 16px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
                <IcoAlert sz={13}/>
                <span style={{ fontSize:10,fontWeight:800,color:"#991B1B",
                  textTransform:"uppercase",letterSpacing:"0.08em" }}>
                  Warden Remark
                </span>
              </div>
              <div style={{ fontSize:14,color:"#991B1B",fontWeight:500,lineHeight:1.55 }}>
                {rej||"No reason provided."}
              </div>
            </div>
          )}

          {leave.status==="Approved" && (
            <div style={{ background:"#ECFDF5",border:"1px solid #6EE7B7",
              borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:20,height:20,borderRadius:"50%",background:"#059669",
                display:"flex",alignItems:"center",justifyContent:"center" }}>
                <IcoCheck sz={11}/>
              </div>
              <span style={{ fontSize:13,fontWeight:600,color:"#065F46" }}>
                This leave has been approved by the warden.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VIEW ALL MODAL
══════════════════════════════════════════════════════════ */
function ViewAllModal({ leaves, title, onClose }) {
  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState("All");
  const [typeF,     setTypeF]     = useState("All");
  const [selected,  setSelected]  = useState(null);

  const filtered = useMemo(() => leaves.filter(l => {
    if (statusF !== "All" && l.status !== statusF) return false;
    if (typeF   !== "All" && l.leaveType !== typeF) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.reason?.toLowerCase().includes(q) &&
          !l.leaveType?.toLowerCase().includes(q) &&
          !l.destination?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [leaves, search, statusF, typeF]);

  const MONTHS_FULL2 = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const grouped = useMemo(() => {
    const map={},order=[];
    filtered.forEach(l=>{
      const d = new Date((l.fromDate||"").slice(0,10)+"T00:00:00");
      const k = `${MONTHS_FULL2[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
      if(!map[k]){map[k]=[];order.push(k);}
      map[k].push(l);
    });
    return order.map(k=>({month:k,items:map[k]}));
  }, [filtered]);

  if (selected) return <LeaveModal leave={selected} onClose={()=>setSelected(null)}/>;

  return (
    <div className="ls-modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="ls-modal" style={{ maxWidth:740 }}>
        {/* Header */}
        <div style={{ padding:"18px 24px 14px",borderBottom:"1px solid #F3F4F6",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          position:"sticky",top:0,background:"#fff",zIndex:10,borderRadius:"20px 20px 0 0" }}>
          <div>
            <div style={{ fontSize:17,fontWeight:800,color:"#111827" }}>{title}</div>
            <div style={{ fontSize:12,color:"#9CA3AF",marginTop:2 }}>
              {filtered.length} of {leaves.length} requests
            </div>
          </div>
          <button onClick={onClose}
            style={{ width:34,height:34,borderRadius:"50%",border:"none",
              background:"#F3F4F6",cursor:"pointer",display:"flex",
              alignItems:"center",justifyContent:"center",color:"#6B7280" }}>
            <IcoClose/>
          </button>
        </div>

        {/* Filters */}
        <div style={{ padding:"12px 24px",borderBottom:"1px solid #F9FAFB",
          display:"flex",gap:8,flexWrap:"wrap",background:"#FAFAFA" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,flex:1,
            minWidth:180,padding:"7px 12px",
            border:"1.5px solid #E5E7EB",borderRadius:10,background:"#fff" }}>
            <IcoFilter/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search leaves…"
              style={{ border:"none",outline:"none",fontSize:13,
                fontFamily:"Inter,sans-serif",width:"100%",background:"transparent",
                color:"#111827" }}/>
          </div>

          {[["All","Pending","Approved","Rejected"],
            ["All","Casual","Medical","Emergency","Home","Event","Other"]
          ].map((opts,gi)=>(
            <div key={gi} style={{ position:"relative" }}>
              <select value={gi===0?statusF:typeF}
                onChange={e=>gi===0?setStatusF(e.target.value):setTypeF(e.target.value)}
                style={{ appearance:"none",padding:"7px 28px 7px 12px",
                  border:"1.5px solid #E5E7EB",borderRadius:10,
                  fontSize:13,fontFamily:"Inter,sans-serif",
                  color:"#374151",background:"#fff",cursor:"pointer",outline:"none" }}>
                {opts.map(o=><option key={o}>{o}</option>)}
              </select>
              <span style={{ position:"absolute",right:9,top:"50%",
                transform:"translateY(-50%)",color:"#9CA3AF",
                pointerEvents:"none",fontSize:10 }}>▼</span>
            </div>
          ))}
        </div>

        {/* List */}
        <div style={{ padding:"16px 24px 24px",overflowY:"auto",maxHeight:460 }}>
          {grouped.length===0 ? (
            <div style={{ textAlign:"center",padding:"40px",color:"#9CA3AF" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>📋</div>
              <div style={{ fontSize:14,fontWeight:600 }}>No requests found</div>
            </div>
          ) : grouped.map(({month,items})=>(
            <div key={month} style={{ marginBottom:24 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                <span style={{ fontSize:11,fontWeight:800,color:"#6B7280",
                  textTransform:"uppercase",letterSpacing:"0.1em" }}>{month}</span>
                <span style={{ fontSize:10,fontWeight:700,color:"#9CA3AF",
                  background:"#F3F4F6",borderRadius:100,padding:"1px 7px" }}>
                  {items.length}
                </span>
                <div style={{ flex:1,height:1,background:"#E5E7EB" }}/>
              </div>
              {items.map(leave=>{
                const from=leave.fromDate?.slice(0,10)||"";
                const to=leave.toDate?.slice(0,10)||"";
                const days=getDays(from,to);
                const stat=getStat(leave.status);
                const type=getType(leave.leaveType);
                return (
                  <div key={leave._id}
                    onClick={()=>setSelected(leave)}
                    style={{ display:"flex",alignItems:"center",gap:12,
                      padding:"12px 14px",border:"1px solid #E5E7EB",
                      borderRadius:12,marginBottom:8,cursor:"pointer",
                      transition:"all .15s",background:"#fff" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#9CA3AF";e.currentTarget.style.boxShadow="0 3px 10px rgba(0,0,0,0.06)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="#E5E7EB";e.currentTarget.style.boxShadow="none";}}>

                    {/* Status circle */}
                    {leave.status==="Approved"?(
                      <div style={{ width:22,height:22,borderRadius:"50%",
                        background:"#059669",display:"flex",alignItems:"center",
                        justifyContent:"center",flexShrink:0 }}>
                        <IcoCheck sz={11}/>
                      </div>
                    ):leave.status==="Rejected"?(
                      <div style={{ width:22,height:22,borderRadius:"50%",
                        background:"#DC2626",display:"flex",alignItems:"center",
                        justifyContent:"center",flexShrink:0 }}>
                        <IcoX sz={10}/>
                      </div>
                    ):(
                      <div style={{ width:22,height:22,borderRadius:"50%",
                        border:"2px solid #D1D5DB",flexShrink:0 }}/>
                    )}

                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:"#111827",
                        marginBottom:3 }}>
                        {fmtRangeS(from,to)}
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <span style={{ width:7,height:7,borderRadius:"50%",
                          background:type.dot,display:"inline-block" }}/>
                        <span style={{ fontSize:12,color:type.color,fontWeight:600 }}>
                          {leave.leaveType}
                        </span>
                        <span style={{ color:"#D1D5DB",fontSize:11 }}>•</span>
                        <span style={{ fontSize:12,color:"#6B7280",
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                          maxWidth:180 }}>
                          {leave.reason?.slice(0,35)||"—"}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign:"right",flexShrink:0 }}>
                      <div style={{ fontSize:12,fontWeight:500,color:"#374151",
                        marginBottom:3 }}>
                        {days} {days===1?"day":"days"}
                      </div>
                      <span className="ls-stat-chip"
                        style={{ fontSize:11,color:stat.color,
                          background:stat.bg,border:`1px solid ${stat.border}` }}>
                        {stat.label}
                      </span>
                    </div>

                    <div style={{ color:"#9CA3AF" }}><IcoChevR/></div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const LeaveStatus = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [leaves,   setLeaves]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [unread,   setUnread]   = useState(0);
  const [time,     setTime]     = useState(fmtTime());
  const [modal,    setModal]    = useState(null);   // leave object
  const [viewAll,  setViewAll]  = useState(null);   // "my"|"history"|"pending"
  const [expanded, setExpanded] = useState(null);   // leave._id in My Leaves

  /* live clock */
  useEffect(() => {
    const iv = setInterval(()=>setTime(fmtTime()), 60_000);
    return ()=>clearInterval(iv);
  },[]);

  /* fetch leaves */
  useEffect(()=>{
    getMyLeaves()
      .then(r=>setLeaves(Array.isArray(r.data)?r.data:[]))
      .catch(()=>setLeaves([]))
      .finally(()=>setLoading(false));
  },[]);

  /* poll unread */
  useEffect(()=>{
    const go = async()=>{ try{ const r=await getUnreadCount(); setUnread(r.data?.unreadCount||0); }catch{} };
    go();
    const iv=setInterval(go,20_000);
    return()=>clearInterval(iv);
  },[]);

  /* derived */
  const pending  = useMemo(()=>leaves.filter(l=>l.status==="Pending"),  [leaves]);
  const approved = useMemo(()=>leaves.filter(l=>l.status==="Approved"), [leaves]);
  const rejected = useMemo(()=>leaves.filter(l=>l.status==="Rejected"), [leaves]);

  /* weekly chart — last 7 calendar days Mon-Sun style */
  const weeklyData = useMemo(()=>{
    const today = new Date();
    const day   = today.getDay(); // 0=Sun
    const mon   = new Date(today); mon.setDate(today.getDate() - ((day+6)%7));
    const counts= [0,0,0,0,0,0,0];
    leaves.forEach(l=>{
      const d=new Date((l.createdAt||l.fromDate||"").slice(0,10)+"T00:00:00");
      const diff=Math.floor((d-mon)/86400000);
      if(diff>=0&&diff<7) counts[diff]++;
    });
    return counts;
  },[leaves]);

  /* monthly chart */
  const monthlyData = useMemo(()=>{
    const counts=new Array(12).fill(0);
    const year=new Date().getFullYear();
    leaves.forEach(l=>{
      const d=new Date((l.createdAt||l.fromDate||"").slice(0,10)+"T00:00:00");
      if(d.getFullYear()===year) counts[d.getMonth()]++;
    });
    return counts;
  },[leaves]);

  /* leave type stats */
  const typeStats = useMemo(()=>{
    const map={};
    leaves.forEach(l=>{ map[l.leaveType]=(map[l.leaveType]||0)+1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,4);
  },[leaves]);

  const total = leaves.length;
  const name  = user?.name||"Student";

  /* ── Render ── */
  return (
    <div className="ls-root" style={{ background:"#F5F6FA",minHeight:"100vh" }}>

      {/* ── Modals ──────────────────────────────────── */}
      {modal   && <LeaveModal leave={modal} onClose={()=>setModal(null)}/>}
      {viewAll && (
        <ViewAllModal
          leaves={
            viewAll==="pending"  ? pending
          : viewAll==="history"  ? [...approved,...rejected]
          : leaves
          }
          title={
            viewAll==="pending" ? "Pending Leave Requests"
          : viewAll==="history" ? "Leave History"
          : "All Leave Requests"
          }
          onClose={()=>setViewAll(null)}
        />
      )}

      {/* ════ STICKY TOPBAR ════════════════════════════ */}
      <header style={{ position:"sticky",top:0,zIndex:50,
        background:"#fff",borderBottom:"1px solid #E5E7EB",
        padding:"0 24px",height:56,
        display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={()=>navigate("/student/dashboard")}
            style={{ width:32,height:32,borderRadius:"50%",border:"none",
              background:"#F3F4F6",cursor:"pointer",display:"flex",
              alignItems:"center",justifyContent:"center",color:"#6B7280" }}>
            ←
          </button>
          <span style={{ fontSize:17,fontWeight:700,color:"#111827" }}>Leaves</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          {/* Bell */}
          <button onClick={()=>navigate("/student/notifications")}
            title="Notifications"
            style={{ position:"relative",width:38,height:38,borderRadius:"50%",
              background:"#F3F4F6",border:"none",display:"flex",
              alignItems:"center",justifyContent:"center",
              cursor:"pointer",color:"#374151",transition:"background .14s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#E5E7EB"}
            onMouseLeave={e=>e.currentTarget.style.background="#F3F4F6"}>
            <IcoBell sz={18}/>
            {unread>0 && (
              <span style={{ position:"absolute",top:-3,right:-3,
                minWidth:18,height:18,padding:"0 4px",
                background:"#DC2626",color:"#fff",fontSize:10,fontWeight:700,
                borderRadius:20,display:"flex",alignItems:"center",
                justifyContent:"center",border:"2px solid #fff",lineHeight:1,
                animation:"ls-pulse 2s infinite" }}>
                {unread>99?"99+":unread}
              </span>
            )}
          </button>
          {/* + Apply */}
          <button onClick={()=>navigate("/student/apply-leave")}
            title="Apply for Leave"
            style={{ width:36,height:36,borderRadius:10,
              background:"#2563EB",border:"none",display:"flex",
              alignItems:"center",justifyContent:"center",
              cursor:"pointer",color:"#fff",
              boxShadow:"0 3px 10px rgba(37,99,235,0.35)",
              transition:"background .14s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#1D4ED8"}
            onMouseLeave={e=>e.currentTarget.style.background="#2563EB"}>
            <IcoPlus sz={16}/>
          </button>
        </div>
      </header>

      {/* ════ PAGE HEADER ═══════════════════════════════ */}
      <div style={{ background:"#fff",borderBottom:"1px solid #E5E7EB",
        padding:"18px 28px",
        display:"flex",justifyContent:"space-between",alignItems:"flex-start",
        flexWrap:"wrap",gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:800,color:"#111827",
            letterSpacing:"-0.5px",margin:0 }}>
            {getGreeting()}, {name}!
          </h1>
          <p style={{ fontSize:13,color:"#6B7280",marginTop:5 }}>
            {pending.length>0
              ? `You have ${pending.length} leave request${pending.length>1?"s":""} pending.`
              : "No pending leave requests right now."}
          </p>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10,
          padding:"10px 16px",border:"1px solid #E5E7EB",
          borderRadius:12,background:"#FAFAFA",flexShrink:0 }}>
          <div>
            <div style={{ fontSize:10,color:"#9CA3AF",fontWeight:600,
              textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3 }}>
              Current time
            </div>
            <div style={{ fontSize:13,fontWeight:600,color:"#111827" }}>{time}</div>
          </div>
          <div style={{ color:"#9CA3AF" }}><IcoClock/></div>
        </div>
      </div>

      <div style={{ padding:"20px 28px 32px" }}>

        {/* ════ CHARTS ROW ════════════════════════════════ */}
        <div className="ls-charts-grid" style={{ display:"grid",
          gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16 }}>

          {/* Weekly */}
          <div className="ls-chart-wrap" style={{ background:"#fff",
            borderRadius:14,padding:"18px 18px 10px",border:"1px solid #E5E7EB",
            position:"relative" }}>
            <BarChart data={weeklyData} labels={DAYS_SHORT}
              color="#BFDBFE" activeColor="#2563EB"
              height={100} title="Weekly leave pattern"/>
            <div style={{ fontSize:11,color:"#9CA3AF",marginTop:8,textAlign:"center" }}>
              Last 7 days  ·  Total: {weeklyData.reduce((s,v)=>s+v,0)}
            </div>
          </div>

          {/* Monthly */}
          <div className="ls-chart-wrap" style={{ background:"#fff",
            borderRadius:14,padding:"18px 18px 10px",border:"1px solid #E5E7EB",
            position:"relative" }}>
            <BarChart data={monthlyData} labels={MONTHS_SHORT}
              color="#BFDBFE" activeColor="#2563EB"
              height={100} title="Monthly stats"/>
            <div style={{ fontSize:11,color:"#9CA3AF",marginTop:8,textAlign:"center" }}>
              {new Date().getFullYear()}  ·  Total: {monthlyData.reduce((s,v)=>s+v,0)}
            </div>
          </div>

          {/* Consumed types */}
          <div style={{ background:"#fff",borderRadius:14,padding:"18px",
            border:"1px solid #E5E7EB" }}>
            <div style={{ fontSize:13,fontWeight:700,color:"#111827",marginBottom:10 }}>
              Consumed leave types
            </div>
            <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                {/* Legend */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",
                  gap:"4px 12px",marginBottom:12 }}>
                  {Object.entries(TYPE_CFG).slice(0,4).map(([k,v])=>(
                    <div key={k} style={{ display:"flex",alignItems:"center",
                      gap:4,fontSize:11,color:"#6B7280" }}>
                      <span style={{ fontWeight:700,color:"#374151",
                        fontSize:10,width:16 }}>{v.abbr}</span>
                      {k}
                    </div>
                  ))}
                </div>
                {/* Bars */}
                {typeStats.length>0 ? typeStats.map(([t,c])=>{
                  const cfg=getType(t);
                  return (
                    <ProgressRow key={t} abbr={cfg.abbr}
                      used={c} total={total||1}
                      color={cfg.color} track={cfg.track}/>
                  );
                }) : (
                  <div style={{ fontSize:12,color:"#9CA3AF" }}>No data yet</div>
                )}
              </div>
              <Donut used={approved.length} total={total||1}/>
            </div>
          </div>
        </div>

        {/* ════ BOTTOM SPLIT ══════════════════════════════ */}
        <div className="ls-bottom-grid" style={{ display:"grid",
          gridTemplateColumns:"1fr 1fr",gap:16 }}>

          {/* ──── My Leaves ─────────────────────────────── */}
          <div style={{ background:"#fff",borderRadius:14,padding:"20px",
            border:"1px solid #E5E7EB" }}>
            <div style={{ display:"flex",justifyContent:"space-between",
              alignItems:"center",marginBottom:16 }}>
              <h2 style={{ fontSize:15,fontWeight:700,color:"#111827",margin:0 }}>
                My Leaves
              </h2>
              <button onClick={()=>navigate("/student/apply-leave")}
                style={{ display:"flex",alignItems:"center",gap:5,
                  background:"none",border:"none",cursor:"pointer",
                  fontSize:13,fontWeight:600,color:"#2563EB",
                  fontFamily:"Inter,sans-serif" }}>
                Apply for Leaves <IcoArrow/>
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign:"center",padding:"32px",color:"#9CA3AF",fontSize:13 }}>
                Loading…
              </div>
            ) : leaves.length===0 ? (
              <div style={{ textAlign:"center",padding:"40px",color:"#9CA3AF" }}>
                <div style={{ fontSize:13,fontWeight:600,marginBottom:12 }}>
                  No leave requests yet
                </div>
                <button onClick={()=>navigate("/student/apply-leave")}
                  style={{ padding:"9px 20px",background:"#2563EB",
                    color:"#fff",border:"none",borderRadius:100,
                    fontSize:12,fontWeight:700,cursor:"pointer",
                    fontFamily:"Inter,sans-serif" }}>
                  Apply for Leave
                </button>
              </div>
            ) : (
              <>
                <div style={{ maxHeight:370,overflowY:"auto",paddingRight:2 }}>
                  {leaves.slice(0,8).map(leave=>{
                    const from=leave.fromDate?.slice(0,10)||"";
                    const to=leave.toDate?.slice(0,10)||"";
                    const days=getDays(from,to);
                    const stat=getStat(leave.status);
                    const exp=expanded===leave._id;
                    return (
                      <div key={leave._id} style={{ borderBottom:"1px solid #F3F4F6" }}>
                        <div className="ls-leave-row"
                          onClick={()=>{
                            setExpanded(exp?null:leave._id);
                          }}>
                          {/* Status icon */}
                          {leave.status==="Approved"?(
                            <div style={{ width:22,height:22,borderRadius:"50%",
                              background:"#059669",display:"flex",alignItems:"center",
                              justifyContent:"center",flexShrink:0,marginTop:1 }}>
                              <IcoCheck sz={11}/>
                            </div>
                          ):leave.status==="Rejected"?(
                            <div style={{ width:22,height:22,borderRadius:"50%",
                              background:"#DC2626",display:"flex",alignItems:"center",
                              justifyContent:"center",flexShrink:0,marginTop:1 }}>
                              <IcoX sz={10}/>
                            </div>
                          ):(
                            <div style={{ width:22,height:22,borderRadius:"50%",
                              border:"2px solid #D1D5DB",flexShrink:0,marginTop:1 }}/>
                          )}

                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontSize:13,fontWeight:500,
                              color:"#111827",marginBottom:3,lineHeight:1.3 }}>
                              {fmtRange(from,to)}
                            </div>
                            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                              <span style={{ fontSize:12,color:"#6B7280",
                                overflow:"hidden",textOverflow:"ellipsis",
                                whiteSpace:"nowrap",maxWidth:180 }}>
                                {leave.reason?.slice(0,30)||"—"}
                              </span>
                              <span style={{ color:"#D1D5DB" }}>•</span>
                              <span style={{ fontSize:12,color:"#6B7280",whiteSpace:"nowrap" }}>
                                {days} {days===1?"day":"days"}
                              </span>
                            </div>
                          </div>

                          <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                            <span style={{ fontSize:12,fontWeight:700,color:stat.color }}>
                              {stat.label}
                            </span>
                            <div style={{ color:"#9CA3AF",transform:exp?"rotate(90deg)":"none",
                              transition:"transform .2s" }}>
                              <IcoChevR/>
                            </div>
                          </div>
                        </div>

                        {/* Inline expand */}
                        {exp && (
                          <div style={{ padding:"0 0 14px 32px" }}>
                            <div style={{ background:"#F9FAFB",borderRadius:10,
                              padding:"14px",border:"1px solid #E5E7EB" }}>
                              <div style={{ display:"grid",
                                gridTemplateColumns:"1fr 1fr",gap:"10px 16px",
                                marginBottom:10 }}>
                                {[
                                  ["Type",        leave.leaveType],
                                  ["Duration",    `${days} days`],
                                  ["Destination", leave.destination],
                                  ["Contact",     leave.emergencyContact],
                                ].filter(([,v])=>v).map(([k,v])=>(
                                  <div key={k}>
                                    <div style={{ fontSize:10,fontWeight:700,
                                      color:"#9CA3AF",textTransform:"uppercase",
                                      letterSpacing:"0.07em",marginBottom:3 }}>{k}</div>
                                    <div style={{ fontSize:13,color:"#111827",fontWeight:500 }}>{v}</div>
                                  </div>
                                ))}
                              </div>
                              {leave.reason && (
                                <div style={{ marginBottom:10 }}>
                                  <div style={{ fontSize:10,fontWeight:700,color:"#9CA3AF",
                                    textTransform:"uppercase",letterSpacing:"0.07em",
                                    marginBottom:3 }}>Reason</div>
                                  <div style={{ fontSize:13,color:"#374151",lineHeight:1.5 }}>
                                    {leave.reason}
                                  </div>
                                </div>
                              )}
                              {leave.status==="Rejected"&&(leave.rejectionReason||leave.remarks)&&(
                                <div style={{ padding:"10px 12px",background:"#FEF2F2",
                                  borderRadius:8,border:"1px solid #FECACA" }}>
                                  <div style={{ fontSize:10,fontWeight:700,color:"#991B1B",
                                    textTransform:"uppercase",letterSpacing:"0.07em",
                                    marginBottom:4 }}>Warden Remark</div>
                                  <div style={{ fontSize:13,color:"#991B1B",
                                    fontWeight:500,lineHeight:1.5 }}>
                                    {leave.rejectionReason||leave.remarks}
                                  </div>
                                </div>
                              )}
                              <button onClick={()=>setModal(leave)}
                                style={{ marginTop:10,padding:"7px 14px",
                                  background:"#EFF6FF",color:"#2563EB",
                                  border:"1px solid #BFDBFE",borderRadius:8,
                                  fontSize:12,fontWeight:600,cursor:"pointer",
                                  fontFamily:"Inter,sans-serif" }}>
                                View full details →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* View all button */}
                <button onClick={()=>setViewAll("my")}
                  style={{ width:"100%",marginTop:12,padding:"10px",
                    background:"#F9FAFB",border:"1.5px solid #E5E7EB",
                    borderRadius:10,color:"#374151",fontSize:13,
                    fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",
                    transition:"background .14s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#F3F4F6"}
                  onMouseLeave={e=>e.currentTarget.style.background="#F9FAFB"}>
                  View all {leaves.length} requests
                </button>
              </>
            )}
          </div>

          {/* ──── Leave Requests (right panel) ─────────── */}
          <div style={{ background:"#fff",borderRadius:14,padding:"20px",
            border:"1px solid #E5E7EB" }}>
            <div style={{ display:"flex",justifyContent:"space-between",
              alignItems:"center",marginBottom:16 }}>
              <h2 style={{ fontSize:15,fontWeight:700,color:"#111827",margin:0 }}>
                Leave Requests
              </h2>
              <button onClick={()=>setViewAll("history")}
                style={{ display:"flex",alignItems:"center",gap:5,
                  background:"none",border:"none",cursor:"pointer",
                  fontSize:13,fontWeight:600,color:"#2563EB",
                  fontFamily:"Inter,sans-serif" }}>
                View All <IcoChevR/>
              </button>
            </div>

            {/* Pending */}
            {pending.length>0 && (
              <div style={{ marginBottom:18 }}>
                <div style={{ display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:10 }}>
                  <div style={{ fontSize:11,fontWeight:700,color:"#9CA3AF",
                    textTransform:"uppercase",letterSpacing:"0.09em" }}>
                    Pending Leaves
                  </div>
                  {pending.length>3 && (
                    <button onClick={()=>setViewAll("pending")}
                      style={{ fontSize:11,fontWeight:600,color:"#2563EB",
                        background:"none",border:"none",cursor:"pointer",
                        fontFamily:"Inter,sans-serif" }}>
                      See all {pending.length}
                    </button>
                  )}
                </div>
                {pending.slice(0,3).map(leave=>{
                  const from=leave.fromDate?.slice(0,10)||"";
                  const to=leave.toDate?.slice(0,10)||"";
                  const days=getDays(from,to);
                  return (
                    <div key={leave._id} className="ls-hist-row"
                      onClick={()=>setModal(leave)}
                      style={{ cursor:"pointer" }}>
                      <Av name={leave.leaveType+(leave._id||"")} size={36}/>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:600,color:"#111827",
                          marginBottom:2 }}>
                          {leave.leaveType} Leave
                        </div>
                        <div style={{ fontSize:12,color:"#6B7280",
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                          {leave.reason?.slice(0,28)||"—"}
                        </div>
                      </div>
                      <div style={{ textAlign:"right",flexShrink:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#374151",marginBottom:2 }}>
                          {fmtShort(from)}
                        </div>
                        <div style={{ fontSize:11,color:"#9CA3AF" }}>
                          {days} {days===1?"day":"days"}
                        </div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setModal(leave);}}
                        style={{ padding:"5px 12px",background:"#EFF6FF",
                          color:"#2563EB",border:"1px solid #BFDBFE",
                          borderRadius:100,fontSize:11,fontWeight:600,
                          cursor:"pointer",fontFamily:"Inter,sans-serif",flexShrink:0 }}>
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* History */}
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:"#9CA3AF",
                textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10 }}>
                Leave History
              </div>
              {[...approved,...rejected].length===0 ? (
                <div style={{ fontSize:13,color:"#9CA3AF",
                  textAlign:"center",padding:"20px 0" }}>
                  No history yet
                </div>
              ) : (
                <>
                  {[...approved,...rejected].slice(0,4).map(leave=>{
                    const from=leave.fromDate?.slice(0,10)||"";
                    const to=leave.toDate?.slice(0,10)||"";
                    const days=getDays(from,to);
                    const stat=getStat(leave.status);
                    return (
                      <div key={leave._id} className="ls-hist-row"
                        onClick={()=>setModal(leave)}
                        style={{ cursor:"pointer" }}>
                        <Av name={leave.leaveType+(leave._id||"")} size={36}/>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:600,color:"#111827",marginBottom:2 }}>
                            {leave.leaveType} Leave
                          </div>
                          <div style={{ fontSize:12,color:"#6B7280",
                            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                            {leave.destination||leave.reason?.slice(0,22)||"—"}
                          </div>
                        </div>
                        <div style={{ textAlign:"right",flexShrink:0 }}>
                          <div style={{ fontSize:12,fontWeight:500,color:"#374151",marginBottom:2 }}>
                            {fmtRangeS(from,to)}
                          </div>
                          <div style={{ fontSize:11,color:"#9CA3AF" }}>
                            {days} {days===1?"day":"days"}
                          </div>
                        </div>
                        <span style={{ fontSize:12,fontWeight:700,
                          color:stat.color,flexShrink:0 }}>
                          {stat.label}
                        </span>
                      </div>
                    );
                  })}
                  {[...approved,...rejected].length>4 && (
                    <button onClick={()=>setViewAll("history")}
                      style={{ width:"100%",marginTop:8,padding:"9px",
                        background:"#F9FAFB",border:"1.5px solid #E5E7EB",
                        borderRadius:10,color:"#374151",fontSize:12,
                        fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                      View all history ({[...approved,...rejected].length})
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeaveStatus;