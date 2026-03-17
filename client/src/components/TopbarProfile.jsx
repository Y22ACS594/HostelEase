// components/TopbarProfile.jsx
// Works on BOTH dark (student sidebar) and light (warden) backgrounds
// Pass theme="light" or theme="dark" prop — defaults auto by user role
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUnreadCount } from "../services/notificationService";

const GRADS = [
  ["#667EEA","#764BA2"],["#F093FB","#F5576C"],["#4FACFE","#00F2FE"],
  ["#43E97B","#38F9D7"],["#FA709A","#FEE140"],["#A18CD1","#FBC2EB"],
  ["#FD746C","#FF9068"],["#56CCF2","#2F80ED"],
];
const getGrad  = (n="") => GRADS[(n.charCodeAt(0)||0) % GRADS.length];
const initials = (n="") => n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";

function MenuItem({ icon, label, badge, danger, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:"100%",display:"flex",alignItems:"center",gap:10,
        padding:"9px 16px",border:"none",cursor:"pointer",
        background:hov?(danger?"#FEF2F2":"#F0F7FF"):"transparent",
        fontFamily:"inherit",transition:"background .1s" }}>
      <span style={{ fontSize:15 }}>{icon}</span>
      <span style={{ fontSize:13,fontWeight:500,
        color:danger?"#DC2626":"#0F1629",flex:1,textAlign:"left" }}>
        {label}
      </span>
      {badge>0 && (
        <span style={{ background:"#DC2626",color:"#fff",fontSize:10,
          fontWeight:700,padding:"2px 6px",borderRadius:20,minWidth:18,textAlign:"center" }}>
          {badge>99?"99+":badge}
        </span>
      )}
    </button>
  );
}

