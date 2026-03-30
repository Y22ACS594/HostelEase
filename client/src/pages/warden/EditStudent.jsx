import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentDetails, updateStudent } from "../../services/wardenService";

if (!document.getElementById("es-font")) {
  const l = document.createElement("link");
  l.id   = "es-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

const P = {
  primary:"#2563EB", surface:"#F8FAFF", border:"#E8EEFF",
  text:"#0F1629", muted:"#6B7A99",
};

const GRADS = [
  ["#667EEA","#764BA2"],["#F093FB","#F5576C"],["#4FACFE","#00F2FE"],
  ["#43E97B","#38F9D7"],["#FA709A","#FEE140"],["#56CCF2","#2F80ED"],
];
const getGrad  = (n="") => GRADS[(n.charCodeAt(0)||0) % GRADS.length];
const initials = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";

/* ── useIsMobile ─────────────────────────────────── */
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn:full?"1 / -1":"auto" }}>
      <label style={{ display:"block",fontSize:12,fontWeight:600,
        color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = (focused) => ({
  width:"100%",padding:"10px 14px",
  border:`1.5px solid ${focused?P.primary:P.border}`,
  borderRadius:12,fontSize:13,fontFamily:"'Sora',sans-serif",
  color:P.text,background:"#fff",outline:"none",
  boxShadow:focused?"0 0 0 3px rgba(37,99,235,0.12)":"none",
  transition:"all .15s",boxSizing:"border-box",
});

function Input({ name, value, onChange, type="text", placeholder }) {
  const [foc,setFoc] = useState(false);
  return (
    <input name={name} value={value} onChange={onChange} type={type}
      placeholder={placeholder} style={inputStyle(foc)}
      onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}/>
  );
}

function Select({ name, value, onChange, children }) {
  const [foc,setFoc] = useState(false);
  return (
    <select name={name} value={value} onChange={onChange}
      style={{...inputStyle(foc),appearance:"none",cursor:"pointer"}}
      onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}>
      {children}
    </select>
  );
}

function Textarea({ name, value, onChange, rows=3 }) {
  const [foc,setFoc] = useState(false);
  return (
    <textarea name={name} value={value} onChange={onChange} rows={rows}
      style={{...inputStyle(foc),resize:"vertical"}}
      onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}/>
  );
}

