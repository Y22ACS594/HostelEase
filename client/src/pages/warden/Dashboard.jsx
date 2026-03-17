import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TopbarProfile from "../../components/TopbarProfile";


const CARDS = [
  { to:"/warden/add-student",    icon:"👩‍🎓", title:"Add Student",     desc:"Register new hostel student"       },
  { to:"/warden/students",       icon:"📋", title:"Students List",    desc:"View all registered students"      },
  { to:"/warden/create-room",    icon:"🏠", title:"Create Rooms",     desc:"Add and manage hostel rooms"        },
  { to:"/warden/room-allocation",icon:"🛏️", title:"Room Allocation",  desc:"Assign students to beds"            },
  { to:"/warden/leaves",         icon:"📄", title:"Leave Approvals",  desc:"Approve or reject leave requests"  },
  { to:"/warden/payments",       icon:"💳", title:"Payments",         desc:"View hostel fee payments"           },
  { to:"/warden/notifications",  icon:"🔔", title:"Notifications",    desc:"All system notifications"          },
  { to:"/warden/audit-logs",     icon:"🗂️", title:"Audit Logs",       desc:"Track all warden activity"         },
];

function DashCard({ icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:"#fff", borderRadius:20, padding:"24px 20px",
        border:`1.5px solid ${hov?"#2563EB":"#E8EEFF"}`,
        boxShadow: hov
          ? "0 12px 32px rgba(37,99,235,0.15)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transition:"all .2s",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        cursor:"pointer",
      }}>
      <div style={{ fontSize:32, marginBottom:14 }}>{icon}</div>
      <h3 style={{ margin:0,fontSize:14,fontWeight:700,color:"#0F1629",marginBottom:6 }}>{title}</h3>
      <p style={{ margin:0,fontSize:12,color:"#6B7A99",lineHeight:1.4 }}>{desc}</p>
    </div>
  );
}

const WardenDashboard = () => {
  const { user } = useAuth();

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday:"long", day:"numeric", month:"long", year:"numeric",
  });

  return (
    <div style={{
      fontFamily:"'Sora',sans-serif",
      background:"linear-gradient(135deg,#F8FAFF 0%,#EFF6FF 100%)",
      minHeight:"100vh", padding:24,
    }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:32, flexWrap:"wrap", gap:12,
        background:"#fff", borderRadius:20, padding:"16px 24px",
        border:"1px solid #E8EEFF",
        boxShadow:"0 2px 12px rgba(37,99,235,0.06)",
      }}>
        <div>
          <div style={{ fontSize:11,fontWeight:600,color:"#2563EB",
            letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>
            HostelEase · Warden Portal
          </div>
          <h1 style={{ margin:0,fontSize:22,fontWeight:700,color:"#0F1629" }}>
            🏨 Warden Dashboard
          </h1>
          <p style={{ margin:"4px 0 0",fontSize:13,color:"#6B7A99" }}>
            Welcome, {user?.name||"Warden"} · {todayStr}
          </p>
        </div>

        {/* ✅ Bell + Avatar + Name + Logout tick — all in one */}
        <TopbarProfile />
      </div>

      {/* Dashboard grid */}
      <div style={{ display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
        {CARDS.map(({ to, icon, title, desc }) => (
          <Link key={to} to={to} style={{ textDecoration:"none" }}>
            <DashCard icon={icon} title={title} desc={desc}/>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WardenDashboard;