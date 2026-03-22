// pages/student/ApplyLeave.jsx
// Landscape full-page layout — sidebar with form + full calendar + live summary
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { applyLeave }  from "../../services/leaveService";
import { useAuth }     from "../../context/AuthContext";

/* ══ Font inject ══ */
if (!document.getElementById("al-font")) {
  const l = document.createElement("link");
  l.id  = "al-font";
  l.rel = "stylesheet";
  l.href= "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

/* ══ CONSTANTS ════════════════════════════════════════ */
const LEAVE_TYPES = [
  { v:"Casual",    label:"Casual Leave",    color:"#2563EB", bg:"#EFF6FF", icon:"🏖️", desc:"Personal time off for non-medical reasons" },
  { v:"Medical",   label:"Medical Leave",   color:"#DC2626", bg:"#FEF2F2", icon:"🏥", desc:"Health-related absence with medical support" },
  { v:"Emergency", label:"Emergency Leave", color:"#D97706", bg:"#FEF9C3", icon:"⚡", desc:"Urgent unforeseen personal situations" },
  { v:"Home",      label:"Home Leave",      color:"#059669", bg:"#ECFDF5", icon:"🏠", desc:"Visiting family or home town" },
  { v:"Event",     label:"Event Leave",     color:"#7C3AED", bg:"#F5F3FF", icon:"🎓", desc:"Academic events, competitions or conferences" },
];

const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MOS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_H   = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const DAYSF   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const calcDays  = (f,t) => { if(!f||!t) return 0; const d=Math.ceil((new Date(t)-new Date(f))/86400000)+1; return d<0?0:d; };
const toISO     = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const fmtFull   = (iso) => { if(!iso) return "—"; const d=new Date(iso+"T00:00:00"); return `${DAYSF[d.getDay()]}, ${d.getDate()} ${MOS[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort  = (iso) => { if(!iso) return ""; const d=new Date(iso+"T00:00:00"); return `${d.getDate()} ${MOS[d.getMonth()]}`; };
const monFirst  = (d) => (d.getDay()+6)%7;
const isoToDate = (iso) => iso ? new Date(iso+"T00:00:00") : null;

/* ══ PALETTE ══════════════════════════════════════════ */
const C = { primary:"#2563EB", surface:"#F8FAFF", border:"#E8EEFF", text:"#0F1629", muted:"#6B7A99" };

/* ══ SVG ICONS ════════════════════════════════════════ */
const IcoChev = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoArrow= () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoBack = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>;
const IcoCal  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoPin  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoClock= () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoPhone= () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.86 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoCheck= () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoDoc  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;

/* ══ FOCUSED INPUT — defined OUTSIDE main component to prevent remount on re-render ══ */
const inputBaseStyle = (focused, hasError) => ({
  width:"100%", padding:"11px 14px",
  border:`1.5px solid ${hasError ? "#DC2626" : focused ? C.primary : "#E5E7EB"}`,
  borderRadius:11, fontSize:13, fontFamily:"'Sora',sans-serif",
  color:C.text, background:"#fff", outline:"none",
  boxShadow: hasError
    ? "0 0 0 3px rgba(220,38,38,.10)"
    : focused ? "0 0 0 3px rgba(37,99,235,.10)" : "none",
  transition:"border-color .14s,box-shadow .14s", boxSizing:"border-box",
});

function FocusInput({ value, onChange, type="text", placeholder, required, multiline, rows, hasError }) {
  const [foc, setFoc] = useState(false);
  const s = inputBaseStyle(foc, hasError);
  if (multiline) return (
    <textarea value={value} onChange={onChange} rows={rows||4} required={required}
      placeholder={placeholder}
      onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
      style={{...s, resize:"vertical", minHeight:90}}/>
  );
  return (
    <input type={type} value={value} onChange={onChange} required={required}
      placeholder={placeholder}
      onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={s}/>
  );
}

/* ══ FIELD WRAPPER — defined OUTSIDE main component ══ */
function Field({ icon: Icon, label, children, required }) {
  return (
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,
        color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>
        {Icon && <Icon/>}{label}{required && <span style={{color:"#DC2626"}}>*</span>}
      </div>
      {children}
    </div>
  );
}

/* ══ RANGE CALENDAR ═══════════════════════════════════ */
function RangeCalendar({ from, to, onChange }) {
  const seed = from ? new Date(from+"T00:00:00") : new Date();
  const [yr,setYr] = useState(seed.getFullYear());
  const [mo,setMo] = useState(seed.getMonth());
  const [hov,setHov] = useState(null);

  const fromD = isoToDate(from), toD = isoToDate(to);
  const today = new Date(); today.setHours(0,0,0,0);
  const totalD = new Date(yr,mo+1,0).getDate();
  const offset = monFirst(new Date(yr,mo,1));
  const cells  = Array(offset).fill(null).concat(Array.from({length:totalD},(_,i)=>i+1));

  const prev = () => mo===0?(setMo(11),setYr(y=>y-1)):setMo(m=>m-1);
  const next = () => mo===11?(setMo(0),setYr(y=>y+1)):setMo(m=>m+1);

  const click = (d) => {
    const iso  = toISO(yr,mo,d);
    const date = new Date(yr,mo,d);
    if (date<today) return;
    if (!from||(from&&to)) { onChange(iso,""); }
    else {
      const cd = new Date(iso+"T00:00:00");
      onChange(cd<fromD?iso:from, cd<fromD?"":iso);
    }
  };

  const inRange = (d) => {
    const date = new Date(yr,mo,d);
    const end  = hov?new Date(hov+"T00:00:00"):toD;
    return fromD&&end ? date>fromD&&date<end : false;
  };

  const isFrom  = (d) => fromD && new Date(yr,mo,d).toDateString()===fromD.toDateString();
  const isTo    = (d) => toD   && new Date(yr,mo,d).toDateString()===toD.toDateString();
  const isPast  = (d) => new Date(yr,mo,d)<today;
  const isToday = (d) => new Date(yr,mo,d).toDateString()===today.toDateString();
  const isHov   = (d) => hov&&!to&&from&&new Date(yr,mo,d).toDateString()===new Date(hov+"T00:00:00").toDateString();
  const isSat   = (d) => new Date(yr,mo,d).getDay()===6;
  const isSun   = (d) => new Date(yr,mo,d).getDay()===0;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button type="button" onClick={prev}
          style={{width:32,height:32,borderRadius:9,border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:16,
            transition:"border-color .13s"}}>‹</button>
        <span style={{fontSize:16,fontWeight:700,color:C.text}}>{MONTHS[mo]} {yr}</span>
        <button type="button" onClick={next}
          style={{width:32,height:32,borderRadius:9,border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:16,
            transition:"border-color .13s"}}>›</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAY_H.map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,
            color:d==="SAT"||d==="SUN"?"#9CA3AF":"#6B7280",
            padding:"4px 0",textTransform:"uppercase",letterSpacing:".04em"}}>
            {d}
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((d,i)=>{
          if (!d) return <div key={i}/>;
          const from_  = isFrom(d), to_  = isTo(d);
          const range_ = inRange(d), hov_ = isHov(d);
          const past_  = isPast(d), today_= isToday(d);
          const wknd_  = isSat(d)||isSun(d);

          let bg = "transparent", color = wknd_?"#9CA3AF":"#374151", br = "9px";
          let cursor = past_?"default":"pointer";
          if (past_)  { color="#D1D5DB"; }
          if (today_) { color=C.primary; }
          if (range_||hov_) { bg="#DBEAFE"; color="#1D4ED8"; br="0"; }
          if (from_) { bg=C.primary; color="#fff"; br="9px 0 0 9px"; }
          if (to_)   { bg=C.primary; color="#fff"; br="0 9px 9px 0"; }
          if (from_&&to_&&from===to) { bg=C.primary; color="#fff"; br="9px"; }

          return (
            <div key={i}
              onClick={()=>!past_&&click(d)}
              onMouseEnter={()=>{ if(from&&!to) setHov(toISO(yr,mo,d)); }}
              onMouseLeave={()=>setHov(null)}
              style={{textAlign:"center",padding:"9px 4px",fontSize:14,fontWeight:from_||to_?700:isToday(d)?800:500,
                background:bg,color,borderRadius:br,cursor,
                transition:"background .1s,color .1s",userSelect:"none",lineHeight:1.2}}>
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══ VALIDATION HELPERS ═══════════════════════════════ */
const validatePhone = (v) => /^\d{10}$/.test(v.trim());

/* ══ MAIN COMPONENT ═══════════════════════════════════ */
export default function ApplyLeave() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    leaveType:"Casual", fromDate:"", toDate:"",
    destination:"", reason:"", emergencyContact:""
  });
  const [submitting, setSubmitting] = useState(false);
  const [status,     setStatus]     = useState(null); // {t, m}
  const [step,       setStep]       = useState(1);
  const [touched,    setTouched]    = useState({}); // track which fields were touched

  const days     = calcDays(form.fromDate, form.toDate);
  const typeInfo = LEAVE_TYPES.find(t=>t.v===form.leaveType)||LEAVE_TYPES[0];
  const name     = user?.name||"Student";

  const set = useCallback((k, v) => {
    setForm(f => ({...f, [k]: v}));
    setStatus(null);
  }, []);

  const touch = useCallback((k) => {
    setTouched(t => ({...t, [k]: true}));
  }, []);

  /* ── phone: only allow digits, max 10 ── */
  const handlePhoneChange = useCallback((e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    set("emergencyContact", raw);
  }, [set]);

  /* ── field-level errors ── */
  const errors = {
    destination: touched.destination && !form.destination.trim()
      ? "Destination is required" : null,
    reason: touched.reason && form.reason.length < 10
      ? `Minimum 10 characters (${form.reason.length} entered)` : null,
    emergencyContact: touched.emergencyContact && !validatePhone(form.emergencyContact)
      ? form.emergencyContact.length === 0
        ? "Emergency contact is required"
        : "Must be exactly 10 digits"
      : null,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields to show errors
    setTouched({ destination:true, reason:true, emergencyContact:true });

    if (!days)                          { setStatus({t:"error",m:"Please select a date range on the calendar."}); return; }
    if (!form.destination.trim())       { setStatus({t:"error",m:"Please enter your destination."}); return; }
    if (form.reason.length < 10)        { setStatus({t:"error",m:"Reason must be at least 10 characters."}); return; }
    if (!validatePhone(form.emergencyContact)) { setStatus({t:"error",m:"Emergency contact must be exactly 10 digits."}); return; }

    setSubmitting(true); setStatus(null);
    try {
      await applyLeave({ ...form, totalDays: days });
      setStatus({t:"success", m:`✅ Leave request submitted! ${days} day${days>1?"s":""} of ${typeInfo.label}.`});
      setForm({ leaveType:"Casual", fromDate:"", toDate:"", destination:"", reason:"", emergencyContact:"" });
      setTouched({});
      setStep(1);
    } catch(err) {
      setStatus({t:"error", m:err?.response?.data?.message||"Failed to submit. Please try again."});
    } finally { setSubmitting(false); }
  };

  const canProceed = form.fromDate && form.toDate && days > 0;

  /* summary day breakdown */
  const dayRows = () => {
    if (!form.fromDate||!form.toDate) return [];
    const rows=[]; let cur=new Date(form.fromDate+"T00:00:00");
    const end=new Date(form.toDate+"T00:00:00");
    while(cur<=end&&rows.length<5){
      const wk=cur.getDay()===0||cur.getDay()===6;
      rows.push({label:`${DAYSF[cur.getDay()]}, ${cur.getDate()} ${MOS[cur.getMonth()]}`,wk});
      cur.setDate(cur.getDate()+1);
    }
    if(days>5) rows.push({label:`+ ${days-5} more days`,extra:true});
    return rows;
  };

  return (
    <div style={{fontFamily:"'Sora',sans-serif",minHeight:"100vh",background:C.surface,color:C.text}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder,textarea::placeholder{color:#9CA3AF;font-size:13px}
        @keyframes al-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes al-spin{to{transform:rotate(360deg)}}
        .al-spin{width:12px;height:12px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:al-spin .7s linear infinite;display:inline-block}
        .al-type-card{transition:all .18s;cursor:pointer}
        .al-type-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.1)!important}
      `}</style>

      {/* ════ TOPBAR ════════════════════════════════════ */}
      <div style={{background:"#fff",borderBottom:`1px solid ${C.border}`,
        height:54,display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 28px",boxShadow:"0 1px 4px rgba(37,99,235,.04)"}}>

        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={()=>navigate("/student/dashboard")}
            style={{display:"flex",alignItems:"center",gap:7,padding:"7px 12px",
              background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,
              cursor:"pointer",fontSize:13,fontWeight:600,color:C.muted,
              fontFamily:"'Sora',sans-serif",transition:"all .13s"}}>
            <IcoBack/> Back
          </button>
          <div style={{width:1,height:20,background:C.border}}/>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:C.text}}>Apply for Leave</div>
            <div style={{fontSize:11,color:C.muted,marginTop:1}}>HostelEase · Student Portal</div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {[{n:1,l:"Select Type & Dates"},{n:2,l:"Leave Details"}].map(({n,l})=>(
            <div key={n} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:26,height:26,borderRadius:"50%",
                background:step>=n?C.primary:"#E5E7EB",
                color:step>=n?"#fff":"#9CA3AF",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:700,
                boxShadow:step>=n?"0 2px 8px rgba(37,99,235,.3)":"none",
                transition:"all .2s"}}>
                {step>n ? <IcoCheck/> : n}
              </div>
              <span style={{fontSize:12,fontWeight:step===n?700:500,
                color:step===n?C.primary:step>n?"#059669":C.muted}}>
                {l}
              </span>
              {n<2&&<div style={{width:24,height:2,background:step>1?"#059669":C.border,borderRadius:1,margin:"0 4px",transition:"background .3s"}}/>}
            </div>
          ))}
        </div>

        {/* Name pill */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px 6px 6px",
          background:C.surface,border:`1px solid ${C.border}`,borderRadius:100}}>
          <div style={{width:28,height:28,borderRadius:"50%",
            background:"linear-gradient(135deg,#2563EB,#7C3AED)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:12,fontWeight:800,color:"#fff"}}>
            {name.charAt(0).toUpperCase()}
          </div>
          <span style={{fontSize:12,fontWeight:600,color:C.text}}>{name}</span>
        </div>
      </div>

      {/* ════ BODY ══════════════════════════════════════ */}
      <div style={{display:"flex",height:"calc(100vh - 54px)",overflow:"hidden"}}>

        {/* ── LEFT PANEL (40%) ── */}
        <div style={{width:"40%",borderRight:`1px solid ${C.border}`,
          background:"#fff",overflowY:"auto",padding:"28px 28px 40px"}}>

          {/* Step 1 */}
          {step===1 && (
            <div style={{animation:"al-fade .3s ease"}}>
              <div style={{fontSize:13,fontWeight:700,color:C.muted,
                textTransform:"uppercase",letterSpacing:".08em",marginBottom:16}}>
                Step 1 — Choose Leave Type
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {LEAVE_TYPES.map(t=>(
                  <div key={t.v} className="al-type-card"
                    onClick={()=>set("leaveType",t.v)}
                    style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",
                      borderRadius:14,border:`2px solid ${form.leaveType===t.v?t.color:C.border}`,
                      background:form.leaveType===t.v?t.bg:"#fff",
                      boxShadow:form.leaveType===t.v?`0 4px 14px ${t.color}20`:"0 1px 4px rgba(0,0,0,.04)"}}>
                    <div style={{width:44,height:44,borderRadius:12,flexShrink:0,
                      background:form.leaveType===t.v?`${t.color}18`:"#F8FAFF",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                      {t.icon}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,
                        color:form.leaveType===t.v?t.color:C.text}}>
                        {t.label}
                      </div>
                      <div style={{fontSize:11,color:C.muted,marginTop:3,lineHeight:1.4}}>
                        {t.desc}
                      </div>
                    </div>
                    {form.leaveType===t.v && (
                      <div style={{width:20,height:20,borderRadius:"50%",
                        background:t.color,flexShrink:0,
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <IcoCheck/>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={()=>canProceed&&setStep(2)}
                disabled={!canProceed}
                style={{marginTop:24,width:"100%",padding:"13px",
                  background:canProceed?C.primary:"#E5E7EB",
                  color:canProceed?"#fff":"#9CA3AF",border:"none",borderRadius:12,
                  fontSize:14,fontWeight:700,cursor:canProceed?"pointer":"not-allowed",
                  fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",
                  justifyContent:"center",gap:8,transition:"all .2s",
                  boxShadow:canProceed?"0 4px 14px rgba(37,99,235,.3)":"none"}}>
                {canProceed ? <><span>Continue to Details</span><IcoArrow/></> : "Select dates to continue"}
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step===2 && (
            <div style={{animation:"al-fade .3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                <button onClick={()=>setStep(1)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"6px 10px",
                    background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,
                    cursor:"pointer",fontSize:12,fontWeight:600,color:C.muted,
                    fontFamily:"'Sora',sans-serif"}}>
                  <IcoBack/> Back
                </button>
                <div style={{fontSize:13,fontWeight:700,color:C.muted,
                  textTransform:"uppercase",letterSpacing:".08em"}}>
                  Step 2 — Leave Details
                </div>
              </div>

              {/* Recap chips */}
              <div style={{display:"flex",gap:10,marginBottom:22}}>
                <div style={{flex:1,padding:"12px 14px",borderRadius:12,
                  background:typeInfo.bg,border:`1px solid ${typeInfo.color}33`}}>
                  <div style={{fontSize:11,color:typeInfo.color,fontWeight:700,marginBottom:3}}>Leave Type</div>
                  <div style={{fontSize:14,fontWeight:700,color:typeInfo.color}}>
                    {typeInfo.icon} {typeInfo.label}
                  </div>
                </div>
                {days>0 && (
                  <div style={{flex:1,padding:"12px 14px",borderRadius:12,
                    background:"#EFF6FF",border:"1px solid #BFDBFE"}}>
                    <div style={{fontSize:11,color:C.primary,fontWeight:700,marginBottom:3}}>Duration</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.primary}}>
                      📅 {days} day{days>1?"s":""}
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} noValidate>

                {/* Destination */}
                <Field icon={IcoPin} label="Destination" required>
                  <FocusInput
                    value={form.destination}
                    required
                    hasError={!!errors.destination}
                    onChange={e => set("destination", e.target.value)}
                    onBlur={() => touch("destination")}
                    placeholder="Where are you going?"
                  />
                  {errors.destination && (
                    <div style={{fontSize:11,color:"#DC2626",marginTop:5,fontWeight:500}}>
                      ⚠ {errors.destination}
                    </div>
                  )}
                </Field>

                {/* Reason */}
                <Field icon={IcoDoc} label="Reason for Leave" required>
                  <FocusInput
                    value={form.reason}
                    multiline rows={4}
                    required
                    hasError={!!errors.reason}
                    onChange={e => set("reason", e.target.value)}
                    onBlur={() => touch("reason")}
                    placeholder="Include details for your approver — the more context you provide, the faster your request gets reviewed…"
                  />
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                    {errors.reason
                      ? <span style={{fontSize:11,color:"#DC2626",fontWeight:500}}>⚠ {errors.reason}</span>
                      : <span style={{fontSize:10,color:C.muted}}>Minimum 10 characters</span>
                    }
                    <span style={{fontSize:10,
                      color: form.reason.length > 0 && form.reason.length < 10 ? "#DC2626" : form.reason.length >= 10 ? "#059669" : C.muted,
                      fontWeight:600}}>
                      {form.reason.length} chars
                    </span>
                  </div>
                </Field>

                {/* Emergency Contact */}
                <Field icon={IcoPhone} label="Emergency Contact" required>
                  <FocusInput
                    value={form.emergencyContact}
                    type="tel"
                    required
                    hasError={!!errors.emergencyContact}
                    onChange={handlePhoneChange}
                    onBlur={() => touch("emergencyContact")}
                    placeholder="10-digit mobile number"
                  />
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                    {errors.emergencyContact
                      ? <span style={{fontSize:11,color:"#DC2626",fontWeight:500}}>⚠ {errors.emergencyContact}</span>
                      : <span style={{fontSize:10,color:C.muted}}>Parent / Guardian — exactly 10 digits</span>
                    }
                    <span style={{fontSize:10,
                      color: form.emergencyContact.length === 10 ? "#059669"
                           : form.emergencyContact.length > 0  ? "#D97706" : C.muted,
                      fontWeight:600}}>
                      {form.emergencyContact.length}/10
                    </span>
                  </div>
                  {/* digit progress bar */}
                  <div style={{marginTop:6,height:3,borderRadius:3,background:"#E5E7EB",overflow:"hidden"}}>
                    <div style={{
                      height:"100%",borderRadius:3,
                      width:`${(form.emergencyContact.length/10)*100}%`,
                      background: form.emergencyContact.length===10 ? "#059669"
                                : form.emergencyContact.length>=6  ? "#D97706" : C.primary,
                      transition:"width .2s,background .2s"
                    }}/>
                  </div>
                </Field>

                {/* Status message */}
                {status && (
                  <div style={{padding:"11px 14px",borderRadius:11,marginBottom:16,
                    fontSize:13,fontWeight:500,lineHeight:1.5,
                    background:status.t==="success"?"#ECFDF5":"#FEF2F2",
                    border:`1px solid ${status.t==="success"?"#6EE7B7":"#FECACA"}`,
                    color:status.t==="success"?"#065F46":"#991B1B"}}>
                    {status.m}
                  </div>
                )}

                {/* Submit button (Save Draft removed) */}
                <button type="submit" disabled={submitting}
                  style={{width:"100%",padding:"13px",
                    background:submitting?"rgba(37,99,235,.5)":C.primary,
                    border:"none",borderRadius:11,fontSize:14,fontWeight:700,
                    color:"#fff",cursor:submitting?"not-allowed":"pointer",
                    fontFamily:"'Sora',sans-serif",display:"flex",
                    alignItems:"center",justifyContent:"center",gap:8,
                    boxShadow:"0 4px 16px rgba(37,99,235,.30)",transition:"all .14s"}}>
                  {submitting
                    ? <><span className="al-spin"/>Submitting…</>
                    : status?.t==="success"
                      ? <>✓ Submitted!</>
                      : <>Submit Leave Request <IcoArrow/></>}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── MIDDLE PANEL (36%) — Calendar ── */}
        <div style={{width:"36%",background:"#FAFBFF",borderRight:`1px solid ${C.border}`,
          padding:"28px 24px",overflowY:"auto"}}>

          <div style={{fontSize:11,fontWeight:700,color:C.muted,
            textTransform:"uppercase",letterSpacing:".08em",marginBottom:16}}>
            Select Date Range
          </div>

          <RangeCalendar
            from={form.fromDate}
            to={form.toDate}
            onChange={(f,t)=>{ set("fromDate",f); set("toDate",t); }}
          />

          {days>0 && (
            <div style={{marginTop:16,padding:"12px 16px",borderRadius:12,
              display:"flex",alignItems:"center",gap:8,
              background:typeInfo.bg,border:`1px solid ${typeInfo.color}44`,
              animation:"al-fade .25s ease"}}>
              <span style={{fontSize:20}}>{typeInfo.icon}</span>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:typeInfo.color}}>
                  {days} day{days>1?"s":""} selected
                </div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                  {fmtFull(form.fromDate)} → {fmtShort(form.toDate)}
                </div>
              </div>
            </div>
          )}

          {!form.fromDate && (
            <div style={{marginTop:16,padding:"12px 14px",borderRadius:10,
              background:"#F8FAFF",border:`1px solid ${C.border}`,
              fontSize:12,color:C.muted,lineHeight:1.6}}>
              <strong style={{color:C.text,display:"block",marginBottom:4}}>How to select dates:</strong>
              1. Click a start date<br/>
              2. Click an end date to select the range<br/>
              3. Click any date to reset and start over
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL (24%) — Summary ── */}
        <div style={{width:"24%",background:"#fff",padding:"28px 20px",overflowY:"auto"}}>

          <div style={{fontSize:11,fontWeight:700,color:C.muted,
            textTransform:"uppercase",letterSpacing:".08em",marginBottom:16}}>
            Request Summary
          </div>

          <div style={{padding:"14px 16px",borderRadius:14,marginBottom:16,
            background:typeInfo.bg,border:`1px solid ${typeInfo.color}33`}}>
            <div style={{fontSize:11,color:typeInfo.color,fontWeight:600,marginBottom:6}}>Leave Type</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:22}}>{typeInfo.icon}</span>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:typeInfo.color}}>{typeInfo.label}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.4}}>{typeInfo.desc}</div>
              </div>
            </div>
          </div>

          {days>0 ? (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>
                Duration
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                <div style={{padding:"10px 12px",borderRadius:11,
                  background:C.surface,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:3}}>From</div>
                  <div style={{fontSize:12,fontWeight:700,color:C.text}}>{fmtShort(form.fromDate)}</div>
                </div>
                <div style={{padding:"10px 12px",borderRadius:11,
                  background:C.surface,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:3}}>To</div>
                  <div style={{fontSize:12,fontWeight:700,color:C.text}}>{fmtShort(form.toDate)||"—"}</div>
                </div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {dayRows().map((r,i)=>(
                  r.extra ? (
                    <div key={i} style={{textAlign:"center",padding:"6px",
                      background:"#F0F5FF",borderRadius:8,border:"1px solid #BFDBFE",
                      fontSize:11,fontWeight:600,color:C.primary}}>
                      {r.label}
                    </div>
                  ) : (
                    <div key={i} style={{display:"flex",alignItems:"center",
                      justifyContent:"space-between",padding:"7px 10px",
                      background:r.wk?"#F9FAFB":C.surface,
                      border:`1px solid ${C.border}`,borderRadius:9}}>
                      <span style={{fontSize:11,fontWeight:600,
                        color:r.wk?C.muted:C.text}}>{r.label}</span>
                      <span style={{fontSize:10,fontWeight:700,
                        color:r.wk?"#9CA3AF":C.primary,
                        background:r.wk?"#F3F4F6":"#EFF6FF",
                        padding:"2px 7px",borderRadius:100}}>
                        {r.wk?"Off":"Working"}
                      </span>
                    </div>
                  )
                ))}
              </div>

              <div style={{marginTop:10,padding:"11px 14px",borderRadius:11,
                textAlign:"center",
                background:typeInfo.bg,border:`1px solid ${typeInfo.color}33`,
                fontSize:14,fontWeight:800,color:typeInfo.color}}>
                {days} day{days>1?"s":""} of {typeInfo.label}
              </div>
            </div>
          ) : (
            <div style={{padding:"24px 0",textAlign:"center",color:C.muted}}>
              <div style={{fontSize:28,marginBottom:8}}>📅</div>
              <div style={{fontSize:12,lineHeight:1.5}}>
                Select dates on the calendar to see your leave breakdown
              </div>
            </div>
          )}

          {step===2 && (form.destination||form.reason||form.emergencyContact) && (
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>
                Details
              </div>
              {form.destination && (
                <div style={{marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,
                    fontSize:10,fontWeight:700,color:C.muted,marginBottom:4}}>
                    <IcoPin/>DESTINATION
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{form.destination}</div>
                </div>
              )}
              {form.reason && (
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:4}}>REASON</div>
                  <div style={{fontSize:12,color:"#374151",lineHeight:1.5,
                    background:C.surface,padding:"8px 10px",borderRadius:8,
                    border:`1px solid ${C.border}`}}>
                    {form.reason.slice(0,80)}{form.reason.length>80?"…":""}
                  </div>
                </div>
              )}
              {form.emergencyContact && (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:4,
                    fontSize:10,fontWeight:700,color:C.muted,marginBottom:4}}>
                    <IcoPhone/>EMERGENCY CONTACT
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,
                      fontFamily:"monospace,sans-serif",letterSpacing:".05em"}}>
                      {form.emergencyContact}
                    </div>
                    {validatePhone(form.emergencyContact) && (
                      <div style={{width:16,height:16,borderRadius:"50%",
                        background:"#059669",display:"flex",alignItems:"center",
                        justifyContent:"center"}}>
                        <IcoCheck/>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}