import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

if (!document.getElementById("as-font")) {
  const l = document.createElement("link");
  l.id   = "as-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

const P = {
  primary:"#2563EB", surface:"#F8FAFF", border:"#E8EEFF",
  text:"#0F1629", muted:"#6B7A99",
};

const initial = {
  avatar:"", fullName:"", email:"", password:"", rollNumber:"",
  course:"", department:"", batch:"", collegeName:"",
  gender:"", dateOfBirth:"", bloodGroup:"", phoneNumber:"",
  aadhaarNumber:"", medicalIssues:"None",
  fatherName:"", motherName:"", parentContact:"",
  address:"",
};

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

/* ── Reusable Field components ─────────────────── */
function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ display:"block",fontSize:12,fontWeight:600,
        color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em",
        marginBottom:7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = (focused) => ({
  width:"100%", padding:"10px 14px",
  border:`1.5px solid ${focused?P.primary:P.border}`,
  borderRadius:12, fontSize:13, fontFamily:"'Sora',sans-serif",
  color:P.text, background:"#fff", outline:"none",
  boxShadow: focused?"0 0 0 3px rgba(37,99,235,0.12)":"none",
  transition:"all .15s", boxSizing:"border-box",
});

function Input({ name, value, onChange, type="text", placeholder, required }) {
  const [foc, setFoc] = useState(false);
  return (
    <input name={name} value={value} onChange={onChange} type={type}
      placeholder={placeholder} required={required}
      style={inputStyle(foc)}
      onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}/>
  );
}

function Select({ name, value, onChange, children }) {
  const [foc, setFoc] = useState(false);
  return (
    <select name={name} value={value} onChange={onChange}
      style={{ ...inputStyle(foc), appearance:"none",cursor:"pointer" }}
      onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}>
      {children}
    </select>
  );
}

function Textarea({ name, value, onChange, rows=3 }) {
  const [foc, setFoc] = useState(false);
  return (
    <textarea name={name} value={value} onChange={onChange} rows={rows}
      style={{ ...inputStyle(foc),resize:"vertical" }}
      onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}/>
  );
}

