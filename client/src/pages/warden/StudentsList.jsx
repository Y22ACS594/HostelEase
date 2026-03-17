import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../../services/studentService";

/* ── Font ── */
if (!document.getElementById("sl-font")) {
  const l = document.createElement("link");
  l.id   = "sl-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

const P = {
  primary:"#2563EB", approved:"#059669", pending:"#D97706",
  rejected:"#DC2626", surface:"#F8FAFF", border:"#E8EEFF",
  text:"#0F1629", muted:"#6B7A99",
};

const avatarColors = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2","#BE185D"];
const avatarBg = (n="") => avatarColors[(n.charCodeAt(0)||0) % avatarColors.length];
const initials  = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();

/* ── Student Row Card ─────────────────────────────────── */
function StudentCard({ student, onView }) {
  const [hov, setHov] = useState(false);
  const bg = avatarBg(student.fullName);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:16,
        padding:"16px 20px",
        background: hov ? "#F0F5FF" : "#fff",
        borderBottom:`1px solid ${P.border}`,
        transition:"background .12s", cursor:"default" }}>

      {/* Avatar */}
      <div style={{ width:44, height:44, borderRadius:14,
        background:`linear-gradient(135deg,${bg},${bg}bb)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:15, fontWeight:800, color:"#fff",
        boxShadow:`0 4px 12px ${bg}30`, flexShrink:0 }}>
        {initials(student.fullName)}
      </div>

      {/* Name + roll */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:P.text,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {student.fullName}
        </div>
        <div style={{ fontSize:12, color:P.muted, marginTop:2,
          fontFamily:"'DM Mono',monospace" }}>
          {student.rollNumber || "—"}
        </div>
      </div>

      {/* Department */}
      <div style={{ width:70, textAlign:"center" }}>
        <span style={{ background:"#EFF6FF", color:P.primary,
          fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:12 }}>
          {student.department || "—"}
        </span>
      </div>

      {/* Batch */}
      <div style={{ width:100, fontSize:12, color:P.muted,
        fontFamily:"'DM Mono',monospace", textAlign:"center" }}>
        {student.batch || "—"}
      </div>

      {/* Phone */}
      <div style={{ width:130, fontSize:12, color:P.muted, textAlign:"center" }}>
        {student.phoneNumber || "—"}
      </div>

      {/* College */}
      <div style={{ width:160, fontSize:12, color:P.muted,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        textAlign:"center" }}>
        {student.collegeName || "—"}
      </div>

      {/* Joined */}
      <div style={{ width:100, fontSize:11, color:P.muted,
        fontFamily:"'DM Mono',monospace", textAlign:"center" }}>
        {new Date(student.createdAt).toLocaleDateString("en-IN",{
          day:"2-digit", month:"short", year:"numeric",
        })}
      </div>

      {/* Status */}
      <div style={{ width:70, textAlign:"center" }}>
        <span style={{ background:"#D1FAE5", color:"#065F46",
          fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>
          Active
        </span>
      </div>

      {/* Action */}
      <div style={{ width:100, flexShrink:0, textAlign:"right" }}>
        <button onClick={() => onView(student._id)}
          style={{ padding:"7px 14px",
            background: hov ? P.primary : "#EFF6FF",
            color: hov ? "#fff" : P.primary,
            border:`1.5px solid ${hov?P.primary:P.border}`,
            borderRadius:10, fontSize:12, fontWeight:600,
            cursor:"pointer", fontFamily:"'Sora',sans-serif",
            transition:"all .15s" }}>
          View →
        </button>
      </div>
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────────── */
function Pagination({ page, totalPages, total, onPageChange }) {
  const start = Math.max(1, page-2);
  const end   = Math.min(totalPages, page+2);
  const pages = [];
  for (let p=start; p<=end; p++) pages.push(p);

  const btn = (active, disabled) => ({
    width:32, height:32, border:`1.5px solid ${active?P.primary:P.border}`,
    borderRadius:8, background:active?P.primary:"#fff",
    color:active?"#fff":P.muted, fontSize:13, cursor:disabled?"not-allowed":"pointer",
    fontFamily:"'Sora',sans-serif", opacity:disabled?0.4:1,
    display:"flex", alignItems:"center", justifyContent:"center",
  });

  return (
    <div style={{ padding:"14px 20px", borderTop:`1px solid ${P.border}`,
      display:"flex", justifyContent:"space-between", alignItems:"center",
      background:"#FAFBFF", flexWrap:"wrap", gap:10 }}>
      <span style={{ fontSize:12, color:P.muted }}>
        Page {page} of {totalPages} · {total} students total
      </span>
      <div style={{ display:"flex", gap:4 }}>
        <button onClick={()=>onPageChange(1)} disabled={page===1} style={btn(false,page===1)}>«</button>
        <button onClick={()=>onPageChange(page-1)} disabled={page===1} style={btn(false,page===1)}>‹</button>
        {start>1&&<span style={{ fontSize:12,color:P.muted,padding:"0 2px",alignSelf:"center" }}>…</span>}
        {pages.map(p=>(
          <button key={p} onClick={()=>onPageChange(p)} style={btn(p===page,false)}>{p}</button>
        ))}
        {end<totalPages&&<span style={{ fontSize:12,color:P.muted,padding:"0 2px",alignSelf:"center" }}>…</span>}
        <button onClick={()=>onPageChange(page+1)} disabled={page===totalPages} style={btn(false,page===totalPages)}>›</button>
        <button onClick={()=>onPageChange(totalPages)} disabled={page===totalPages} style={btn(false,page===totalPages)}>»</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const StudentsList = () => {
  const navigate = useNavigate();

  const [students,   setStudents]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [batch,      setBatch]      = useState("");
  const [department, setDepartment] = useState("");
  const [loading,    setLoading]    = useState(true);
  const LIMIT = 10;

  const load = useCallback(async (pg=1, s=search, b=batch, d=department) => {
    setLoading(true);
    try {
      const res = await getStudents({ page:pg, limit:LIMIT, batch:b, department:d });
      const data = res.data;
      setStudents(data.students ?? []);
      setTotal(data.total ?? data.students?.length ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1); }, []);

  /* client-side search on top of server results */
  const displayed = students.filter(s =>
    !search ||
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.phoneNumber?.includes(search)
  );

  const handleFilter = (b, d) => {
    setPage(1); setBatch(b); setDepartment(d);
    load(1, search, b, d);
  };

  const todayStr = new Date().toLocaleDateString("en-IN",{
    weekday:"long",day:"numeric",month:"long",year:"numeric",
  });

  return (
    <div style={{ fontFamily:"'Sora',sans-serif", background:P.surface,
      minHeight:"100vh", padding:24, color:P.text }}>

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:28,flexWrap:"wrap",gap:12 }}>
        <div>
          <div style={{ fontSize:11,fontWeight:600,color:P.primary,
            letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>
            HostelEase · Warden Portal
          </div>
          <h1 style={{ margin:0,fontSize:24,fontWeight:700,color:P.text }}>
            👩‍🎓 Student Profiles
          </h1>
          <p style={{ margin:"4px 0 0",fontSize:13,color:P.muted }}>{todayStr}</p>
        </div>
        <button onClick={() => navigate("/warden/add-student")}
          style={{ padding:"10px 18px",background:P.primary,color:"#fff",
            border:"none",borderRadius:12,fontFamily:"'Sora',sans-serif",
            fontWeight:600,fontSize:13,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(37,99,235,0.35)" }}>
          + Add Student
        </button>
      </div>

      {/* Summary stat */}
      <div style={{ background:"#fff",borderRadius:16,padding:"14px 20px",
        border:`1px solid ${P.border}`,marginBottom:20,
        display:"flex",alignItems:"center",gap:24,flexWrap:"wrap" }}>
        {[
          { icon:"👩‍🎓", value:loading?"…":total, label:"Total Students" },
          { icon:"✅",   value:loading?"…":total,  label:"Active"         },
          { icon:"🏛️",  value:department||"All",   label:"Department"     },
          { icon:"📅",   value:batch||"All",        label:"Batch"          },
        ].map(({ icon, value, label }) => (
          <div key={label} style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:16 }}>{icon}</span>
            <div>
              <div style={{ fontSize:15,fontWeight:700,color:P.text }}>{value}</div>
              <div style={{ fontSize:11,color:P.muted }}>{label}</div>
            </div>
            <div style={{ width:1,height:30,background:P.border,marginLeft:8 }}/>
          </div>
        ))}
      </div>

      {/* Filter + search bar */}
      <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>

        {/* Search */}
        <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 14px",
          border:`1.5px solid ${P.border}`,borderRadius:12,background:"#fff",
          flex:1,minWidth:200,maxWidth:280 }}>
          <span style={{ color:P.muted,fontSize:14 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search name, roll, phone…"
            style={{ border:"none",outline:"none",fontSize:13,color:P.text,
              fontFamily:"'Sora',sans-serif",background:"none",width:"100%" }}/>
          {search&&<button onClick={()=>setSearch("")}
            style={{ border:"none",background:"none",cursor:"pointer",color:P.muted,fontSize:12 }}>✕</button>}
        </div>

        {/* Batch */}
        <div style={{ position:"relative" }}>
          <select value={batch}
            onChange={e=>handleFilter(e.target.value,department)}
            style={{ appearance:"none",padding:"9px 32px 9px 12px",
              border:`1.5px solid ${P.border}`,borderRadius:12,fontSize:13,
              fontFamily:"'Sora',sans-serif",color:P.text,background:"#fff",
              cursor:"pointer",outline:"none" }}>
            <option value="">All Batches</option>
            {["2022-2026","2023-2027","2024-2028","2025-2029"].map(b=>(
              <option key={b}>{b}</option>
            ))}
          </select>
          <span style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
            color:P.muted,pointerEvents:"none",fontSize:10 }}>▼</span>
        </div>

        {/* Department */}
        <div style={{ position:"relative" }}>
          <select value={department}
            onChange={e=>handleFilter(batch,e.target.value)}
            style={{ appearance:"none",padding:"9px 32px 9px 12px",
              border:`1.5px solid ${P.border}`,borderRadius:12,fontSize:13,
              fontFamily:"'Sora',sans-serif",color:P.text,background:"#fff",
              cursor:"pointer",outline:"none" }}>
            <option value="">All Departments</option>
            {["CSE","ECE","EEE","MECH","CIVIL","IT"].map(d=>(
              <option key={d}>{d}</option>
            ))}
          </select>
          <span style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
            color:P.muted,pointerEvents:"none",fontSize:10 }}>▼</span>
        </div>

        {(batch||department)&&(
          <button onClick={()=>handleFilter("","")}
            style={{ padding:"9px 12px",border:`1.5px solid ${P.border}`,borderRadius:12,
              background:"none",color:P.muted,fontFamily:"'Sora',sans-serif",
              fontSize:12,cursor:"pointer" }}>
            ✕ Clear
          </button>
        )}

        <span style={{ marginLeft:"auto",fontSize:12,color:P.muted }}>
          {loading ? "Loading…" : `${displayed.length} result${displayed.length!==1?"s":""}`}
        </span>
      </div>

      {/* Table */}
      <div style={{ background:"#fff",borderRadius:20,border:`1px solid ${P.border}`,
        overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>

        {/* Table header */}
        <div style={{ display:"flex",alignItems:"center",gap:16,padding:"10px 20px",
          borderBottom:`1px solid ${P.border}`,background:"#F8FAFF" }}>
          {[
            { label:"Student",   width:"flex-1" },
            { label:"",          width:"w-44"   },  // avatar placeholder
            { label:"Dept",      w:70  },
            { label:"Batch",     w:100 },
            { label:"Phone",     w:130 },
            { label:"College",   w:160 },
            { label:"Joined",    w:100 },
            { label:"Status",    w:70  },
            { label:"Action",    w:100 },
          ].filter(c=>c.label).map((c)=>(
            <div key={c.label}
              style={{ fontSize:11,fontWeight:600,color:P.muted,
                textTransform:"uppercase",letterSpacing:"0.06em",
                width:c.w, flexShrink:0,
                ...(c.label==="Student"?{flex:1}:{}) }}>
              {c.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding:"60px",textAlign:"center",color:P.muted }}>
            <div style={{ fontSize:28,marginBottom:8 }}>⏳</div>
            <div style={{ fontWeight:600 }}>Loading students…</div>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding:"60px",textAlign:"center",color:P.muted }}>
            <div style={{ fontSize:36,marginBottom:10 }}>👥</div>
            <div style={{ fontWeight:700,fontSize:15,color:P.text,marginBottom:6 }}>No students found</div>
            <div style={{ fontSize:13 }}>
              {search||batch||department ? "Try adjusting your filters" : "Add your first student to get started"}
            </div>
          </div>
        ) : (
          displayed.map(student => (
            <StudentCard
              key={student._id}
              student={student}
              onView={(id) => navigate(`/warden/student/${id}`)}
            />
          ))
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={(p) => { setPage(p); load(p); }}
          />
        )}
      </div>

      {/* Footer note */}
      {!loading && displayed.length > 0 && (
        <div style={{ textAlign:"center",marginTop:14,fontSize:11,color:P.muted }}>
          Showing {displayed.length} of {total} students
        </div>
      )}
    </div>
  );
};

export default StudentsList;