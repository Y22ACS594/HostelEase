// src/pages/student/Dashboard.jsx
// Fully responsive — profile panel opens when MR/avatar is clicked on mobile OR desktop
import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth }           from "../../context/AuthContext";
import { getMyLeaves }       from "../../services/leaveService";
import { getMyProfile, getRoomStatus } from "../../services/studentService";
import { getUnreadCount }    from "../../services/notificationService";
import useIsMobile           from "../../hooks/useIsMobile";

if (!document.getElementById("sd-font")) {
  const l = document.createElement("link");
  l.id   = "sd-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

const P = {
  primary: "#2563EB", surface: "#F8FAFF", border: "#E8EEFF",
  text: "#0F1629", muted: "#6B7A99", sidebar: "#fff",
};

// ── SVG Icons ──
const IcoGrid  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcoRoom  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoEdit  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;
const IcoDoc   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoCard  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IcoBell  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoWrench= () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IcoClose = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoChevR = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoLogout= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const NAV = [
  { to: "/student/dashboard",     Icon: IcoGrid,   label: "Dashboard"    },
  { to: "/student/room-status",   Icon: IcoRoom,   label: "My Room"      },
  { to: "/student/apply-leave",   Icon: IcoEdit,   label: "Apply Leave"  },
  { to: "/student/leave-status",  Icon: IcoDoc,    label: "Leave Status" },
  { to: "/student/notifications", Icon: IcoBell,   label: "Notifications"},
  { to: "/student/issues",        Icon: IcoWrench, label: "My Issues"    },
];

const CARDS = [
  { to: "/student/room-status",  Icon: IcoRoom,  title: "My Room",      desc: "View room & bed details",    grad: "linear-gradient(135deg,#2563EB,#1D4ED8)", shadow: "rgba(37,99,235,0.3)" },
  { to: "/student/apply-leave",  Icon: IcoEdit,  title: "Apply Leave",  desc: "Submit a new leave request", grad: "linear-gradient(135deg,#7C3AED,#6D28D9)", shadow: "rgba(124,58,237,0.3)" },
  { to: "/student/leave-status", Icon: IcoDoc,   title: "Leave Status", desc: "Track your approvals",       grad: "linear-gradient(135deg,#059669,#047857)", shadow: "rgba(5,150,105,0.3)"  },
];

const avatarColors = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2"];
const avatarBg  = (n = "") => avatarColors[(n.charCodeAt(0) || 0) % avatarColors.length];
const initials  = (n = "") => n.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

// ── Profile Side Panel ──
function StudentPanel({ profile, room, leaves, unread, onClose, navigate, logout }) {
  const approved = leaves.filter(l => l.status === "Approved").length;
  const pending  = leaves.filter(l => l.status === "Pending").length;
  const INFO = [
    ["Roll Number", profile?.rollNumber], ["Department", profile?.department],
    ["Batch",       profile?.batch],      ["College",    profile?.collegeName],
    ["Phone",       profile?.phoneNumber],["Address",   profile?.address],
    ["Father",      profile?.fatherName], ["Parent Phone", profile?.parentContact],
  ].filter(([, v]) => v);

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(15,22,41,0.35)",
        backdropFilter: "blur(2px)", zIndex: 200,
      }}/>
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: Math.min(340, window.innerWidth - 20),
        background: "#fff", zIndex: 201,
        boxShadow: "-12px 0 40px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        fontFamily: "'Sora',sans-serif",
        animation: "sd-slide-in .25s ease",
      }}>
        <style>{`@keyframes sd-slide-in{from{transform:translateX(100%)}to{transform:none}}`}</style>

        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${P.border}`,
          background: `linear-gradient(135deg,${P.primary},#1D4ED8)` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>My Profile</span>
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff",
            }}><IcoClose/></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800, color: "#fff" }}>
              {initials(profile?.fullName || "S")}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{profile?.fullName || "Student"}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                Student · {profile?.department || ""}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          padding: "14px 16px", borderBottom: `1px solid ${P.border}`, gap: 8 }}>
          {[
            { label: "Leaves",   v: leaves.length, color: P.primary },
            { label: "Approved", v: approved,       color: "#059669" },
            { label: "Pending",  v: pending,        color: "#D97706" },
          ].map(({ label, v, color }) => (
            <div key={label} style={{ textAlign: "center", padding: "10px 4px", borderRadius: 10,
              background: P.surface, border: `1px solid ${P.border}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color }}>{v}</div>
              <div style={{ fontSize: 10, color: P.muted, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {room?.roomNumber && (
          <div style={{ margin: "12px 16px 0", padding: "12px 14px",
            borderRadius: 12, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.primary,
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
              🛏 Room Allocation
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
              {[["Room", room.roomNumber], ["Bed", room.bedNumber],
                ["Block", room.block || "A"], ["Floor", room.floor || "—"]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: P.muted }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.muted,
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Details</div>
          {INFO.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between",
              padding: "9px 0", borderBottom: `1px solid ${P.border}` }}>
              <span style={{ fontSize: 12, color: P.muted }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: P.text,
                textAlign: "right", maxWidth: 180, wordBreak: "break-word" }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "14px 16px", borderTop: `1px solid ${P.border}`,
          display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => { navigate("/student/notifications"); onClose(); }}
            style={{ width: "100%", padding: "10px", background: "#EFF6FF", color: P.primary,
              border: `1px solid ${P.border}`, borderRadius: 12,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Sora',sans-serif", minHeight: 44,
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Notifications</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {unread > 0 && <span style={{ background: P.primary, color: "#fff",
                fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "1px 6px" }}>{unread}</span>}
              <IcoChevR/>
            </div>
          </button>
          <button onClick={() => { navigate("/student/issues"); onClose(); }}
            style={{ width: "100%", padding: "10px", background: "#F5F3FF", color: "#7C3AED",
              border: "1px solid #DDD6FE", borderRadius: 12,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Sora',sans-serif", minHeight: 44,
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>My Issues</span><IcoChevR/>
          </button>
          <button onClick={() => { logout(); navigate("/login"); }}
            style={{ width: "100%", padding: "10px", background: "#FEF2F2", color: "#DC2626",
              border: "1px solid #FCA5A5", borderRadius: 12,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Sora',sans-serif", minHeight: 44,
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <IcoLogout/> Logout
          </button>
        </div>
      </div>
    </>
  );
}

// ══ MAIN DASHBOARD ══
const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const location         = useLocation();
  const navigate         = useNavigate();
  const isMobile         = useIsMobile();

  const [leaves,    setLeaves]    = useState([]);
  const [profile,   setProfile]   = useState(null);
  const [room,      setRoom]      = useState(null);
  const [unread,    setUnread]    = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    Promise.all([
      getMyLeaves().then(r => setLeaves(r.data ?? [])).catch(() => {}),
      getMyProfile().then(p => setProfile(p)).catch(() => {}),
      getRoomStatus().then(r => setRoom(r)).catch(() => {}),
      getUnreadCount().then(r => setUnread(r.data?.unreadCount || 0)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Listen for the custom event dispatched by MobileTopBar
  useEffect(() => {
    const handler = () => setPanelOpen(true);
    window.addEventListener("openProfilePanel", handler);
    return () => window.removeEventListener("openProfilePanel", handler);
  }, []);

  const name     = user?.name || profile?.fullName || "Student";
  const approved = leaves.filter(l => l.status === "Approved").length;
  const pending  = leaves.filter(l => l.status === "Pending").length;

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: "'Sora',sans-serif",
      background: P.surface, color: P.text,
    }}>
      <style>{`
        .sd-nav-link:hover { background:#F0F5FF!important; color:${P.primary}!important; }
        .sd-card:hover { transform:translateY(-4px)!important; }
        @keyframes sd-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <aside style={{
          width: 230, background: P.sidebar,
          borderRight: `1px solid ${P.border}`,
          padding: "24px 14px", display: "flex", flexDirection: "column",
          flexShrink: 0, boxShadow: "2px 0 12px rgba(37,99,235,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, padding: "0 6px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#2563EB,#7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏠</div>
            <span style={{ fontSize: 17, fontWeight: 800, color: P.text, letterSpacing: "-0.3px" }}>HostelEase</span>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
            {NAV.map(({ to, Icon, label }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} className="sd-nav-link" style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 12px", borderRadius: 11, textDecoration: "none",
                  transition: "all .15s",
                  background: active ? "#EFF6FF" : "transparent",
                  color: active ? P.primary : P.muted,
                  fontWeight: active ? 700 : 400,
                  borderLeft: active ? `3px solid ${P.primary}` : "3px solid transparent",
                  fontSize: 13,
                }}>
                  <Icon/>{label}
                </Link>
              );
            })}
          </nav>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: P.muted,
              textTransform: "uppercase", letterSpacing: "0.09em",
              marginBottom: 6, paddingLeft: 6 }}>Logged in as</div>
            <button onClick={() => setPanelOpen(true)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12, cursor: "pointer",
              background: "#F0F5FF", border: `1px solid ${P.border}`,
              textAlign: "left", transition: "background .14s", fontFamily: "'Sora',sans-serif",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#E0EAFF"}
              onMouseLeave={e => e.currentTarget.style.background = "#F0F5FF"}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg,${avatarBg(name)},${avatarBg(name)}bb)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {initials(name)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: P.text,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                <div style={{ fontSize: 10, color: P.muted }}>View details →</div>
              </div>
            </button>
          </div>
        </aside>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        padding: isMobile ? "72px 14px 80px" : "28px 36px",
      }}>
        {/* Desktop top bar */}
        {!isMobile && (
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", marginBottom: 28,
            animation: "sd-fade .4s ease",
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: P.text, letterSpacing: "-0.5px" }}>
                Welcome back, {name} 👋
              </h1>
              <p style={{ margin: "5px 0 0", color: P.muted, fontSize: 13 }}>{todayStr}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => navigate("/student/notifications")}
                style={{ position: "relative", width: 40, height: 40, borderRadius: 12,
                  background: "#fff", border: `1.5px solid ${P.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: P.muted, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <IcoBell/>
                {unread > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4,
                    minWidth: 17, height: 17, padding: "0 4px",
                    background: "#DC2626", color: "#fff", fontSize: 10,
                    fontWeight: 700, borderRadius: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #fff" }}>{unread > 99 ? "99+" : unread}</span>
                )}
              </button>
              <button onClick={() => setPanelOpen(true)} style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "6px 14px 6px 6px",
                background: "#fff", border: `1.5px solid ${P.border}`,
                borderRadius: 100, cursor: "pointer",
                fontFamily: "'Sora',sans-serif",
              }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%",
                  background: `linear-gradient(135deg,${avatarBg(name)},${avatarBg(name)}bb)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: "#fff" }}>
                  {initials(name)}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: P.text }}>{name}</div>
                  <div style={{ fontSize: 10, color: P.muted }}>Student</div>
                </div>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke={P.muted} strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Mobile welcome strip */}
        {isMobile && (
          <div style={{ marginBottom: 18, animation: "sd-fade .4s ease" }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: P.text }}>
              Hey, {name.split(" ")[0]} 👋
            </h2>
            <p style={{ margin: "4px 0 0", color: P.muted, fontSize: 12 }}>{todayStr}</p>
          </div>
        )}

        {/* Stats strip */}
        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
            gap: isMobile ? 10 : 14, marginBottom: isMobile ? 16 : 24 }}>
            {[
              { label: "Total Leaves",  v: leaves.length, color: P.primary,  bg: "#EFF6FF" },
              { label: "Approved",      v: approved,       color: "#059669",  bg: "#ECFDF5" },
              { label: "Pending",       v: pending,        color: "#D97706",  bg: "#FEF9C3" },
              { label: "Notifications", v: unread,         color: "#DC2626",  bg: "#FEF2F2" },
            ].map(({ label, v, color }) => (
              <div key={label} style={{
                background: "#fff", border: `1px solid ${P.border}`, borderRadius: 14,
                padding: isMobile ? "12px 10px" : "16px 18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color }}>{v}</div>
                <div style={{ fontSize: isMobile ? 10 : 12, color: P.muted, marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
          gap: isMobile ? 12 : 18, marginBottom: 24,
        }}>
          {CARDS.map(({ to, Icon, title, desc, grad, shadow }) => (
            <Link key={to} to={to} className="sd-card" style={{
              background: grad, borderRadius: 16,
              padding: isMobile ? "18px 14px" : "24px 20px",
              textDecoration: "none", color: "#fff",
              boxShadow: `0 8px 24px ${shadow}`,
              transition: "all .22s", display: "block",
            }}>
              <div style={{ opacity: 0.85, marginBottom: isMobile ? 8 : 12 }}><Icon/></div>
              <h3 style={{ margin: 0, fontSize: isMobile ? 13 : 15, fontWeight: 700, marginBottom: 4 }}>{title}</h3>
              <p style={{ margin: 0, fontSize: isMobile ? 11 : 12, color: "rgba(255,255,255,0.68)" }}>{desc}</p>
            </Link>
          ))}
        </div>

        {/* Mobile room quick access */}
        {isMobile && room?.roomNumber && (
          <div style={{
            background: "#fff", border: `1px solid ${P.border}`, borderRadius: 14,
            padding: "14px 16px", marginBottom: 16,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.primary,
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              🛏 My Room
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["Room", room.roomNumber], ["Bed", room.bedNumber]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: P.muted }}>{k}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: P.primary }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop recent leaves */}
        {!isMobile && !loading && leaves.length > 0 && (
          <div style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 16,
            padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: P.text }}>Recent Leave Requests</h3>
              <Link to="/student/leave-status" style={{ fontSize: 13, color: P.primary, fontWeight: 600, textDecoration: "none" }}>View all →</Link>
            </div>
            {leaves.slice(0, 3).map((l) => {
              const st = l.status === "Approved" ? { color: "#059669", bg: "#ECFDF5" }
                : l.status === "Rejected" ? { color: "#DC2626", bg: "#FEF2F2" }
                : { color: "#D97706", bg: "#FEF9C3" };
              return (
                <div key={l._id} style={{ display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 0", borderBottom: `1px solid ${P.border}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{l.leaveType} Leave</div>
                    <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>
                      {l.fromDate?.slice(0,10)} → {l.toDate?.slice(0,10)}
                    </div>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: st.bg, color: st.color }}>{l.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {panelOpen && (
        <StudentPanel
          profile={profile} room={room} leaves={leaves}
          unread={unread} onClose={() => setPanelOpen(false)}
          navigate={navigate} logout={logout}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
