// pages/admin/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

/* ── Font ── */
if (!document.getElementById("ad-font")) {
  const l = document.createElement("link");
  l.id   = "ad-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

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

const P = {
  primary:"#2563EB", amber:"#D97706", approved:"#059669",
  rejected:"#DC2626", surface:"#F8FAFF", border:"#E8EEFF",
  text:"#0F1629", muted:"#6B7A99",
};

const avatarColors = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2","#BE185D"];
const avatarBg = (n="") => avatarColors[(n.charCodeAt(0)||0) % avatarColors.length];
const initials = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";

/* ── Field components ── */
const fieldStyle = (foc) => ({
  width:"100%", padding:"10px 14px",
  border:`1.5px solid ${foc?P.primary:P.border}`,
  borderRadius:12, fontSize:13, fontFamily:"'Sora',sans-serif",
  color:P.text, background:"#fff", outline:"none",
  boxShadow:foc?"0 0 0 3px rgba(37,99,235,0.12)":"none",
  transition:"all .15s", boxSizing:"border-box",
});

function Field({ label, children, required }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:600,
        color:P.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:7 }}>
        {label}{required&&<span style={{ color:P.rejected }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function FInput({ value, onChange, type="text", placeholder, required, name }) {
  const [foc, setFoc] = useState(false);
  return <input name={name} value={value} onChange={onChange} type={type}
    placeholder={placeholder} required={required}
    style={fieldStyle(foc)} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}/>;
}

/* ── Warden Form Modal ── */
function WardenModal({ warden, onClose, onSave }) {
  const isEdit = !!warden?._id;
  const [form, setForm] = useState({
    name:       warden?.name       || "",
    email:      warden?.email      || "",
    password:   "",
    phone:      warden?.phone      || "",
    address:    warden?.address    || "",
    department: warden?.department || "",
    employeeId: warden?.employeeId || "",
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [showPw,  setShowPw]  = useState(false);

  const handleChange = (e) => setForm(f=>({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (isEdit) {
        await api.put(`/admin/warden/${warden._id}`, form);
      } else {
        await api.post("/admin/warden", form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setSaving(false); }
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed",inset:0,background:"rgba(15,22,41,0.55)",
        backdropFilter:"blur(4px)",zIndex:200,display:"flex",
        alignItems:"center",justifyContent:"center",padding:16,
        fontFamily:"'Sora',sans-serif" }}>
      <div style={{ background:"#fff",borderRadius:24,width:"100%",maxWidth:560,
        overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.18)",
        maxHeight:"90vh",overflowY:"auto" }}>

        {/* Header */}
        <div style={{ background:isEdit
            ?"linear-gradient(135deg,#2563EB,#1D4ED8)"
            :"linear-gradient(135deg,#059669,#047857)",
          padding:"22px 24px" }}>
          <div style={{ fontSize:18,fontWeight:700,color:"#fff" }}>
            {isEdit ? "✏️ Edit Warden" : "👷 Create New Warden"}
          </div>
          <div style={{ fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:4 }}>
            {isEdit ? "Update warden profile details" : "Add a new warden to the system"}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:"24px 24px" }}>
          {error && (
            <div style={{ background:"#FEF2F2",border:"1px solid #FECACA",
              borderRadius:12,padding:"10px 14px",marginBottom:16,
              fontSize:13,color:P.rejected,fontWeight:500 }}>
              ❌ {error}
            </div>
          )}

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <Field label="Full Name" required>
              <FInput name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Rajesh Kumar" required/>
            </Field>
            <Field label="Employee ID">
              <FInput name="employeeId" value={form.employeeId} onChange={handleChange}
                placeholder="e.g. WRD-001"/>
            </Field>
            <Field label="Email Address" required>
              <FInput name="email" value={form.email} onChange={handleChange}
                type="email" placeholder="warden@hostel.edu" required/>
            </Field>
            <Field label="Phone Number">
              <FInput name="phone" value={form.phone} onChange={handleChange}
                placeholder="10-digit number"/>
            </Field>
            <Field label={isEdit ? "New Password (leave blank to keep)" : "Temporary Password"} required={!isEdit}>
              <div style={{ position:"relative" }}>
                <input name="password" value={form.password} onChange={handleChange}
                  type={showPw?"text":"password"}
                  placeholder={isEdit?"Leave blank to keep current":"Min 8 characters"}
                  required={!isEdit}
                  style={{ ...fieldStyle(false), paddingRight:40 }}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)}
                  style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                    background:"none",border:"none",cursor:"pointer",
                    color:P.muted,fontSize:13,padding:4 }}>
                  {showPw?"🙈":"👁"}
                </button>
              </div>
            </Field>
            <Field label="Department">
              <select name="department" value={form.department} onChange={handleChange}
                style={{ ...fieldStyle(false), appearance:"none", cursor:"pointer" }}>
                <option value="">Select department</option>
                {["Block A","Block B","Block C","Main Hostel","Girls Hostel","Boys Hostel","All Blocks"].map(d=>(
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Address" full>
              <div style={{ gridColumn:"1/-1" }}>
                <textarea name="address" value={form.address} onChange={handleChange}
                  rows={2} placeholder="Residential address"
                  style={{ ...fieldStyle(false), resize:"vertical", gridColumn:"1/-1" }}/>
              </div>
            </Field>
          </div>

          <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:20 }}>
            <button type="button" onClick={onClose}
              style={{ padding:"10px 20px",border:`1.5px solid ${P.border}`,borderRadius:12,
                background:"none",cursor:"pointer",fontSize:13,color:P.muted,
                fontFamily:"'Sora',sans-serif" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ padding:"10px 24px",
                background:saving?"rgba(37,99,235,0.5)":isEdit?P.primary:P.approved,
                border:"none",borderRadius:12,cursor:saving?"not-allowed":"pointer",
                fontSize:13,fontWeight:700,color:"#fff",
                fontFamily:"'Sora',sans-serif",
                display:"flex",alignItems:"center",gap:8 }}>
              {saving?(
                <><span style={{ width:12,height:12,border:"2px solid rgba(255,255,255,0.4)",
                  borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block",
                  animation:"ad-spin .7s linear infinite" }}/>
                {isEdit?"Saving…":"Creating…"}</>
              ):(isEdit?"✓ Save Changes":"✓ Create Warden")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Confirm Dialog ── */
function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,22,41,0.55)",
      backdropFilter:"blur(4px)",zIndex:300,display:"flex",
      alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",padding:16 }}>
      <div style={{ background:"#fff",borderRadius:20,padding:"28px 28px",
        width:"100%",maxWidth:340,boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize:16,fontWeight:700,color:P.text,marginBottom:8 }}>Are you sure?</div>
        <div style={{ fontSize:13,color:P.muted,marginBottom:24,lineHeight:1.5 }}>{msg}</div>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel}
            style={{ padding:"8px 18px",border:`1.5px solid ${P.border}`,borderRadius:10,
              background:"none",cursor:"pointer",fontSize:13,color:P.muted,
              fontFamily:"'Sora',sans-serif" }}>Cancel</button>
          <button onClick={onConfirm}
            style={{ padding:"8px 18px",background:P.rejected,border:"none",borderRadius:10,
              color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,
              fontFamily:"'Sora',sans-serif" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Warden Card ── */
function WardenMobileCard({ w, onEdit, onToggle, onDelete }) {
  return (
    <div style={{ padding:"16px",borderBottom:`1px solid ${P.border}` }}>
      <div style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:10 }}>
        <div style={{ width:40,height:40,borderRadius:12,flexShrink:0,
          background:`linear-gradient(135deg,${avatarBg(w.name)},${avatarBg(w.name)}bb)`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:14,fontWeight:800,color:"#fff" }}>
          {initials(w.name)}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:14,fontWeight:700,color:P.text }}>{w.name}</div>
          <div style={{ fontSize:11,color:P.muted }}>{w.employeeId||"—"}</div>
          <div style={{ fontSize:12,color:P.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{w.email}</div>
        </div>
        <button onClick={()=>onToggle(w._id)}
          style={{ padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",
            fontSize:11,fontWeight:700,flexShrink:0,
            background:w.isActive?"#ECFDF5":"#FEF2F2",
            color:w.isActive?P.approved:P.rejected,
            fontFamily:"'Sora',sans-serif" }}>
          {w.isActive?"● Active":"○ Inactive"}
        </button>
      </div>
      <div style={{ display:"flex",gap:12,marginBottom:10,flexWrap:"wrap" }}>
        {w.phone && <span style={{ fontSize:12,color:P.muted }}>📞 {w.phone}</span>}
        {w.department && (
          <span style={{ background:"#EFF6FF",color:P.primary,fontSize:11,fontWeight:700,
            padding:"2px 8px",borderRadius:20 }}>{w.department}</span>
        )}
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <button onClick={()=>onEdit(w)}
          style={{ flex:1,padding:"8px",background:"#EFF6FF",color:P.primary,
            border:`1px solid ${P.border}`,borderRadius:10,fontSize:12,fontWeight:600,
            cursor:"pointer",fontFamily:"'Sora',sans-serif" }}>
          ✏️ Edit
        </button>
        <button onClick={()=>onDelete(w._id)}
          style={{ padding:"8px 14px",background:"#FEF2F2",color:P.rejected,
            border:"1px solid #FCA5A5",borderRadius:10,fontSize:12,cursor:"pointer" }}>
          🗑
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [wardens,  setWardens]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [toast,    setToast]    = useState("");
  const [tab,      setTab]      = useState("wardens");

  const todayStr = new Date().toLocaleDateString("en-IN",{
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(()=>setToast(""),3000);
  };

  const fetchWardens = useCallback(async () => {
    try {
      const r = await api.get("/admin/wardens");
      setWardens(r.data || []);
    } catch { setWardens([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ fetchWardens(); },[]);

  const handleToggle = async (id) => {
    try {
      const r = await api.put(`/admin/warden/${id}/toggle`);
      setWardens(w=>w.map(x=>x._id===id?{...x,isActive:r.data.isActive}:x));
      showToast(`Warden ${r.data.isActive?"activated":"deactivated"}`);
    } catch { showToast("Failed to toggle status"); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/warden/${id}`);
      setWardens(w=>w.filter(x=>x._id!==id));
      showToast("Warden deleted");
    } catch { showToast("Delete failed"); }
    setConfirm(null);
  };

  const handleSaved = () => {
    setModal(null);
    fetchWardens();
    showToast(modal?._id ? "Warden updated" : "Warden created successfully!");
  };

  const filtered = wardens.filter(w =>
    !search ||
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.email?.toLowerCase().includes(search.toLowerCase()) ||
    w.phone?.includes(search) ||
    w.department?.toLowerCase().includes(search.toLowerCase())
  );

  const active   = wardens.filter(w=>w.isActive).length;
  const inactive = wardens.filter(w=>!w.isActive).length;

  return (
    <div style={{ fontFamily:"'Sora',sans-serif",background:P.surface,
      minHeight:"100vh",color:P.text }}>

      <style>{`
        @keyframes ad-spin{to{transform:rotate(360deg)}}
        @keyframes ad-fade{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        .ad-card:hover{box-shadow:0 8px 24px rgba(37,99,235,0.12)!important;border-color:#2563EB!important;}
        .ad-row:hover{background:#F0F5FF!important;}
        .ad-tab-btn{padding:8px 18px;border-radius:9px;border:none;cursor:pointer;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;transition:all .15s}
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:999,
          background:"#D1FAE5",border:"1px solid #6EE7B7",borderRadius:12,
          padding:"12px 20px",color:"#065F46",fontSize:13,fontWeight:700,
          boxShadow:"0 8px 24px rgba(0,0,0,0.12)",animation:"ad-fade .2s ease",
          maxWidth:"calc(100vw - 40px)" }}>
          ✅ {toast}
        </div>
      )}

      {/* ── Modals ── */}
      {modal !== null && (
        <WardenModal
          warden={modal==="create"?null:modal}
          onClose={()=>setModal(null)}
          onSave={handleSaved}/>
      )}
      {confirm && (
        <ConfirmDialog
          msg="This will permanently delete the warden account. This cannot be undone."
          onConfirm={()=>handleDelete(confirm)}
          onCancel={()=>setConfirm(null)}/>
      )}

      {/* ── Header ── */}
      <div style={{ background:"#fff",borderBottom:`1px solid ${P.border}`,
        padding: isMobile ? "14px 16px" : "16px 28px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        flexWrap:"wrap",gap:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:38,height:38,borderRadius:10,
            background:"linear-gradient(135deg,#D97706,#B45309)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:20 }}>🏠</div>
          <div>
            <div style={{ fontSize:11,fontWeight:600,color:P.amber,
              letterSpacing:"0.1em",textTransform:"uppercase" }}>
              HostelEase · Admin Portal
            </div>
            <div style={{ fontSize: isMobile ? 14 : 15,fontWeight:700,color:P.text }}>
              Admin Dashboard
            </div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {!isMobile && (
            <div style={{ textAlign:"right",marginRight:4 }}>
              <div style={{ fontSize:13,fontWeight:600,color:P.text }}>{user?.name||"Admin"}</div>
              <div style={{ fontSize:11,color:P.muted }}>{todayStr}</div>
            </div>
          )}
          <button onClick={()=>{logout();navigate("/login");}}
            style={{ padding: isMobile ? "8px 14px" : "9px 18px",background:"#FEF2F2",color:P.rejected,
              border:`1.5px solid #FCA5A5`,borderRadius:12,
              fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {/* ── Stat strip — 2×2 on mobile, 4×1 on desktop ── */}
      <div style={{ display:"grid",
        gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
        gap: isMobile ? 10 : 14,
        padding: isMobile ? "16px 16px 0" : "20px 28px 0" }}>
        {[
          { icon:"👷", label:"Total Wardens", value:loading?"…":wardens.length, bg:"#EFF6FF", color:P.primary },
          { icon:"✅", label:"Active",         value:loading?"…":active,          bg:"#ECFDF5", color:P.approved },
          { icon:"⏸️", label:"Inactive",       value:loading?"…":inactive,        bg:"#FEF9C3", color:P.amber    },
          { icon:"🏠", label:"Managed by",     value:"HostelEase",               bg:"#F5F3FF", color:"#7C3AED"  },
        ].map(({ icon, label, value, bg, color }) => (
          <div key={label} className="ad-card"
            style={{ background:"#fff",borderRadius:18,
              padding: isMobile ? "14px 14px" : "18px 20px",
              border:`1px solid ${P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
              transition:"all .2s" }}>
            <div style={{ width:36,height:36,borderRadius:10,background:bg,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:17,marginBottom:8 }}>{icon}</div>
            <div style={{ fontSize: isMobile ? 18 : 22,fontWeight:800,color,lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:12,color:P.muted,marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: isMobile ? "16px 16px 40px" : "20px 28px 40px" }}>

        {/* Tabs */}
        <div style={{ display:"flex",gap:4,background:"#fff",borderRadius:14,
          padding:4,marginBottom:20,border:`1px solid ${P.border}`,
          width:"fit-content",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          {[["wardens","👷 Wardens"],["notifications","🔔 Notifications"]].map(([k,l])=>(
            <button key={k} className="ad-tab-btn" onClick={()=>setTab(k)}
              style={{ background:tab===k?P.primary:"none",
                color:tab===k?"#fff":P.muted,
                padding: isMobile ? "8px 12px" : "8px 18px",
                fontSize: isMobile ? 12 : 13 }}>
              {l}
            </button>
          ))}
        </div>

        {/* ══ WARDENS TAB ══ */}
        {tab==="wardens" && (
          <div style={{ background:"#fff",borderRadius:20,border:`1px solid ${P.border}`,
            overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>

            {/* Toolbar */}
            <div style={{ padding:"14px 16px",borderBottom:`1px solid ${P.border}`,
              background:"#FAFBFF",display:"flex",gap:10,
              justifyContent:"space-between",alignItems:"center",flexWrap:"wrap" }}>

              <div style={{ display:"flex",alignItems:"center",gap:8,
                padding:"8px 14px",border:`1.5px solid ${P.border}`,
                borderRadius:12,background:"#fff",
                flex:"1",minWidth:150,maxWidth: isMobile ? "none" : 280 }}>
                <span style={{ color:P.muted,fontSize:14 }}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search wardens…"
                  style={{ border:"none",outline:"none",fontSize:13,color:P.text,
                    fontFamily:"'Sora',sans-serif",background:"none",width:"100%" }}/>
                {search&&<button onClick={()=>setSearch("")}
                  style={{ border:"none",background:"none",cursor:"pointer",
                    color:P.muted,fontSize:12 }}>✕</button>}
              </div>

              <button onClick={()=>setModal("create")}
                style={{ padding:"9px 16px",background:P.approved,color:"#fff",
                  border:"none",borderRadius:12,fontFamily:"'Sora',sans-serif",
                  fontWeight:700,fontSize:13,cursor:"pointer",
                  display:"flex",alignItems:"center",gap:7,
                  boxShadow:"0 4px 12px rgba(5,150,105,0.3)",flexShrink:0 }}>
                + Create Warden
              </button>
            </div>

            {/* Mobile card list / Desktop table */}
            {loading ? (
              <div style={{ padding:"48px",textAlign:"center",color:P.muted }}>
                <div style={{ fontSize:28,marginBottom:8 }}>⏳</div>
                <div style={{ fontWeight:600 }}>Loading wardens…</div>
              </div>
            ) : filtered.length===0 ? (
              <div style={{ padding:"48px",textAlign:"center",color:P.muted }}>
                <div style={{ fontSize:36,marginBottom:8 }}>👷</div>
                <div style={{ fontWeight:700,fontSize:15,color:P.text,marginBottom:6 }}>
                  {search ? "No wardens match your search" : "No wardens yet"}
                </div>
                {!search && (
                  <button onClick={()=>setModal("create")}
                    style={{ marginTop:12,padding:"10px 22px",
                      background:P.primary,color:"#fff",border:"none",
                      borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",
                      fontFamily:"'Sora',sans-serif" }}>
                    Create your first warden
                  </button>
                )}
              </div>
            ) : isMobile ? (
              // Mobile card list
              <div>
                {filtered.map(w=>(
                  <WardenMobileCard
                    key={w._id}
                    w={w}
                    onEdit={setModal}
                    onToggle={handleToggle}
                    onDelete={setConfirm}
                  />
                ))}
              </div>
            ) : (
              // Desktop table
              <>
                {/* Table header */}
                <div style={{ display:"grid",
                  gridTemplateColumns:"2.5fr 1.8fr 1.2fr 1.2fr 1fr 120px",
                  padding:"10px 20px",borderBottom:`1px solid ${P.border}`,
                  background:"#F8FAFF" }}>
                  {["Warden","Email","Phone","Department","Status","Actions"].map(h=>(
                    <div key={h} style={{ fontSize:11,fontWeight:600,color:P.muted,
                      textTransform:"uppercase",letterSpacing:"0.06em" }}>{h}</div>
                  ))}
                </div>

                {filtered.map((w,i)=>(
                  <div key={w._id} className="ad-row"
                    style={{ display:"grid",
                      gridTemplateColumns:"2.5fr 1.8fr 1.2fr 1.2fr 1fr 120px",
                      padding:"14px 20px",
                      borderBottom:i<filtered.length-1?`1px solid ${P.border}`:"none",
                      alignItems:"center",transition:"background .12s" }}>

                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,
                        background:`linear-gradient(135deg,${avatarBg(w.name)},${avatarBg(w.name)}bb)`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:12,fontWeight:800,color:"#fff" }}>
                        {initials(w.name)}
                      </div>
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:P.text }}>{w.name}</div>
                        <div style={{ fontSize:11,color:P.muted }}>{w.employeeId||"—"}</div>
                      </div>
                    </div>

                    <div style={{ fontSize:12,color:P.muted,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                      {w.email}
                    </div>

                    <div style={{ fontSize:12,color:P.muted }}>{w.phone||"—"}</div>

                    <div>
                      {w.department ? (
                        <span style={{ background:"#EFF6FF",color:P.primary,
                          fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20 }}>
                          {w.department}
                        </span>
                      ) : <span style={{ fontSize:12,color:P.muted }}>—</span>}
                    </div>

                    <div>
                      <button onClick={()=>handleToggle(w._id)}
                        style={{ padding:"4px 12px",borderRadius:20,border:"none",cursor:"pointer",
                          fontSize:11,fontWeight:700,
                          background:w.isActive?"#ECFDF5":"#FEF2F2",
                          color:w.isActive?P.approved:P.rejected,
                          fontFamily:"'Sora',sans-serif" }}>
                        {w.isActive?"● Active":"○ Inactive"}
                      </button>
                    </div>

                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={()=>setModal(w)}
                        style={{ padding:"6px 12px",background:"#EFF6FF",
                          color:P.primary,border:`1px solid ${P.border}`,
                          borderRadius:8,fontSize:11,fontWeight:600,
                          cursor:"pointer",fontFamily:"'Sora',sans-serif" }}>
                        Edit
                      </button>
                      <button onClick={()=>setConfirm(w._id)}
                        style={{ padding:"6px 10px",background:"#FEF2F2",
                          color:P.rejected,border:"1px solid #FCA5A5",
                          borderRadius:8,fontSize:11,cursor:"pointer" }}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ══ NOTIFICATIONS TAB ══ */}
        {tab==="notifications" && (
          <AdminNotificationsPanel isMobile={isMobile}/>
        )}
      </div>
    </div>
  );
};

/* ── Admin Notifications Panel ── */
function AdminNotificationsPanel({ isMobile }) {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [compose, setCompose] = useState(false);
  const [form,    setForm]    = useState({ title:"", message:"", type:"GENERAL" });
  const [sending, setSending] = useState(false);
  const [toast,   setToast]   = useState("");

  const TYPES = ["GENERAL","LEAVE_APPROVED","LEAVE_REJECTED","ROOM_ALLOCATED","PAYMENT_CONFIRMED"];
  const TYPE_ICONS = {
    GENERAL:"📢", LEAVE_APPROVED:"✅", LEAVE_REJECTED:"❌",
    ROOM_ALLOCATED:"🏠", PAYMENT_CONFIRMED:"💳",
  };

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  useEffect(()=>{
    api.get("/notifications")
      .then(r=>setNotifs(r.data?.notifications||[]))
      .catch(()=>setNotifs([]))
      .finally(()=>setLoading(false));
  },[]);

  const timeAgo = (d) => {
    const s=(Date.now()-new Date(d))/1000;
    if(s<60) return "just now";
    if(s<3600) return `${Math.floor(s/60)}m ago`;
    if(s<86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <div>
      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:999,
          background:"#D1FAE5",border:"1px solid #6EE7B7",borderRadius:12,
          padding:"12px 20px",color:"#065F46",fontSize:13,fontWeight:700,
          boxShadow:"0 8px 24px rgba(0,0,0,0.12)",maxWidth:"calc(100vw - 40px)" }}>
          ✅ {toast}
        </div>
      )}

      <div style={{ display:"flex",justifyContent:"space-between",
        alignItems: isMobile ? "flex-start" : "center",
        marginBottom:16,flexWrap:"wrap",gap:10 }}>
        <div>
          <h2 style={{ fontSize:18,fontWeight:700,color:P.text,margin:0 }}>
            System Notifications
          </h2>
          <p style={{ fontSize:13,color:P.muted,marginTop:4 }}>
            Your recent notifications from HostelEase
          </p>
        </div>
        <button onClick={()=>setCompose(!compose)}
          style={{ padding:"9px 18px",background:P.primary,color:"#fff",
            border:"none",borderRadius:12,fontFamily:"'Sora',sans-serif",
            fontWeight:600,fontSize:13,cursor:"pointer",
            boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
          {compose?"✕ Close":"+ Compose"}
        </button>
      </div>

      {/* Compose form */}
      {compose && (
        <div style={{ background:"#fff",borderRadius:16,padding:"20px",
          border:`1px solid ${P.border}`,marginBottom:16,
          boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:14,fontWeight:700,color:P.text,marginBottom:14 }}>
            Send System Notification
          </div>
          <div style={{ display:"grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap:12,marginBottom:12 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:P.muted,
                textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6 }}>
                Type
              </label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                style={{ width:"100%",padding:"9px 12px",border:`1.5px solid ${P.border}`,
                  borderRadius:10,fontSize:13,fontFamily:"'Sora',sans-serif",
                  color:P.text,background:"#fff",outline:"none",cursor:"pointer" }}>
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:P.muted,
                textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6 }}>
                Title
              </label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                placeholder="Notification title"
                style={{ width:"100%",padding:"9px 12px",border:`1.5px solid ${P.border}`,
                  borderRadius:10,fontSize:13,fontFamily:"'Sora',sans-serif",
                  color:P.text,background:"#fff",outline:"none",boxSizing:"border-box" }}/>
            </div>
          </div>
          <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
            rows={3} placeholder="Write your notification message…"
            style={{ width:"100%",padding:"9px 12px",border:`1.5px solid ${P.border}`,
              borderRadius:10,fontSize:13,fontFamily:"'Sora',sans-serif",
              color:P.text,background:"#fff",outline:"none",
              resize:"vertical",boxSizing:"border-box",marginBottom:12 }}/>
          <div style={{ display:"flex",justifyContent:"flex-end" }}>
            <button onClick={async()=>{
              if(!form.title||!form.message) return;
              setSending(true);
              try {
                const res = await api.post("/notifications/broadcast", {
                  title: form.title,
                  message: form.message,
                  type: form.type,
                });
                const sent = res.data?.sent ?? 0;
                showToast(`Notification sent to ${sent} warden${sent !== 1 ? "s" : ""}!`);
                setForm({title:"",message:"",type:"GENERAL"});
                setCompose(false);
              } catch (err) {
                showToast(err.response?.data?.message || "Failed to send notification");
              } finally { setSending(false); }
            }}
              disabled={sending||!form.title||!form.message}
              style={{ padding:"9px 20px",background:sending?"rgba(37,99,235,0.5)":P.primary,
                color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,
                cursor:(!form.title||!form.message||sending)?"not-allowed":"pointer",
                fontFamily:"'Sora',sans-serif",
                width: isMobile ? "100%" : "auto" }}>
              {sending?"Sending…":"Send Notification"}
            </button>
          </div>
        </div>
      )}

      {/* Notification list */}
      <div style={{ background:"#fff",borderRadius:20,border:`1px solid ${P.border}`,
        overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ padding:"48px",textAlign:"center",color:P.muted }}>
            <div style={{ fontSize:28,marginBottom:8 }}>⏳</div>
            <div>Loading notifications…</div>
          </div>
        ) : notifs.length===0 ? (
          <div style={{ padding:"48px",textAlign:"center",color:P.muted }}>
            <div style={{ fontSize:36,marginBottom:10 }}>🔕</div>
            <div style={{ fontWeight:600,fontSize:14,color:P.text }}>No notifications</div>
          </div>
        ) : notifs.map((n,i)=>(
          <div key={n._id||i}
            style={{ display:"flex",gap:12,padding:"14px 16px",
              background:n.isRead?"#fff":"#F0F7FF",
              borderBottom:i<notifs.length-1?`1px solid ${P.border}`:"none" }}>
            <div style={{ width:40,height:40,borderRadius:12,
              background:"#EFF6FF",display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:18,flexShrink:0 }}>
              {TYPE_ICONS[n.type]||"🔔"}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:14,fontWeight:n.isRead?500:700,color:P.text,marginBottom:3 }}>
                {n.title}
              </div>
              <div style={{ fontSize:12,color:P.muted,lineHeight:1.5 }}>{n.message}</div>
            </div>
            <div style={{ fontSize:11,color:P.muted,flexShrink:0,
              fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap" }}>
              {timeAgo(n.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;