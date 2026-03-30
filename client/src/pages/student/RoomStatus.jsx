// pages/student/RoomStatus.jsx  — responsive for both mobile and desktop
import { useEffect, useState } from "react";
import { getMyProfile, getRoomStatus, getRoommates } from "../../services/studentService";
import { raiseIssue, getMyIssues } from "../../services/issueService";
import useIsMobile from "../../hooks/useIsMobile";
 
if (!document.getElementById("rs-font")) {
  const l = document.createElement("link");
  l.id   = "rs-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}
 
const P = {
  primary:"#2563EB", indigo:"#4338CA", surface:"#F8FAFF",
  border:"#E8EEFF", text:"#0F1629", muted:"#6B7A99",
  green:"#059669", amber:"#D97706", red:"#DC2626",
};
 
const CATS = ["Maintenance","Cleanliness","Electrical","Plumbing","Security","Food","Internet","Noise","Other"];
const PRIS = ["Low","Medium","High","Urgent"];
const PRI_CFG = {
  Low    :{ color:"#059669", bg:"#ECFDF5", border:"#6EE7B7", icon:"🟢" },
  Medium :{ color:"#D97706", bg:"#FFFBEB", border:"#FDE68A", icon:"🟡" },
  High   :{ color:"#EA580C", bg:"#FFF7ED", border:"#FED7AA", icon:"🟠" },
  Urgent :{ color:"#DC2626", bg:"#FEF2F2", border:"#FECACA", icon:"🔴" },
};
const STATUS_CFG = {
  "Open"        :{ color:"#DC2626", bg:"#FEF2F2", icon:"🔴" },
  "In Progress" :{ color:"#D97706", bg:"#FFFBEB", icon:"🔧" },
  "Resolved"    :{ color:"#059669", bg:"#ECFDF5", icon:"✅" },
  "Closed"      :{ color:"#6B7280", bg:"#F9FAFB", icon:"🔒" },
};
 
const avatarColors = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2"];
const avatarBg = (n="") => avatarColors[(n.charCodeAt(0)||0) % avatarColors.length];
const initials = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";
const timeAgo  = (d) => {
  const s=(Date.now()-new Date(d))/1000;
  if(s<60)    return "just now";
  if(s<3600)  return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};
 
const Card = ({children,style={}}) => (
  <div style={{background:"#fff",border:`1px solid ${P.border}`,borderRadius:16,
    padding:"20px 22px",boxShadow:"0 1px 4px rgba(37,99,235,0.06)",...style}}>
    {children}
  </div>
);
const SectionLabel = ({children}) => (
  <div style={{fontSize:10,fontWeight:700,color:P.muted,textTransform:"uppercase",
    letterSpacing:"0.09em",marginBottom:14}}>{children}</div>
);
const Skeleton = ({h=16,w="100%",mb=10,radius=8}) => (
  <div style={{height:h,width:w,marginBottom:mb,borderRadius:radius,
    background:"linear-gradient(90deg,#EEF2FF,#F5F8FF,#EEF2FF)",
    backgroundSize:"200% 100%",animation:"rs-shimmer 1.4s ease-in-out infinite"}}/>
);
 
function IssueForm({roomNumber,onSubmitted}) {
  const [form,setForm] = useState({title:"",description:"",category:"Maintenance",priority:"Medium"});
  const [submitting,setSubmitting] = useState(false);
  const [msg,setMsg] = useState("");
  const handle = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const submit = async(e) => {
    e.preventDefault();
    if(!form.title.trim()||!form.description.trim()) return;
    setSubmitting(true); setMsg("");
    try {
      await raiseIssue({...form,title:`[Room ${roomNumber}] ${form.title}`});
      setMsg("ok");
      setForm({title:"",description:"",category:"Maintenance",priority:"Medium"});
      setTimeout(()=>{setMsg("");onSubmitted();},2200);
    } catch(err){ setMsg(err.response?.data?.message||"Failed to raise issue."); }
    finally{setSubmitting(false);}
  };
  return (
    <form onSubmit={submit}>
      {msg==="ok" && (
        <div style={{background:"#D1FAE5",border:"1px solid #6EE7B7",borderRadius:12,
          padding:"11px 16px",marginBottom:16,color:"#065F46",fontSize:13,fontWeight:600}}>
          ✅ Issue raised! Your warden has been notified.
        </div>
      )}
      {msg&&msg!=="ok" && (
        <div style={{background:"#FEE2E2",border:"1px solid #FECACA",borderRadius:12,
          padding:"11px 16px",marginBottom:16,color:"#991B1B",fontSize:13,fontWeight:600}}>
          ❌ {msg}
        </div>
      )}
      <div style={{display:"grid",gap:13}}>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:600,color:P.muted,
            textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>
            Issue Title <span style={{color:P.red}}>*</span>
          </label>
          <input name="title" value={form.title} onChange={handle} required
            placeholder="e.g. Leaking tap, broken window…"
            style={{width:"100%",padding:"9px 13px",border:`1.5px solid ${P.border}`,
              borderRadius:10,fontSize:13,fontFamily:"'Sora',sans-serif",color:P.text,
              outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:600,color:P.muted,
            textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>
            Description <span style={{color:P.red}}>*</span>
          </label>
          <textarea name="description" value={form.description} onChange={handle}
            rows={3} required placeholder="Describe the issue clearly…"
            style={{width:"100%",padding:"9px 13px",border:`1.5px solid ${P.border}`,
              borderRadius:10,fontSize:13,fontFamily:"'Sora',sans-serif",color:P.text,
              outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:P.muted,
              textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Category</label>
            <select name="category" value={form.category} onChange={handle}
              style={{width:"100%",padding:"9px 13px",border:`1.5px solid ${P.border}`,
                borderRadius:10,fontSize:13,fontFamily:"'Sora',sans-serif",color:P.text,
                background:"#fff",outline:"none"}}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:P.muted,
              textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Priority</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>
              {PRIS.map(p=>{
                const cfg=PRI_CFG[p]; const sel=form.priority===p;
                return (
                  <button key={p} type="button"
                    onClick={()=>setForm(f=>({...f,priority:p}))}
                    style={{padding:"7px 0",borderRadius:9,
                      border:`1.5px solid ${sel?cfg.color:P.border}`,
                      background:sel?cfg.bg:"#fff",color:sel?cfg.color:P.muted,
                      fontSize:12,fontWeight:700,cursor:"pointer",
                      fontFamily:"'Sora',sans-serif"}}>
                    {cfg.icon}
                  </button>
                );
              })}
            </div>
            <div style={{textAlign:"center",fontSize:10,color:P.muted,marginTop:4}}>
              {form.priority} priority
            </div>
          </div>
        </div>
        <button type="submit" disabled={submitting}
          style={{marginTop:4,width:"100%",padding:"12px",
            background:submitting?"rgba(37,99,235,0.5)":`linear-gradient(135deg,${P.primary},${P.indigo})`,
            border:"none",borderRadius:12,cursor:submitting?"not-allowed":"pointer",
            fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Sora',sans-serif",
            boxShadow:submitting?"none":"0 4px 16px rgba(37,99,235,0.32)",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {submitting?(<><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.35)",
            borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block",
            animation:"rs-spin .7s linear infinite"}}/>Raising issue…</>):"🔧 Raise Room Issue"}
        </button>
      </div>
    </form>
  );
}
 
function IssueRow({issue}) {
  const [open,setOpen]=useState(false);
  const p=PRI_CFG[issue.priority]||PRI_CFG.Medium;
  const s=STATUS_CFG[issue.status]||STATUS_CFG["Open"];
  return (
    <div style={{border:`1.5px solid ${open?P.primary:P.border}`,borderRadius:12,
      overflow:"hidden",marginBottom:8,transition:"all .18s"}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{padding:"13px 16px",cursor:"pointer",display:"flex",
          justifyContent:"space-between",alignItems:"flex-start",gap:10,background:"#fff"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontWeight:700,color:p.color,background:p.bg,
              border:`1px solid ${p.border}`,padding:"2px 8px",borderRadius:20}}>
              {p.icon} {issue.priority}
            </span>
            <span style={{fontSize:10,color:P.muted,background:P.surface,
              padding:"2px 8px",borderRadius:20}}>{issue.category}</span>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:P.text,marginBottom:3}}>{issue.title}</div>
          <div style={{fontSize:11,color:P.muted}}>{timeAgo(issue.createdAt)}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:11,fontWeight:700,color:s.color,background:s.bg,
            padding:"3px 10px",borderRadius:20}}>{s.icon} {issue.status}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.muted} strokeWidth="2.5"
            style={{transform:open?"rotate(180deg)":"none",transition:"transform .18s"}}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      {open&&(
        <div style={{borderTop:`1px solid ${P.border}`,padding:"13px 16px",background:"#FAFBFF"}}>
          <div style={{fontSize:13,color:P.muted,lineHeight:1.65,marginBottom:10}}>
            {issue.description}
          </div>
          {issue.resolution&&(
            <div style={{background:"#ECFDF5",border:"1px solid #6EE7B7",borderRadius:10,padding:"10px 13px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#065F46",textTransform:"uppercase",
                letterSpacing:"0.06em",marginBottom:5}}>✅ Warden Resolution</div>
              <div style={{fontSize:13,color:"#065F46",fontWeight:500,lineHeight:1.55}}>
                {issue.resolution}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 
/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
const RoomStatus = () => {
  const isMobile = useIsMobile();
 
  const [profile,   setProfile]   = useState(null);
  const [room,      setRoom]      = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [issues,    setIssues]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState("raise");
 
  const loadIssues = async() => {
    try{ const r=await getMyIssues(); setIssues(r.data??[]); }catch{}
  };
 
  useEffect(()=>{
    const boot = async() => {
      try {
        const [prof,roomData] = await Promise.all([getMyProfile(),getRoomStatus()]);
        setProfile(prof);
        setRoom(roomData);
        if(roomData?.roomNumber){
          try{ const rm = await getRoommates(); setRoommates(rm.roommates??[]); }catch{}
        }
        await loadIssues();
      } catch { setError("Failed to load room details. Please try again."); }
      finally { setLoading(false); }
    };
    boot();
  },[]);
 
  const pagePad = isMobile ? "16px 14px" : "32px 36px";
 
  if(loading) return (
    <div style={{fontFamily:"'Sora',sans-serif",background:P.surface,minHeight:"100vh",padding:pagePad}}>
      <style>{`@keyframes rs-shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}`}</style>
      <Skeleton h={32} w={220} mb={28} radius={10}/>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:20}}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{background:"#fff",borderRadius:16,padding:22,border:`1px solid ${P.border}`}}>
            <Skeleton h={14} w="50%" mb={18}/><Skeleton h={22} mb={10}/>
          </div>
        ))}
      </div>
    </div>
  );
 
  if(error) return (
    <div style={{fontFamily:"'Sora',sans-serif",background:P.surface,minHeight:"100vh",padding:pagePad,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",border:"1.5px solid #FECACA",borderRadius:16,
        padding:"32px 40px",textAlign:"center",maxWidth:400}}>
        <div style={{fontSize:40,marginBottom:16}}>⚠️</div>
        <h3 style={{margin:"0 0 8px",fontSize:17,color:P.red}}>Something went wrong</h3>
        <p style={{color:P.muted,fontSize:14,margin:0}}>{error}</p>
      </div>
    </div>
  );
 
  const isAllocated   = !!room?.roomNumber;
  const openCount     = issues.filter(i=>i.status==="Open").length;
  const resolvedCount = issues.filter(i=>i.status==="Resolved").length;
 
  const InfoRow = ({label,value}) => value ? (
    <div style={{display:"flex",justifyContent:"space-between",
      padding:"9px 0",borderBottom:`1px solid ${P.border}`}}>
      <span style={{fontSize:12,color:P.muted}}>{label}</span>
      <span style={{fontSize:12,fontWeight:600,color:P.text,
        textAlign:"right",maxWidth:200,wordBreak:"break-word"}}>{value}</span>
    </div>
  ) : null;
 
  return (
    <div style={{fontFamily:"'Sora',sans-serif",background:P.surface,minHeight:"100vh",
      padding:pagePad,color:P.text}}>
      <style>{`
        @keyframes rs-shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}
        @keyframes rs-spin{to{transform:rotate(360deg)}}
        @keyframes rs-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      `}</style>
 
      <div style={{maxWidth:1100,margin:"0 auto",animation:"rs-fade .4s ease"}}>
 
        {/* Header */}
        <div style={{marginBottom:isMobile?16:28}}>
          <div style={{fontSize:10,fontWeight:700,color:P.primary,
            letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>
            HostelEase · Student Portal
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            flexWrap:"wrap",gap:12}}>
            <h1 style={{margin:0,fontSize:isMobile?22:26,fontWeight:800,letterSpacing:"-0.5px"}}>
              🏠 My Room
            </h1>
            {isAllocated ? (
              <span style={{background:"#D1FAE5",color:"#065F46",border:"1px solid #6EE7B7",
                padding:"6px 16px",borderRadius:20,fontSize:13,fontWeight:700}}>✅ Allocated</span>
            ) : (
              <span style={{background:"#FEF9C3",color:"#854D0E",border:"1px solid #FDE047",
                padding:"6px 16px",borderRadius:20,fontSize:13,fontWeight:700}}>⏳ Not Allocated</span>
            )}
          </div>
        </div>
 
        {/* Not allocated */}
        {!isAllocated && (
          <Card style={{textAlign:"center",padding:"56px 40px",maxWidth:480,margin:"0 auto"}}>
            <div style={{fontSize:56,marginBottom:18}}>🗏️</div>
            <h2 style={{margin:"0 0 10px",fontSize:20,fontWeight:700,color:P.text}}>
              Room not allocated yet
            </h2>
            <p style={{color:P.muted,fontSize:14,lineHeight:1.65,margin:"0 0 22px"}}>
              Your room hasn't been assigned yet. Please contact the warden's office.
            </p>
            <div style={{background:P.surface,border:`1px solid ${P.border}`,
              borderRadius:12,padding:"13px 18px",fontSize:13,color:P.muted}}>
              📞 Visit the warden's office or raise a query via My Issues
            </div>
          </Card>
        )}
 
        {/* Allocated layout — responsive grid */}
        {isAllocated && (
          <div style={{
            display:"grid",
            gridTemplateColumns:isMobile?"1fr":"1fr 1fr",
            gap:isMobile?16:20
          }}>
            {/* LEFT */}
            <div style={{display:"flex",flexDirection:"column",gap:isMobile?14:20}}>
 
              {/* Room Details */}
              <Card>
                <SectionLabel>Room Details</SectionLabel>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  {[
                    ["Room Number", room.roomNumber, P.primary],
                    ["Bed / Bunk",  room.bedNumber,  "#7C3AED"],
                    ["Block",       room.block||"—",  P.green],
                    ["Floor",       room.floor||"—",  P.amber],
                  ].map(([lbl,val,color])=>(
                    <div key={lbl} style={{background:P.surface,border:`1px solid ${P.border}`,
                      borderRadius:12,padding:"14px 16px"}}>
                      <div style={{fontSize:10,color:P.muted,fontWeight:600,
                        textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{lbl}</div>
                      <div style={{fontSize:isMobile?20:22,fontWeight:800,color}}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:`linear-gradient(135deg,${P.primary},${P.indigo})`,
                  borderRadius:12,padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:28}}>🏢</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>
                      {profile?.collegeName||"Hostel Residence"}
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.72)",marginTop:2}}>
                      Room {room.roomNumber} · Bed {room.bedNumber}
                    </div>
                  </div>
                </div>
              </Card>
 
              {/* My Profile */}
              <Card>
                <SectionLabel>My Profile</SectionLabel>
                <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",
                  borderRadius:12,background:`linear-gradient(135deg,${P.primary},${P.indigo})`,
                  marginBottom:18}}>
                  <div style={{width:52,height:52,borderRadius:"50%",
                    background:"rgba(255,255,255,0.22)",display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:20,fontWeight:800,color:"#fff",flexShrink:0}}>
                    {initials(profile?.fullName||"S")}
                  </div>
                  <div>
                    <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>
                      {profile?.fullName||"—"}
                    </div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.72)",marginTop:2}}>
                      {profile?.rollNumber||""}{profile?.department?` · ${profile.department}`:""}
                    </div>
                  </div>
                </div>
                <div>
                  <InfoRow label="Roll Number"  value={profile?.rollNumber}  />
                  <InfoRow label="Department"   value={profile?.department}  />
                  <InfoRow label="Course"       value={profile?.course}      />
                  <InfoRow label="Batch / Year" value={profile?.batch}       />
                  <InfoRow label="College"      value={profile?.collegeName} />
                  <InfoRow label="Gender"       value={profile?.gender}      />
                  <InfoRow label="Blood Group"  value={profile?.bloodGroup}  />
                  <InfoRow label="Phone"        value={profile?.phoneNumber} />
                </div>
              </Card>
            </div>
 
            {/* RIGHT */}
            <div style={{display:"flex",flexDirection:"column",gap:isMobile?14:20}}>
 
              {/* Roommates */}
              <Card>
                <div style={{display:"flex",alignItems:"center",
                  justifyContent:"space-between",marginBottom:14}}>
                  <SectionLabel>Roommates</SectionLabel>
                  {roommates.length>0&&(
                    <span style={{fontSize:11,fontWeight:700,background:P.surface,color:P.primary,
                      border:`1px solid ${P.border}`,padding:"3px 10px",borderRadius:20}}>
                      {roommates.length} roommate{roommates.length!==1?"s":""}
                    </span>
                  )}
                </div>
                {roommates.length===0 ? (
                  <div style={{textAlign:"center",padding:"28px 20px",color:P.muted}}>
                    <div style={{fontSize:36,marginBottom:10}}>👥</div>
                    <div style={{fontWeight:600,color:P.text,marginBottom:5}}>No roommates yet</div>
                    <div style={{fontSize:12}}>Others will appear here once allocated to Room {room.roomNumber}.</div>
                  </div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {roommates.map((mate,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,
                        padding:"12px 14px",background:P.surface,border:`1px solid ${P.border}`,
                        borderRadius:12}}>
                        <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,
                          background:`linear-gradient(135deg,${avatarBg(mate.fullName)},${avatarBg(mate.fullName)}bb)`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:14,fontWeight:800,color:"#fff"}}>
                          {initials(mate.fullName)}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:P.text}}>{mate.fullName}</div>
                          <div style={{fontSize:11,color:P.muted,marginTop:2}}>
                            {[mate.rollNumber,mate.department].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                        {mate.bedNumber&&(
                          <span style={{fontSize:11,fontWeight:700,background:"#EFF6FF",color:P.primary,
                            border:"1px solid #BFDBFE",padding:"4px 10px",borderRadius:20,flexShrink:0}}>
                            Bed {mate.bedNumber}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
 
              {/* Issues */}
              <Card>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
                  {[
                    {label:"Open",     v:openCount,     color:P.red,     bg:"#FEF2F2"},
                    {label:"Resolved", v:resolvedCount, color:P.green,   bg:"#ECFDF5"},
                    {label:"Total",    v:issues.length, color:P.primary, bg:"#EFF6FF"},
                  ].map(({label,v,color,bg})=>(
                    <div key={label} style={{background:bg,borderRadius:10,
                      padding:"12px 10px",textAlign:"center"}}>
                      <div style={{fontSize:20,fontWeight:800,color}}>{v}</div>
                      <div style={{fontSize:10,color:P.muted,marginTop:2}}>{label}</div>
                    </div>
                  ))}
                </div>
 
                <div style={{display:"flex",gap:4,background:P.surface,borderRadius:10,
                  padding:4,marginBottom:18,border:`1px solid ${P.border}`,width:"fit-content"}}>
                  {[["raise","🔧 Raise Issue"],["history","📋 My Issues"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setActiveTab(k)}
                      style={{padding:"7px 16px",borderRadius:8,border:"none",
                        background:activeTab===k?P.primary:"none",
                        color:activeTab===k?"#fff":P.muted,
                        fontFamily:"'Sora',sans-serif",fontWeight:600,
                        fontSize:12,cursor:"pointer"}}>
                      {l}
                      {k==="history"&&issues.length>0&&(
                        <span style={{marginLeft:6,
                          background:activeTab===k?"rgba(255,255,255,0.28)":"#E8EEFF",
                          color:activeTab===k?"#fff":P.muted,
                          fontSize:10,borderRadius:20,padding:"1px 6px"}}>
                          {issues.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
 
                {activeTab==="raise"&&(
                  <IssueForm roomNumber={room.roomNumber}
                    onSubmitted={()=>{loadIssues();setActiveTab("history");}}/>
                )}
                {activeTab==="history"&&(
                  <div>
                    {issues.length===0?(
                      <div style={{textAlign:"center",padding:"36px 20px",color:P.muted}}>
                        <div style={{fontSize:36,marginBottom:10}}>🔧</div>
                        <div style={{fontWeight:600,color:P.text,marginBottom:5}}>No issues raised yet</div>
                        <div style={{fontSize:12}}>Use the Raise Issue tab to report problems</div>
                      </div>
                    ):(
                      issues.map(issue=><IssueRow key={issue._id} issue={issue}/>)
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default RoomStatus;
 
