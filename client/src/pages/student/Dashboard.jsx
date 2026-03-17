import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TopbarProfile from "../../components/TopbarProfile";
import { getMyLeaves } from "../../services/leaveService";
import { getMyPayments } from "../../services/paymentService";

/* ── inject font ── */
if (!document.getElementById("sd2-font")) {
  const l = document.createElement("link");
  l.id   = "sd2-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

/* ── Nav icon SVGs ────────────────────────────────────── */
const IconGrid = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconRoom = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconLeave = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const IconDoc = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconCard = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IconBell = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const NAV = [
  { to:"/student/dashboard",     Icon:IconGrid,  label:"Dashboard"    },
  { to:"/student/room-status",   Icon:IconRoom,  label:"My Room"      },
  { to:"/student/apply-leave",   Icon:IconLeave, label:"Apply Leave"  },
  { to:"/student/leave-status",  Icon:IconDoc,   label:"Leave Status" },
  { to:"/student/payments",      Icon:IconCard,  label:"Payments"     },
  { to:"/student/notifications", Icon:IconBell,  label:"Notifications"},
];

const CARDS = [
  { to:"/student/room-status",  Icon:IconRoom,  title:"My Room",      desc:"View room & bed details",    grad:"linear-gradient(135deg,#2563EB,#1D4ED8)" },
  { to:"/student/apply-leave",  Icon:IconLeave, title:"Apply Leave",  desc:"Submit a new leave request", grad:"linear-gradient(135deg,#7C3AED,#6D28D9)" },
  { to:"/student/leave-status", Icon:IconDoc,   title:"Leave Status", desc:"Track your approvals",       grad:"linear-gradient(135deg,#059669,#047857)" },
  { to:"/student/payments",     Icon:IconCard,  title:"Payments",     desc:"Fee & transaction history",  grad:"linear-gradient(135deg,#D97706,#B45309)" },
];

const statusColors = {
  Approved:{ bg:"rgba(5,150,105,0.18)",  color:"#34D399" },
  Rejected:{ bg:"rgba(220,38,38,0.18)",  color:"#F87171" },
  Pending: { bg:"rgba(217,119,6,0.18)",  color:"#FBBF24" },
};

const StudentDashboard = () => {
  const { user }   = useAuth();
  const location   = useLocation();
  const [leaves,   setLeaves]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const lr = await getMyLeaves();
        setLeaves(lr.data ?? []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday:"long", day:"numeric", month:"long", year:"numeric",
  });

  const avatarInitial = (user?.name||"S").charAt(0).toUpperCase();

  return (
    <div style={{ display:"flex",height:"100vh",fontFamily:"'Sora',sans-serif",
      background:"#0b1020",color:"#fff" }}>

      {/* ══ SIDEBAR ════════════════════════════════════════════ */}
      <aside style={{ width:230,background:"linear-gradient(180deg,#0f172a,#020617)",
        padding:"28px 16px",display:"flex",flexDirection:"column",
        borderRight:"1px solid rgba(255,255,255,0.07)",flexShrink:0 }}>

        {/* Logo */}
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:36,padding:"0 4px" }}>
          <div style={{ fontSize:22 }}>🏠</div>
          <span style={{ fontSize:19,fontWeight:800,
            background:"linear-gradient(90deg,#38bdf8,#a78bfa)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            backgroundClip:"text",letterSpacing:"-0.3px" }}>
            HostelEase
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display:"flex",flexDirection:"column",gap:4,flex:1 }}>
          {NAV.map(({ to, Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                style={{ display:"flex",alignItems:"center",gap:12,
                  padding:"11px 14px",borderRadius:12,textDecoration:"none",
                  transition:"all .18s",
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,0.1)" : "none",
                  fontWeight: active ? 600 : 400 }}>
                <Icon/>
                <span style={{ fontSize:14 }}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user pill */}
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",
            textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8,paddingLeft:4 }}>
            Logged in as
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
            borderRadius:12,background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.08)" }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name}
                style={{ width:30,height:30,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>
            ) : (
              <div style={{ width:30,height:30,borderRadius:"50%",
                background:"linear-gradient(135deg,#2563EB,#7C3AED)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,fontWeight:700,color:"#fff",flexShrink:0 }}>
                {avatarInitial}
              </div>
            )}
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12,fontWeight:600,color:"#fff",
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                {user?.name||"Student"}
              </div>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.35)" }}>Student</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ═══════════════════════════════════════════════ */}
      <main style={{ flex:1,padding:"36px 44px",overflowY:"auto" }}>

        {/* Topbar — NO stat cards, just title + TopbarProfile */}
        <div style={{ display:"flex",alignItems:"flex-start",
          justifyContent:"space-between",marginBottom:40 }}>
          <div>
            <h1 style={{ margin:0,fontSize:30,fontWeight:800,letterSpacing:"-0.5px" }}>
            {user?.name||"Student"}  👋
            </h1>
            <p style={{ margin:"6px 0 0",color:"rgba(255,255,255,0.45)",fontSize:14 }}>
              {user?.name||"Student"} · {todayStr}
            </p>
          </div>
          <TopbarProfile />
        </div>

        {/* ── Action Cards ── */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:36 }}>
          {CARDS.map(({ to, Icon, title, desc, grad }) => (
            <Link key={to} to={to}
              style={{ background:grad,borderRadius:20,padding:"28px 22px",
                textDecoration:"none",color:"#fff",
                boxShadow:"0 12px 32px rgba(0,0,0,0.35)",
                transition:"all .25s",display:"block" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow="0 20px 48px rgba(0,0,0,0.5)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.35)";}}>
              <div style={{ opacity:0.85,marginBottom:14 }}><Icon/></div>
              <h3 style={{ margin:0,fontSize:16,fontWeight:700,marginBottom:6 }}>{title}</h3>
              <p style={{ margin:0,fontSize:12,color:"rgba(255,255,255,0.65)" }}>{desc}</p>
            </Link>
          ))}
        </div>

        {/* ── Recent Leave Requests ── */}
        <div style={{ background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,overflow:"hidden" }}>
          <div style={{ padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.07)",
            display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <h3 style={{ margin:0,fontSize:15,fontWeight:700 }}>Recent Leave Requests</h3>
            <Link to="/student/leave-status"
              style={{ fontSize:12,color:"rgba(99,102,241,0.9)",textDecoration:"none",fontWeight:600 }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:13 }}>
              ⏳ Loading…
            </div>
          ) : leaves.length === 0 ? (
            <div style={{ padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize:32,marginBottom:8 }}>📄</div>
              <div style={{ fontSize:13 }}>No leave requests yet</div>
            </div>
          ) : (
            leaves.slice(0,5).map((l, i) => {
              const sc = statusColors[l.status] || statusColors.Pending;
              return (
                <div key={l._id}
                  style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"14px 24px",
                    borderBottom:i<Math.min(leaves.length,5)-1?"1px solid rgba(255,255,255,0.05)":"none",
                    transition:"background .12s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div>
                    <div style={{ fontSize:14,fontWeight:600,color:"#fff" }}>
                      {l.leaveType} Leave
                    </div>
                    <div style={{ fontSize:12,color:"rgba(255,255,255,0.38)",marginTop:3 }}>
                      {String(l.fromDate).slice(0,10)} → {String(l.toDate).slice(0,10)}
                    </div>
                  </div>
                  <span style={{ background:sc.bg,color:sc.color,
                    fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20 }}>
                    {l.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;