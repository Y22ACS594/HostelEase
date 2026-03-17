// pages/student/RaiseIssue.jsx
import { useState, useEffect, useRef } from "react";
import { raiseIssue, getMyIssues } from "../../services/issueService";

if (!document.getElementById("ri-font")) {
  const l = document.createElement("link");
  l.id = "ri-font";
  l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
}

const P = {
  primary:"#2563EB", surface:"#F8FAFF", border:"#E5E7EB",
  text:"#111827", muted:"#6B7280",
};

const CATS = ["Maintenance","Cleanliness","Electrical","Plumbing","Security","Food","Internet","Noise","Other"];
const PRIS = ["Low","Medium","High","Urgent"];

const PRI_CFG = {
  Low:    { color:"#059669", bg:"#ECFDF5", border:"#6EE7B7", icon:"🟢" },
  Medium: { color:"#D97706", bg:"#FFFBEB", border:"#FDE68A", icon:"🟡" },
  High:   { color:"#EA580C", bg:"#FFF7ED", border:"#FED7AA", icon:"🟠" },
  Urgent: { color:"#DC2626", bg:"#FEF2F2", border:"#FECACA", icon:"🔴" },
};

const STATUS_CFG = {
  Open:        { color:"#DC2626", bg:"#FEF2F2", border:"#FECACA", icon:"🔴" },
  "In Progress":{ color:"#D97706", bg:"#FFFBEB", border:"#FDE68A", icon:"🔧" },
  Resolved:    { color:"#059669", bg:"#ECFDF5", border:"#6EE7B7", icon:"✅" },
  Closed:      { color:"#6B7280", bg:"#F9FAFB", border:"#E5E7EB", icon:"🔒" },
};