export default function TopbarProfile({ theme }) {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const dropRef           = useRef(null);
  const [unread,   setUnread]   = useState(0);
  const [showDrop, setShowDrop] = useState(false);

  const name     = user?.name  || "User";
  const role     = user?.role  ? user.role.charAt(0).toUpperCase()+user.role.slice(1) : "Guest";
  const avatar   = user?.avatar || "";
  const [c1, c2] = getGrad(name);

  // Auto-detect theme from role if not passed
  const isDark = theme === "dark" || (theme === undefined && user?.role === "student");

  const notifPage = user?.role==="warden" ? "/warden/notifications" : "/student/notifications";

  // Bell & pill styles depend on theme
  const pillBg     = isDark ? "rgba(255,255,255,0.10)" : "#fff";
  const pillBorder = isDark ? "rgba(255,255,255,0.15)" : "#E5E7EB";
  const textColor  = isDark ? "#fff" : "#111827";
  const subColor   = isDark ? "rgba(255,255,255,0.5)" : "#6B7280";
  const chevronC   = isDark ? "rgba(255,255,255,0.5)" : "#9CA3AF";
  const bellStroke = isDark ? "rgba(255,255,255,0.85)" : "#374151";

  useEffect(() => {
    const go = async () => {
      try { const r = await getUnreadCount(); setUnread(r.data.unreadCount||0); } catch {}
    };
    go();
    const iv = setInterval(go, 20_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div style={{ display:"inline-flex",alignItems:"center",gap:8,fontFamily:"'Inter',sans-serif" }}>

      {/* ── Bell ── */}
      <button onClick={()=>navigate(notifPage)} title="Notifications"
        style={{ position:"relative",width:42,height:42,borderRadius:"50%",
          background:pillBg, border:`1.5px solid ${pillBorder}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          cursor:"pointer",transition:"all .15s",flexShrink:0,
          boxShadow: isDark?"none":"0 1px 4px rgba(0,0,0,0.08)" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke={bellStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{ position:"absolute",top:-4,right:-4,
            minWidth:19,height:19,padding:"0 4px",
            background:"#DC2626",color:"#fff",fontSize:10,fontWeight:700,
            borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",
            border:"2px solid #fff",lineHeight:1,
            boxShadow:"0 2px 6px rgba(220,38,38,0.5)" }}>
            {unread>99?"99+":unread}
          </span>
        )}
      </button>

      {/* ── Avatar pill ── */}
      <div ref={dropRef} style={{ position:"relative" }}>
        <button onClick={()=>setShowDrop(p=>!p)}
          style={{ display:"flex",alignItems:"center",gap:10,
            padding:"5px 12px 5px 5px",
            background: showDrop ? (isDark?"rgba(255,255,255,0.18)":pillBg) : pillBg,
            border:`1.5px solid ${showDrop?(isDark?"rgba(255,255,255,0.35)":"#111827"):pillBorder}`,
            borderRadius:100,cursor:"pointer",
            boxShadow: isDark?"none":"0 1px 6px rgba(0,0,0,0.08)",
            transition:"all .15s",outline:"none" }}>

          {avatar ? (
            <img src={avatar} alt={name}
              style={{ width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0,
                border:"2px solid rgba(255,255,255,0.3)" }}/>
          ) : (
            <div style={{ width:32,height:32,borderRadius:"50%",
              background:`linear-gradient(135deg,${c1},${c2})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:12,fontWeight:800,color:"#fff",
              boxShadow:`0 2px 8px ${c1}55`,flexShrink:0 }}>
              {initials(name)}
            </div>
          )}

          <div style={{ textAlign:"left",lineHeight:1.25 }}>
            <div style={{ fontSize:13,fontWeight:700,color:textColor,
              whiteSpace:"nowrap",maxWidth:120,
              overflow:"hidden",textOverflow:"ellipsis" }}>
              {name}
            </div>
            <div style={{ fontSize:11,color:subColor,fontWeight:400,marginTop:1 }}>
              {role}
            </div>
          </div>

          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke={chevronC} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginLeft:2,transition:"transform .2s",
              transform:showDrop?"rotate(180deg)":"none" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Dropdown */}
        {showDrop && (
          <div style={{ position:"absolute",top:"calc(100% + 8px)",right:0,
            background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:16,minWidth:210,
            boxShadow:"0 20px 60px rgba(0,0,0,0.15)",overflow:"hidden",zIndex:9999,
            animation:"tp-fade .15s ease" }}>
            <style>{`@keyframes tp-fade{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <div style={{ padding:"14px 16px",borderBottom:"1px solid #F3F4F6",
              background:"linear-gradient(135deg,#F8FAFF,#EFF6FF)",
              display:"flex",alignItems:"center",gap:10 }}>
              {avatar ? (
                <img src={avatar} alt={name}
                  style={{ width:38,height:38,borderRadius:"50%",objectFit:"cover",
                    border:"2px solid #E5E7EB",flexShrink:0 }}/>
              ) : (
                <div style={{ width:38,height:38,borderRadius:"50%",
                  background:`linear-gradient(135deg,${c1},${c2})`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,fontWeight:800,color:"#fff",flexShrink:0 }}>
                  {initials(name)}
                </div>
              )}
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:"#111827" }}>{name}</div>
                <div style={{ fontSize:11,color:"#6B7280",marginTop:1 }}>{role}</div>
              </div>
            </div>

            <div style={{ padding:"6px 0" }}>
              <MenuItem icon="🔔" label="Notifications" badge={unread}
                onClick={()=>{setShowDrop(false);navigate(notifPage);}}/>
              {user?.role==="warden" && <>
                <MenuItem icon="🗂️" label="Audit Logs"
                  onClick={()=>{setShowDrop(false);navigate("/warden/audit-logs");}}/>
                <MenuItem icon="🔧" label="Issues"
                  onClick={()=>{setShowDrop(false);navigate("/warden/issues");}}/>
              </>}
              {user?.role==="student" && (
                <MenuItem icon="🔧" label="My Issues"
                  onClick={()=>{setShowDrop(false);navigate("/student/issues");}}/>
              )}
              <div style={{ height:1,background:"#F3F4F6",margin:"4px 12px" }}/>
              <MenuItem icon="🚪" label="Logout" danger
                onClick={()=>{setShowDrop(false);logout();navigate("/login");}}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}