function Section({ title, icon, children, isMobile }) {
  return (
    <div style={{ background:"#fff",borderRadius:20,
      padding: isMobile ? "18px 16px" : "24px 28px",
      border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",marginBottom:16 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:20 }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <span style={{ fontSize:14,fontWeight:700,color:P.text }}>{title}</span>
      </div>
      <div style={{ display:"grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap:16 }}>
        {children}
      </div>
    </div>
  );
}

const EditStudent = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const fileRef    = useRef(null);
  const isMobile   = useIsMobile();

  const [form, setForm] = useState({
    avatar:"", fullName:"", rollNumber:"", course:"", department:"",
    batch:"", collegeName:"", gender:"", bloodGroup:"", phoneNumber:"",
    fatherName:"", motherName:"", parentContact:"", medicalIssues:"", address:"",
  });
  const [originalAvatar, setOriginalAvatar] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(""); // "saved" | "error"

  useEffect(() => {
    setLoading(true);
    getStudentDetails(id)
      .then(res => {
        const s = res.data.student;
        setForm({
          avatar:        s.avatar        || "",
          fullName:      s.fullName      || "",
          rollNumber:    s.rollNumber    || "",
          course:        s.course        || "",
          department:    s.department    || "",
          batch:         s.batch         || "",
          collegeName:   s.collegeName   || "",
          gender:        s.gender        || "",
          bloodGroup:    s.bloodGroup    || "",
          phoneNumber:   s.phoneNumber   || "",
          fatherName:    s.fatherName    || "",
          motherName:    s.motherName    || "",
          parentContact: s.parentContact || "",
          medicalIssues: s.medicalIssues || "",
          address:       s.address       || "",
        });
        setOriginalAvatar(s.avatar || "");
        setPreview(s.avatar || "");
      })
      .catch(() => { alert("Failed to load student"); navigate("/warden/students"); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ── Photo ── */
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Photo must be under 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      setPreview(b64);
      setForm(f => ({ ...f, avatar: b64 }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPreview("");
    setForm(f => ({ ...f, avatar: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const restorePhoto = () => {
    setPreview(originalAvatar);
    setForm(f => ({ ...f, avatar: originalAvatar }));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setToast("");
    try {
      await updateStudent(id, form);
      setToast("saved");
      setTimeout(() => navigate(`/warden/student/${id}`), 1200);
    } catch {
      setToast("error");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:P.surface,display:"flex",
      alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",color:P.muted }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32,marginBottom:8 }}>⏳</div>
        <div style={{ fontWeight:600 }}>Loading student…</div>
      </div>
    </div>
  );

  const [c1,c2] = getGrad(form.fullName);
  const photoChanged = preview !== originalAvatar;

  return (
    <div style={{ fontFamily:"'Sora',sans-serif",background:P.surface,
      minHeight:"100vh",padding: isMobile ? 16 : 24,color:P.text }}>

      {/* Toast */}
      {toast==="saved" && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:999,
          background:"#D1FAE5",border:"1px solid #6EE7B7",borderRadius:12,
          padding:"12px 20px",color:"#065F46",fontSize:13,fontWeight:700,
          boxShadow:"0 8px 24px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:8 }}>
          ✅ Saved! Redirecting…
        </div>
      )}
      {toast==="error" && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:999,
          background:"#FEE2E2",border:"1px solid #FCA5A5",borderRadius:12,
          padding:"12px 20px",color:"#991B1B",fontSize:13,fontWeight:700,
          boxShadow:"0 8px 24px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:8 }}>
          ❌ Update failed. Try again.
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex",alignItems: isMobile ? "flex-start" : "center",
        justifyContent:"space-between",
        marginBottom:28,flexWrap:"wrap",gap:12,
        flexDirection: isMobile ? "column" : "row" }}>
        <div>
          <div style={{ fontSize:11,fontWeight:600,color:P.primary,
            letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>
            HostelEase · Warden Portal
          </div>
          <h1 style={{ margin:0,fontSize: isMobile ? 20 : 24,fontWeight:700,color:P.text }}>
            ✏️ Edit Student
          </h1>
          <p style={{ margin:"4px 0 0",fontSize:13,color:P.muted }}>
            Update profile for {form.fullName||"student"}
          </p>
        </div>
        <button type="button" onClick={()=>navigate(`/warden/student/${id}`)}
          style={{ padding:"9px 16px",background:"#fff",border:`1px solid ${P.border}`,
            borderRadius:12,cursor:"pointer",fontSize:13,color:P.muted,
            fontFamily:"'Sora',sans-serif",
            alignSelf: isMobile ? "flex-start" : "auto" }}>
          ← Back to Profile
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Profile Photo ── */}
        <div style={{ background:"#fff",borderRadius:20,
          padding: isMobile ? "18px 16px" : "24px 28px",
          border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:20 }}>
            <span style={{ fontSize:18 }}>📸</span>
            <span style={{ fontSize:14,fontWeight:700,color:P.text }}>Profile Photo</span>
            {photoChanged && (
              <span style={{ background:"#FFFBEB",color:"#D97706",fontSize:11,fontWeight:700,
                padding:"3px 8px",borderRadius:20,border:"1px solid #FDE68A" }}>
                Changed
              </span>
            )}
          </div>
          <div style={{ display:"flex",alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 16 : 20,flexWrap:"wrap",
            flexDirection: isMobile ? "column" : "row" }}>
            {/* Current photo */}
            <div style={{ width:90,height:90,borderRadius:20,overflow:"hidden",flexShrink:0,
              background:"#F8FAFF",display:"flex",alignItems:"center",justifyContent:"center",
              border:`2px solid ${photoChanged?P.primary:P.border}`,
              boxShadow:photoChanged?`0 0 0 3px rgba(37,99,235,0.15)`:"none",
              transition:"all .2s" }}>
              {preview ? (
                <img src={preview} alt="avatar"
                  style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
              ) : (
                <div style={{ width:"100%",height:"100%",
                  background:`linear-gradient(135deg,${c1},${c2})`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:26,fontWeight:800,color:"#fff" }}>
                  {initials(form.fullName)}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <input ref={fileRef} type="file" accept="image/*"
                onChange={handlePhoto} style={{ display:"none" }}/>
              <button type="button" onClick={()=>fileRef.current?.click()}
                style={{ padding:"9px 20px",background:P.primary,color:"#fff",border:"none",
                  borderRadius:12,cursor:"pointer",fontFamily:"'Sora',sans-serif",
                  fontWeight:600,fontSize:13,boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
                📁 Change Photo
              </button>
              {preview && (
                <button type="button" onClick={removePhoto}
                  style={{ padding:"9px 20px",background:"#FEF2F2",color:"#DC2626",
                    border:"1.5px solid #FCA5A5",borderRadius:12,cursor:"pointer",
                    fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13 }}>
                  🗑 Remove Photo
                </button>
              )}
              {photoChanged && originalAvatar && (
                <button type="button" onClick={restorePhoto}
                  style={{ padding:"9px 20px",background:"#F1F5F9",color:P.muted,
                    border:`1.5px solid ${P.border}`,borderRadius:12,cursor:"pointer",
                    fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13 }}>
                  ↩ Restore Original
                </button>
              )}
              <div style={{ fontSize:11,color:P.muted }}>JPG, PNG, WebP · max 2 MB</div>
            </div>
          </div>
        </div>

        {/* ── Academic ── */}
        <Section title="Academic Details" icon="🎓" isMobile={isMobile}>
          <Field label="Full Name">
            <Input name="fullName" value={form.fullName} onChange={handleChange}/>
          </Field>
          <Field label="Roll Number">
            <Input name="rollNumber" value={form.rollNumber} onChange={handleChange}/>
          </Field>
          <Field label="Course">
            <Input name="course" value={form.course} onChange={handleChange}/>
          </Field>
          <Field label="Department">
            <Select name="department" value={form.department} onChange={handleChange}>
              <option value="">Select department</option>
              {["CSE","ECE","EEE","MECH","CIVIL","IT","MBA","MCA"].map(d=>(
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Batch">
            <Select name="batch" value={form.batch} onChange={handleChange}>
              <option value="">Select batch</option>
              {["2022-2026","2023-2027","2024-2028","2025-2029"].map(b=>(
                <option key={b}>{b}</option>
              ))}
            </Select>
          </Field>
          <Field label="College Name">
            <Input name="collegeName" value={form.collegeName} onChange={handleChange}/>
          </Field>
        </Section>

        {/* ── Personal ── */}
        <Section title="Personal Details" icon="👤" isMobile={isMobile}>
          <Field label="Gender">
            <Select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </Select>
          </Field>
          <Field label="Blood Group">
            <Select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
              <option value="">Select blood group</option>
              {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g=>(
                <option key={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <Field label="Phone Number">
            <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange}/>
          </Field>
          <Field label="Medical Issues">
            <Input name="medicalIssues" value={form.medicalIssues} onChange={handleChange}/>
          </Field>
        </Section>

        {/* ── Parent ── */}
        <Section title="Parent Details" icon="👨‍👩‍👧" isMobile={isMobile}>
          <Field label="Father Name">
            <Input name="fatherName" value={form.fatherName} onChange={handleChange}/>
          </Field>
          <Field label="Mother Name">
            <Input name="motherName" value={form.motherName} onChange={handleChange}/>
          </Field>
          <Field label="Parent Contact">
            <Input name="parentContact" value={form.parentContact} onChange={handleChange}/>
          </Field>
        </Section>

        {/* ── Address ── */}
        <div style={{ background:"#fff",borderRadius:20,
          padding: isMobile ? "18px 16px" : "24px 28px",
          border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
            <span style={{ fontSize:18 }}>📍</span>
            <span style={{ fontSize:14,fontWeight:700,color:P.text }}>Address</span>
          </div>
          <Textarea name="address" value={form.address} onChange={handleChange} rows={3}/>
        </div>

        {/* ── Buttons ── */}
        <div style={{ display:"flex",justifyContent: isMobile ? "stretch" : "flex-end",
          gap:12,flexDirection: isMobile ? "column" : "row" }}>
          <button type="button" onClick={()=>navigate(`/warden/student/${id}`)}
            style={{ padding:"12px 24px",border:`1.5px solid ${P.border}`,borderRadius:14,
              background:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,
              color:P.muted,fontFamily:"'Sora',sans-serif",
              width: isMobile ? "100%" : "auto" }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ padding:"12px 32px",
              background:saving?"rgba(37,99,235,0.5)":"linear-gradient(135deg,#2563EB,#1D4ED8)",
              border:"none",borderRadius:14,cursor:saving?"not-allowed":"pointer",
              fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Sora',sans-serif",
              boxShadow:saving?"none":"0 6px 20px rgba(37,99,235,0.4)",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              width: isMobile ? "100%" : "auto" }}>
            {saving ? (
              <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",
                borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block",
                animation:"spin .7s linear infinite" }}/>
              Saving…</>
            ) : "✓ Save Changes"}
          </button>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </form>
    </div>
  );
};

export default EditStudent;