const timeAgo = (d) => {
  const s = (Date.now()-new Date(d))/1000;
  if (s<60) return "just now";
  if (s<3600) return `${Math.floor(s/60)}m ago`;
  if (s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

function Input({ label, name, value, onChange, placeholder, required, type="text" }) {
  const [foc,setFoc] = useState(false);
  return (
    <div>
      <label style={{ display:"block",fontSize:12,fontWeight:600,
        color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7 }}>
        {label}{required&&<span style={{ color:"#DC2626" }}> *</span>}
      </label>
      <input name={name} value={value} onChange={onChange} type={type}
        placeholder={placeholder} required={required}
        style={{ width:"100%",padding:"10px 14px",
          border:`1.5px solid ${foc?P.primary:P.border}`,
          borderRadius:12,fontSize:13,fontFamily:"'Inter',sans-serif",
          color:P.text,background:"#fff",outline:"none",
          boxShadow:foc?"0 0 0 3px rgba(37,99,235,0.12)":"none",
          transition:"all .15s",boxSizing:"border-box" }}
        onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}/>
    </div>
  );
}

function IssueCard({ issue }) {
  const [open,setOpen] = useState(false);
  const p = PRI_CFG[issue.priority]||PRI_CFG.Medium;
  const s = STATUS_CFG[issue.status]||STATUS_CFG.Open;
  return (
    <div style={{ background:"#fff",borderRadius:16,
      border: open?"1.5px solid #2563EB":"1.5px solid #E5E7EB",
      overflow:"hidden",marginBottom:10,
      boxShadow:open?"0 8px 24px rgba(37,99,235,0.10)":"0 1px 4px rgba(0,0,0,0.04)",
      transition:"all .2s" }}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{ padding:"16px 20px",cursor:"pointer",
          display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap" }}>
            <span style={{ fontSize:11,fontWeight:700,color:p.color,
              background:p.bg,border:`1px solid ${p.border}`,
              padding:"2px 8px",borderRadius:20 }}>
              {p.icon} {issue.priority}
            </span>
            <span style={{ fontSize:11,color:"#9CA3AF",
              background:"#F3F4F6",padding:"2px 8px",borderRadius:20,fontWeight:500 }}>
              {issue.category}
            </span>
          </div>
          <div style={{ fontSize:15,fontWeight:700,color:P.text,marginBottom:4 }}>
            {issue.title}
          </div>
          <div style={{ fontSize:12,color:P.muted }}>
            {timeAgo(issue.createdAt)}
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
          <span style={{ fontSize:12,fontWeight:700,color:s.color,
            background:s.bg,border:`1px solid ${s.border}`,
            padding:"4px 12px",borderRadius:20 }}>
            {s.icon} {issue.status}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth="2.5"
            style={{ transform:open?"rotate(180deg)":"none",transition:"transform .2s" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      {open && (
        <div style={{ borderTop:"1px solid #F3F4F6",padding:"16px 20px",background:"#FAFBFF" }}>
          <div style={{ fontSize:13,color:P.muted,lineHeight:1.6,marginBottom:12 }}>
            {issue.description}
          </div>
          {issue.resolution && (
            <div style={{ background:"#ECFDF5",border:"1px solid #6EE7B7",
              borderRadius:12,padding:"12px 14px" }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#065F46",
                textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 }}>
                ✅ Warden Resolution
              </div>
              <div style={{ fontSize:13,color:"#065F46",fontWeight:500,lineHeight:1.5 }}>
                {issue.resolution}
              </div>
            </div>
          )}
          {issue.resolvedAt && (
            <div style={{ fontSize:11,color:"#9CA3AF",marginTop:10 }}>
              Resolved on {new Date(issue.resolvedAt).toLocaleDateString("en-IN",{
                day:"2-digit",month:"short",year:"numeric"
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const RaiseIssue = () => {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    title:"", description:"", category:"Maintenance", priority:"Medium", attachments:[],
  });
  const [preview, setPreview] = useState([]);
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [tab,     setTab]     = useState("raise"); // raise | history

  const load = async () => {
    try { const r = await getMyIssues(); setIssues(r.data??[]); }
    catch {}
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const handleChange = (e) => setForm(f=>({ ...f, [e.target.name]:e.target.value }));

  const handlePhoto = (e) => {
    const files = Array.from(e.target.files).slice(0,3);
    files.forEach(file => {
      if (file.size > 2*1024*1024) return;
      const r = new FileReader();
      r.onload = (ev) => {
        setPreview(p=>[...p, ev.target.result]);
        setForm(f=>({ ...f, attachments:[...f.attachments, ev.target.result] }));
      };
      r.readAsDataURL(file);
    });
  };

  const removePhoto = (i) => {
    setPreview(p=>p.filter((_,idx)=>idx!==i));
    setForm(f=>({ ...f, attachments:f.attachments.filter((_,idx)=>idx!==i) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMsg("");
    try {
      await raiseIssue(form);
      setMsg("success");
      setForm({ title:"",description:"",category:"Maintenance",priority:"Medium",attachments:[] });
      setPreview([]);
      load();
    } catch(err) {
      setMsg(err.response?.data?.message||"Failed to raise issue");
    } finally { setSubmitting(false); }
  };

  const open    = issues.filter(i=>i.status==="Open").length;
  const inProg  = issues.filter(i=>i.status==="In Progress").length;
  const resolved= issues.filter(i=>i.status==="Resolved").length;

  return (
    <div style={{ fontFamily:"'Inter',sans-serif",background:P.surface,
      minHeight:"100vh",padding:"28px 24px",color:P.text }}>

      {/* Header */}
      <div style={{ maxWidth:700,margin:"0 auto" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11,fontWeight:600,color:P.primary,
            letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>
            HostelEase · Student Portal
          </div>
          <h1 style={{ margin:0,fontSize:26,fontWeight:800,color:P.text,letterSpacing:"-0.5px" }}>
            🔧 Issues & Complaints
          </h1>
          <p style={{ margin:"6px 0 0",fontSize:13,color:P.muted }}>
            Raise issues directly to your warden and track their resolution
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24 }}>
          {[
            { label:"Open",       value:open,    color:"#DC2626", bg:"#FEF2F2" },
            { label:"In Progress",value:inProg,  color:"#D97706", bg:"#FFFBEB" },
            { label:"Resolved",   value:resolved,color:"#059669", bg:"#ECFDF5" },
          ].map(({ label,value,color,bg })=>(
            <div key={label} style={{ background:"#fff",borderRadius:14,padding:"14px 16px",
              border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
              textAlign:"center" }}>
              <div style={{ fontSize:22,fontWeight:800,color }}>{loading?"…":value}</div>
              <div style={{ fontSize:12,color:P.muted,marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex",gap:4,background:"#fff",borderRadius:12,
          padding:4,marginBottom:24,border:`1px solid ${P.border}`,width:"fit-content" }}>
          {[["raise","🔧 Raise Issue"],["history","📋 My Issues"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)}
              style={{ padding:"8px 18px",borderRadius:9,border:"none",
                background:tab===k?P.primary:"none",
                color:tab===k?"#fff":P.muted,
                fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer" }}>
              {l}
              {k==="history"&&issues.length>0&&(
                <span style={{ marginLeft:6,background:tab===k?"rgba(255,255,255,0.3)":"#E5E7EB",
                  color:tab===k?"#fff":"#6B7280",fontSize:11,borderRadius:20,
                  padding:"1px 6px" }}>{issues.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Raise Issue Form ── */}
        {tab === "raise" && (
          <div style={{ background:"#fff",borderRadius:20,padding:"24px 28px",
            border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>

            {msg==="success" && (
              <div style={{ background:"#D1FAE5",border:"1px solid #6EE7B7",borderRadius:12,
                padding:"12px 16px",marginBottom:20,color:"#065F46",fontSize:13,fontWeight:600,
                display:"flex",alignItems:"center",gap:8 }}>
                ✅ Issue raised successfully! The warden has been notified.
                <button onClick={()=>setMsg("")}
                  style={{ marginLeft:"auto",background:"none",border:"none",
                    cursor:"pointer",color:"#065F46",fontSize:16 }}>×</button>
              </div>
            )}
            {msg && msg!=="success" && (
              <div style={{ background:"#FEE2E2",border:"1px solid #FECACA",borderRadius:12,
                padding:"12px 16px",marginBottom:20,color:"#991B1B",fontSize:13,fontWeight:600 }}>
                ❌ {msg}
              </div>
            )}

            <form onSubmit={submit}>
              <div style={{ display:"grid",gap:16 }}>
                <Input label="Issue Title" name="title" value={form.title}
                  onChange={handleChange} placeholder="Brief description of the issue" required/>

                <div>
                  <label style={{ display:"block",fontSize:12,fontWeight:600,
                    color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7 }}>
                    Description <span style={{ color:"#DC2626" }}>*</span>
                  </label>
                  <textarea name="description" value={form.description}
                    onChange={handleChange} rows={4} required
                    placeholder="Describe the issue in detail (min 10 characters)…"
                    style={{ width:"100%",padding:"10px 14px",
                      border:`1.5px solid ${P.border}`,borderRadius:12,
                      fontSize:13,fontFamily:"'Inter',sans-serif",
                      color:P.text,background:"#fff",outline:"none",
                      resize:"vertical",boxSizing:"border-box" }}/>
                </div>

                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                  {/* Category */}
                  <div>
                    <label style={{ display:"block",fontSize:12,fontWeight:600,
                      color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7 }}>
                      Category
                    </label>
                    <select name="category" value={form.category} onChange={handleChange}
                      style={{ width:"100%",padding:"10px 14px",
                        border:`1.5px solid ${P.border}`,borderRadius:12,
                        fontSize:13,fontFamily:"'Inter',sans-serif",color:P.text,
                        background:"#fff",appearance:"none",cursor:"pointer",outline:"none" }}>
                      {CATS.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label style={{ display:"block",fontSize:12,fontWeight:600,
                      color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7 }}>
                      Priority
                    </label>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
                      {PRIS.map(p=>{
                        const cfg = PRI_CFG[p];
                        const sel = form.priority===p;
                        return (
                          <button key={p} type="button"
                            onClick={()=>setForm(f=>({...f,priority:p}))}
                            style={{ padding:"7px 0",borderRadius:10,
                              border:`1.5px solid ${sel?cfg.color:P.border}`,
                              background:sel?cfg.bg:"#fff",
                              color:sel?cfg.color:P.muted,
                              fontSize:11,fontWeight:700,cursor:"pointer",
                              fontFamily:"'Inter',sans-serif" }}>
                            {cfg.icon}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ textAlign:"center",fontSize:11,color:P.muted,marginTop:4 }}>
                      {form.priority} priority
                    </div>
                  </div>
                </div>

                {/* Photo attachments */}
                <div>
                  <label style={{ display:"block",fontSize:12,fontWeight:600,
                    color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7 }}>
                    Attachments <span style={{ fontSize:10,fontWeight:400 }}>(optional · max 3)</span>
                  </label>
                  <input ref={fileRef} type="file" accept="image/*" multiple
                    onChange={handlePhoto} style={{ display:"none" }}/>
                  <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
                    {preview.map((src,i)=>(
                      <div key={i} style={{ position:"relative",width:70,height:70,
                        borderRadius:10,overflow:"hidden",flexShrink:0 }}>
                        <img src={src} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                        <button type="button" onClick={()=>removePhoto(i)}
                          style={{ position:"absolute",top:2,right:2,width:18,height:18,
                            background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",
                            color:"#fff",fontSize:11,cursor:"pointer",
                            display:"flex",alignItems:"center",justifyContent:"center" }}>
                          ×
                        </button>
                      </div>
                    ))}
                    {preview.length < 3 && (
                      <button type="button" onClick={()=>fileRef.current?.click()}
                        style={{ width:70,height:70,borderRadius:10,
                          border:`2px dashed ${P.border}`,background:"#F9FAFB",
                          cursor:"pointer",display:"flex",flexDirection:"column",
                          alignItems:"center",justifyContent:"center",gap:4,
                          color:P.muted,fontSize:11 }}>
                        <span style={{ fontSize:20 }}>📷</span>
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                style={{ marginTop:24,width:"100%",padding:"13px",
                  background:submitting?"rgba(37,99,235,0.5)":P.primary,
                  border:"none",borderRadius:14,cursor:submitting?"not-allowed":"pointer",
                  fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Inter',sans-serif",
                  boxShadow:submitting?"none":"0 4px 16px rgba(37,99,235,0.35)",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                {submitting?(
                  <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",
                    borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block",
                    animation:"spin .7s linear infinite" }}/>Raising Issue…</>
                ):"🔧 Raise Issue"}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </form>
          </div>
        )}

        {/* ── My Issues History ── */}
        {tab === "history" && (
          <div>
            {loading ? (
              <div style={{ textAlign:"center",padding:"40px",color:P.muted }}>
                <div style={{ fontSize:28,marginBottom:8 }}>⏳</div>
                <div>Loading issues…</div>
              </div>
            ) : issues.length === 0 ? (
              <div style={{ textAlign:"center",padding:"60px",color:P.muted }}>
                <div style={{ fontSize:48,marginBottom:12 }}>🔧</div>
                <div style={{ fontWeight:700,fontSize:15,color:P.text,marginBottom:6 }}>
                  No issues raised yet
                </div>
                <div style={{ fontSize:13 }}>
                  Use the Raise Issue tab to report problems
                </div>
              </div>
            ) : (
              issues.map(issue => <IssueCard key={issue._id} issue={issue}/>)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RaiseIssue;