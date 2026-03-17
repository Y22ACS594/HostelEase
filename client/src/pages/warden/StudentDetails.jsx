import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentDetails, deleteStudent } from "../../services/wardenService";

/* ── Font ── */
if (!document.getElementById("sd-font")) {
  const l = document.createElement("link");
  l.id  = "sd-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

const P = {
  primary:"#2563EB", approved:"#059669", pending:"#D97706",
  rejected:"#DC2626", surface:"#F8FAFF", border:"#E8EEFF",
  text:"#0F1629", muted:"#6B7A99",
};

const avatarColors = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2"];
const avatarBg = (n="") => avatarColors[(n.charCodeAt(0)||0) % avatarColors.length];
const initials  = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString("en-IN",{ day:"2-digit",month:"short",year:"numeric" }) : "—";

function InfoRow({ label, value }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
      padding:"8px 0", borderBottom:`1px solid ${P.border}` }}>
      <span style={{ fontSize:12, color:P.muted, fontWeight:500, minWidth:120 }}>{label}</span>
      <span style={{ fontSize:13, color:P.text, fontWeight:500, textAlign:"right",
        maxWidth:200, wordBreak:"break-word" }}>{value || "—"}</span>
    </div>
  );
}

function InfoCard({ title, icon, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:20, padding:"20px 24px",
      border:`1px solid ${P.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <span style={{ fontSize:13, fontWeight:700, color:P.text }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,22,41,0.6)",
      backdropFilter:"blur(4px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:"'Sora',sans-serif" }}>
      <div style={{ background:"#fff",borderRadius:24,padding:"28px 32px",
        width:360,boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize:24, textAlign:"center", marginBottom:12 }}>🗑️</div>
        <div style={{ fontSize:16,fontWeight:700,color:P.text,textAlign:"center",marginBottom:8 }}>
          Delete Student?
        </div>
        <div style={{ fontSize:13,color:P.muted,textAlign:"center",marginBottom:24,lineHeight:1.5 }}>
          This will permanently delete the student along with all their leave requests,
          payments, and room allocations.
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onCancel}
            style={{ flex:1,padding:"10px",border:`1.5px solid ${P.border}`,borderRadius:12,
              background:"none",cursor:"pointer",fontSize:13,color:P.muted,fontFamily:"'Sora',sans-serif" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ flex:1,padding:"10px",background:P.rejected,border:"none",borderRadius:12,
              color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Sora',sans-serif" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const StudentDetails = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [deleting,setDeleting]= useState(false);

  useEffect(() => {
    getStudentDetails(id)
      .then(res => setData(res.data))
      .catch(() => navigate("/warden/students"));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStudent(id);
      navigate("/warden/students");
    } catch { setDeleting(false); setConfirm(false); }
  };

  if (!data) return (
    <div style={{ minHeight:"100vh", background:P.surface, display:"flex",
      alignItems:"center", justifyContent:"center",
      fontFamily:"'Sora',sans-serif", color:P.muted }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:8 }}>⏳</div>
        <div style={{ fontWeight:600 }}>Loading profile…</div>
      </div>
    </div>
  );

  const { student, payments, leaves, room } = data;
  const stayDays = room?.checkInDate
    ? Math.floor(((room.checkOutDate ? new Date(room.checkOutDate) : new Date()) - new Date(room.checkInDate)) / 86400000)
    : null;

  const pendingLeaves  = leaves.filter(l=>l.status==="Pending").length;
  const approvedLeaves = leaves.filter(l=>l.status==="Approved").length;
  const totalPaid      = payments.filter(p=>p.paymentStatus==="Paid").reduce((s,p)=>s+p.amount,0);

  const statusStyle = (s) => ({
    Pending:  { bg:"#FEF3C7", color:"#92400E" },
    Approved: { bg:"#D1FAE5", color:"#065F46" },
    Rejected: { bg:"#FEE2E2", color:"#991B1B" },
    Paid:     { bg:"#D1FAE5", color:"#065F46" },
    paid:     { bg:"#D1FAE5", color:"#065F46" },
    pending:  { bg:"#FEF3C7", color:"#92400E" },
  }[s] || { bg:"#F1F5F9", color:"#475569" });

  return (
    <div style={{ fontFamily:"'Sora',sans-serif", background:P.surface,
      minHeight:"100vh", padding:24, color:P.text }}>

      {confirm && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setConfirm(false)}
        />
      )}

      {/* Back button */}
      <button onClick={() => navigate("/warden/students")}
        style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",
          background:"#fff",border:`1px solid ${P.border}`,borderRadius:10,
          cursor:"pointer",fontSize:13,color:P.muted,fontFamily:"'Sora',sans-serif",
          marginBottom:24 }}>
        ← Back to Students
      </button>

      {/* Profile hero card */}
      <div style={{ background:"#fff", borderRadius:24, padding:"28px 32px",
        border:`1px solid ${P.border}`,
        boxShadow:"0 2px 12px rgba(37,99,235,0.06)",
        marginBottom:20,
        display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>

        {/* Avatar */}
        <div style={{ width:80, height:80, borderRadius:24,
          background:`linear-gradient(135deg,${avatarBg(student.fullName)},${avatarBg(student.fullName)}99)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:28, fontWeight:800, color:"#fff",
          boxShadow:`0 8px 24px ${avatarBg(student.fullName)}40`,
          flexShrink:0 }}>
          {initials(student.fullName)}
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4 }}>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:P.text }}>
              {student.fullName}
            </h1>
            <span style={{ background:"#D1FAE5", color:"#065F46",
              fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
              ● Active
            </span>
          </div>
          <div style={{ display:"flex",gap:16,flexWrap:"wrap",fontSize:13,color:P.muted,marginTop:4 }}>
            <span>📋 {student.rollNumber}</span>
            <span>🏛️ {student.department}</span>
            <span>📅 {student.batch}</span>
            <span>📞 {student.phoneNumber}</span>
          </div>
          <div style={{ fontSize:12,color:P.muted,marginTop:6 }}>
            {student.collegeName}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:"flex",gap:10,flexShrink:0 }}>
          <button onClick={() => navigate(`/warden/students/edit/${student._id}`)}
            style={{ padding:"10px 18px",background:"#EFF6FF",color:P.primary,
              border:`1.5px solid ${P.border}`,borderRadius:12,
              fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer" }}>
            ✏️ Edit
          </button>
          <button onClick={() => setConfirm(true)}
            style={{ padding:"10px 18px",background:"#FEF2F2",color:P.rejected,
              border:`1.5px solid #FCA5A5`,borderRadius:12,
              fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer" }}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Quick stat strip */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
        {[
          { icon:"📄", value:leaves.length,    label:"Total Leaves",    bg:"#EFF6FF" },
          { icon:"⏳", value:pendingLeaves,     label:"Pending",         bg:"#FFFBEB" },
          { icon:"✅", value:approvedLeaves,    label:"Approved",        bg:"#ECFDF5" },
          { icon:"💳", value:`₹${totalPaid}`,  label:"Total Paid",      bg:"#F5F3FF" },
        ].map(({ icon, value, label, bg }) => (
          <div key={label} style={{ background:"#fff",borderRadius:16,padding:"16px 18px",
            border:`1px solid ${P.border}`,textAlign:"center",
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ width:32,height:32,borderRadius:10,background:bg,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:15,margin:"0 auto 8px" }}>{icon}</div>
            <div style={{ fontSize:20,fontWeight:700,color:P.text }}>{value}</div>
            <div style={{ fontSize:11,color:P.muted,marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Info grid */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20 }}>

        <InfoCard title="Personal Info" icon="👤">
          <InfoRow label="Phone"       value={student.phoneNumber}/>
          <InfoRow label="Blood Group" value={student.bloodGroup}/>
          <InfoRow label="Gender"      value={student.gender}/>
          <InfoRow label="Date of Birth" value={fmtDate(student.dateOfBirth)}/>
          <InfoRow label="Aadhaar"     value={student.aadhaarNumber ? `••••${student.aadhaarNumber.slice(-4)}` : null}/>
          <InfoRow label="Address"     value={student.address}/>
          {student.medicalIssues && (
            <div style={{ marginTop:8,padding:"8px 10px",background:"#FEF3C7",
              borderRadius:8,fontSize:11,color:"#92400E" }}>
              ⚠️ Medical: {student.medicalIssues}
            </div>
          )}
        </InfoCard>

        <InfoCard title="Parent Info" icon="👨‍👩‍👧">
          <InfoRow label="Father Name"    value={student.fatherName}/>
          <InfoRow label="Mother Name"    value={student.motherName}/>
          <InfoRow label="Parent Contact" value={student.parentContact}/>
        </InfoCard>

        <InfoCard title="Room Details" icon="🏠">
          {room ? (
            <>
              <InfoRow label="Room No"     value={room.room?.roomNumber}/>
              <InfoRow label="Block"       value={room.room?.blockName}/>
              <InfoRow label="Bed No"      value={room.bedNumber}/>
              <InfoRow label="Check-In"    value={fmtDate(room.checkInDate)}/>
              <InfoRow label="Check-Out"   value={room.checkOutDate ? fmtDate(room.checkOutDate) : "Still staying"}/>
              {stayDays !== null && (
                <InfoRow label="Stay Duration" value={`${stayDays} days`}/>
              )}
              <div style={{ marginTop:8 }}>
                <span style={{ background:room.status==="active"?"#D1FAE5":"#FEE2E2",
                  color:room.status==="active"?"#065F46":"#991B1B",
                  fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20 }}>
                  {room.status==="active" ? "✅ Checked In" : "Checked Out"}
                </span>
              </div>
            </>
          ) : (
            <div style={{ padding:"20px 0",textAlign:"center",color:P.muted }}>
              <div style={{ fontSize:24, marginBottom:6 }}>🏠</div>
              <div style={{ fontSize:12 }}>No room allocated yet</div>
            </div>
          )}
        </InfoCard>
      </div>

      {/* Payment History */}
      <div style={{ background:"#fff",borderRadius:20,border:`1px solid ${P.border}`,
        overflow:"hidden",marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ padding:"18px 24px",borderBottom:`1px solid ${P.border}`,
          display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:16 }}>💳</span>
          <span style={{ fontSize:14,fontWeight:700,color:P.text }}>Payment History</span>
          <span style={{ marginLeft:"auto",fontSize:12,color:P.muted }}>
            {payments.length} records
          </span>
        </div>
        {payments.length === 0 ? (
          <div style={{ padding:"32px",textAlign:"center",color:P.muted }}>
            <div style={{ fontSize:28, marginBottom:8 }}>💳</div>
            <div style={{ fontSize:13 }}>No payments recorded</div>
          </div>
        ) : (
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#F8FAFF" }}>
                {["Amount","Academic Year","Mode","Status","Date"].map(h=>(
                  <th key={h} style={{ padding:"10px 20px",textAlign:"left",
                    fontSize:11,fontWeight:600,color:P.muted,textTransform:"uppercase",
                    letterSpacing:"0.06em",borderBottom:`1px solid ${P.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p,i) => {
                const { bg, color } = statusStyle(p.paymentStatus);
                return (
                  <tr key={p._id} style={{ background:i%2===0?"#fff":"#FAFBFF" }}>
                    <td style={{ padding:"12px 20px",fontSize:14,fontWeight:700,
                      color:P.text,fontFamily:"'DM Mono',monospace" }}>₹{p.amount}</td>
                    <td style={{ padding:"12px 20px",fontSize:13,color:P.muted }}>{p.academicYear||"—"}</td>
                    <td style={{ padding:"12px 20px",fontSize:13,color:P.muted }}>{p.paymentMode||"—"}</td>
                    <td style={{ padding:"12px 20px" }}>
                      <span style={{ background:bg,color,fontSize:11,fontWeight:700,
                        padding:"3px 10px",borderRadius:20 }}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding:"12px 20px",fontSize:12,color:P.muted,
                      fontFamily:"'DM Mono',monospace" }}>
                      {fmtDate(p.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Leave History */}
      <div style={{ background:"#fff",borderRadius:20,border:`1px solid ${P.border}`,
        overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ padding:"18px 24px",borderBottom:`1px solid ${P.border}`,
          display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:16 }}>📄</span>
          <span style={{ fontSize:14,fontWeight:700,color:P.text }}>Leave History</span>
          <span style={{ marginLeft:"auto",fontSize:12,color:P.muted }}>
            {leaves.length} requests
          </span>
        </div>
        {leaves.length === 0 ? (
          <div style={{ padding:"32px",textAlign:"center",color:P.muted }}>
            <div style={{ fontSize:28,marginBottom:8 }}>📄</div>
            <div style={{ fontSize:13 }}>No leave requests found</div>
          </div>
        ) : (
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#F8FAFF" }}>
                {["Type","Reason","From","To","Days","Status"].map(h=>(
                  <th key={h} style={{ padding:"10px 20px",textAlign:"left",
                    fontSize:11,fontWeight:600,color:P.muted,textTransform:"uppercase",
                    letterSpacing:"0.06em",borderBottom:`1px solid ${P.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map((l,i) => {
                const { bg, color } = statusStyle(l.status);
                const days = Math.max(1, Math.ceil((new Date(l.toDate)-new Date(l.fromDate))/86400000)+1);
                return (
                  <tr key={l._id} style={{ background:i%2===0?"#fff":"#FAFBFF" }}>
                    <td style={{ padding:"12px 20px",fontSize:13,fontWeight:600,color:P.text }}>
                      {l.leaveType}
                    </td>
                    <td style={{ padding:"12px 20px",fontSize:12,color:P.muted,maxWidth:200 }}>
                      <div style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                        {l.reason}
                      </div>
                    </td>
                    <td style={{ padding:"12px 20px",fontSize:12,color:P.muted,
                      fontFamily:"'DM Mono',monospace" }}>{fmtDate(l.fromDate)}</td>
                    <td style={{ padding:"12px 20px",fontSize:12,color:P.muted,
                      fontFamily:"'DM Mono',monospace" }}>{fmtDate(l.toDate)}</td>
                    <td style={{ padding:"12px 20px",fontSize:13,fontWeight:600,color:P.text }}>
                      {days}d
                    </td>
                    <td style={{ padding:"12px 20px" }}>
                      <span style={{ background:bg,color,fontSize:11,fontWeight:700,
                        padding:"3px 10px",borderRadius:20 }}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;