function Section({ title, icon, children, isMobile }) {
  return (
    <div style={{ background:"#fff",borderRadius:20,padding: isMobile ? "18px 16px" : "24px 28px",
      border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
      marginBottom:16 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:20 }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <span style={{ fontSize:14,fontWeight:700,color:P.text }}>{title}</span>
      </div>
      <div style={{ display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap:16 }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const AddStudent = () => {
  const navigate = useNavigate();
  const fileRef  = useRef(null);
  const isMobile = useIsMobile();
  const [form,    setForm]    = useState(initial);
  const [msg,     setMsg]     = useState(""); // "success" | "error" | ""
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(""); // base64 preview

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ── Photo upload ── */
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Photo must be under 2 MB"); return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      setForm(f => ({ ...f, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPreview("");
    setForm(f => ({ ...f, avatar: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      await api.post("/warden/students", form);
      setMsg("success");
      setForm(initial);
      setPreview("");
    } catch (err) {
      setMsg(err.response?.data?.message || "error");
    } finally {
      setLoading(false);
    }
  };

  const initials = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";

  return (
    <div style={{ fontFamily:"'Sora',sans-serif",background:P.surface,
      minHeight:"100vh",padding: isMobile ? 16 : 24,color:P.text }}>

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
            👩‍🎓 Add New Student
          </h1>
          <p style={{ margin:"4px 0 0",fontSize:13,color:P.muted }}>
            Register a new student into the hostel system
          </p>
        </div>
        <button type="button" onClick={()=>navigate("/warden/students")}
          style={{ padding:"9px 16px",background:"#fff",border:`1px solid ${P.border}`,
            borderRadius:12,cursor:"pointer",fontSize:13,color:P.muted,
            fontFamily:"'Sora',sans-serif", alignSelf: isMobile ? "flex-start" : "auto" }}>
          ← Back to List
        </button>
      </div>

      {/* Success / Error banner */}
      {msg === "success" && (
        <div style={{ background:"#D1FAE5",border:"1px solid #6EE7B7",borderRadius:12,
          padding:"12px 18px",marginBottom:20,color:"#065F46",fontSize:13,fontWeight:600,
          display:"flex",alignItems:"center",gap:8 }}>
          ✅ Student registered successfully!
          <button onClick={()=>setMsg("")}
            style={{ marginLeft:"auto",background:"none",border:"none",
              cursor:"pointer",color:"#065F46",fontSize:16,lineHeight:1 }}>×</button>
        </div>
      )}
      {msg && msg !== "success" && (
        <div style={{ background:"#FEE2E2",border:"1px solid #FCA5A5",borderRadius:12,
          padding:"12px 18px",marginBottom:20,color:"#991B1B",fontSize:13,fontWeight:600,
          display:"flex",alignItems:"center",gap:8 }}>
          ❌ {msg === "error" ? "Failed to register student. Please try again." : msg}
          <button onClick={()=>setMsg("")}
            style={{ marginLeft:"auto",background:"none",border:"none",
              cursor:"pointer",color:"#991B1B",fontSize:16,lineHeight:1 }}>×</button>
        </div>
      )}

      <form onSubmit={submit}>

        {/* ── Profile Photo ── */}
        <div style={{ background:"#fff",borderRadius:20,padding: isMobile ? "18px 16px" : "24px 28px",
          border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
          marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:20 }}>
            <span style={{ fontSize:18 }}>📸</span>
            <span style={{ fontSize:14,fontWeight:700,color:P.text }}>Profile Photo</span>
            <span style={{ fontSize:12,color:P.muted,marginLeft:4 }}>Optional · max 2 MB</span>
          </div>
          <div style={{ display:"flex",alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 16 : 20, flexDirection: isMobile ? "column" : "row" }}>
            {/* Preview */}
            <div style={{ width:90,height:90,borderRadius:20,overflow:"hidden",
              border:`2px dashed ${P.border}`,flexShrink:0,
              background:"#F8FAFF",display:"flex",alignItems:"center",
              justifyContent:"center",position:"relative" }}>
              {preview ? (
                <img src={preview} alt="preview"
                  style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
              ) : (
                <div style={{ textAlign:"center",color:P.muted }}>
                  <div style={{ fontSize:28,marginBottom:4 }}>👤</div>
                  <div style={{ fontSize:10 }}>No photo</div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <input ref={fileRef} type="file" accept="image/*"
                onChange={handlePhoto} style={{ display:"none" }}/>
              <button type="button" onClick={()=>fileRef.current?.click()}
                style={{ padding:"9px 20px",background:P.primary,color:"#fff",
                  border:"none",borderRadius:12,cursor:"pointer",
                  fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13,
                  boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
                📁 Upload from Gallery
              </button>
              {preview && (
                <button type="button" onClick={removePhoto}
                  style={{ padding:"9px 20px",background:"#FEF2F2",color:"#DC2626",
                    border:"1.5px solid #FCA5A5",borderRadius:12,cursor:"pointer",
                    fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13 }}>
                  🗑 Remove Photo
                </button>
              )}
              <div style={{ fontSize:11,color:P.muted }}>
                JPG, PNG, WebP supported
              </div>
            </div>

            {/* Name preview if form has name */}
            {form.fullName && !preview && (
              <div style={{ width:90,height:90,borderRadius:20,
                background:"linear-gradient(135deg,#2563EB,#7C3AED)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:26,fontWeight:800,color:"#fff",flexShrink:0,
                boxShadow:"0 8px 20px rgba(37,99,235,0.3)" }}>
                {initials(form.fullName)}
              </div>
            )}
          </div>
        </div>

        {/* ── Basic Info ── */}
        <Section title="Basic Information" icon="📋" isMobile={isMobile}>
          <Field label="Full Name *">
            <Input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="e.g. T Durga"/>
          </Field>
          <Field label="Email *">
            <Input name="email" value={form.email} onChange={handleChange} type="email" required placeholder="student@college.edu"/>
          </Field>
          <Field label="Temporary Password *">
            <Input name="password" value={form.password} onChange={handleChange} type="password" required placeholder="Min 8 characters"/>
          </Field>
          <Field label="Roll Number *">
            <Input name="rollNumber" value={form.rollNumber} onChange={handleChange} required placeholder="e.g. 22CS001"/>
          </Field>
        </Section>

        {/* ── Academic ── */}
        <Section title="Academic Details" icon="🎓" isMobile={isMobile}>
          <Field label="Course">
            <Input name="course" value={form.course} onChange={handleChange} placeholder="e.g. B.Tech"/>
          </Field>
          <Field label="Department">
            <Select name="department" value={form.department} onChange={handleChange}>
              <option value="">Select department</option>
              {["CSE","ECE","EEE","MECH","CIVIL","IT","MBA","MCA"].map(d=>(
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Batch *">
            <Select name="batch" value={form.batch} onChange={handleChange}>
              <option value="">Select batch</option>
              {["2022-2026","2023-2027","2024-2028","2025-2029"].map(b=>(
                <option key={b}>{b}</option>
              ))}
            </Select>
          </Field>
          <Field label="College Name">
            <Input name="collegeName" value={form.collegeName} onChange={handleChange} placeholder="e.g. JNTU College of Engineering"/>
          </Field>
        </Section>

        {/* ── Personal ── */}
        <Section title="Personal Details" icon="👤" isMobile={isMobile}>
          <Field label="Gender">
            <Select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field label="Date of Birth">
            <Input name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} type="date"/>
          </Field>
          <Field label="Blood Group">
            <Select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
              <option value="">Select blood group</option>
              {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g=>(
                <option key={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <Field label="Medical Issues">
            <Input name="medicalIssues" value={form.medicalIssues} onChange={handleChange} placeholder="None or describe"/>
          </Field>
        </Section>

        {/* ── Contact ── */}
        <Section title="Contact Details" icon="📞" isMobile={isMobile}>
          <Field label="Phone Number">
            <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="10-digit number"/>
          </Field>
          <Field label="Aadhaar Number">
            <Input name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} placeholder="12-digit Aadhaar"/>
          </Field>
          <Field label="Address" full>
            <Textarea name="address" value={form.address} onChange={handleChange} rows={3}/>
          </Field>
        </Section>

        {/* ── Parent Info ── */}
        <Section title="Parent Details" icon="👨‍👩‍👧" isMobile={isMobile}>
          <Field label="Father Name">
            <Input name="fatherName" value={form.fatherName} onChange={handleChange}/>
          </Field>
          <Field label="Mother Name">
            <Input name="motherName" value={form.motherName} onChange={handleChange}/>
          </Field>
          <Field label="Parent Contact">
            <Input name="parentContact" value={form.parentContact} onChange={handleChange} placeholder="Phone number"/>
          </Field>
        </Section>

        {/* ── Submit ── */}
        <div style={{ display:"flex",justifyContent: isMobile ? "stretch" : "flex-end",
          gap:12,marginTop:8,flexDirection: isMobile ? "column" : "row" }}>
          <button type="button" onClick={()=>navigate("/warden/students")}
            style={{ padding:"12px 24px",border:`1.5px solid ${P.border}`,borderRadius:14,
              background:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,
              color:P.muted,fontFamily:"'Sora',sans-serif",
              width: isMobile ? "100%" : "auto" }}>
            Cancel
          </button>
          <button type="submit" disabled={loading}
            style={{ padding:"12px 32px",
              background:loading?"rgba(37,99,235,0.5)":"linear-gradient(135deg,#2563EB,#1D4ED8)",
              border:"none",borderRadius:14,cursor:loading?"not-allowed":"pointer",
              fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Sora',sans-serif",
              boxShadow:loading?"none":"0 6px 20px rgba(37,99,235,0.4)",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              width: isMobile ? "100%" : "auto" }}>
            {loading ? (
              <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",
                borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block",
                animation:"spin .7s linear infinite" }}/>
              Registering…</>
            ) : "✓ Register Student"}
          </button>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </form>
    </div>
  );
};

export default AddStudent;