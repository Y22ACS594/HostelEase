// components/NotificationBell.jsx
// Full SaaS real-time notification bell — works for both student & warden
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getNotifications, getUnreadCount,
  markAsRead, markAllRead, deleteNotification,
} from "../services/notificationService";

/* ── Inject font ─────────────────────────────────────────── */
if (!document.getElementById("notif-font")) {
  const l = document.createElement("link");
  l.id   = "notif-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

/* ── Type → icon / color / category ────────────────────── */
const TYPE_META = {
  LEAVE_APPROVED:     { icon:"✅", color:"#059669", bg:"#ECFDF5", label:"Leave"     },
  LEAVE_REJECTED:     { icon:"❌", color:"#DC2626", bg:"#FEF2F2", label:"Leave"     },
  LEAVE_APPLIED:      { icon:"📄", color:"#2563EB", bg:"#EFF6FF", label:"Leave"     },
  ROOM_ALLOCATED:     { icon:"🏠", color:"#7C3AED", bg:"#F5F3FF", label:"Room"      },
  ROOM_DEALLOCATED:   { icon:"🚪", color:"#D97706", bg:"#FFFBEB", label:"Room"      },
  PAYMENT_CONFIRMED:  { icon:"💳", color:"#059669", bg:"#ECFDF5", label:"Payment"   },
  PAYMENT_RECEIVED:   { icon:"💰", color:"#059669", bg:"#ECFDF5", label:"Payment"   },
  STUDENT_REGISTERED: { icon:"🎉", color:"#2563EB", bg:"#EFF6FF", label:"Account"   },
  COMPLAINT_RESOLVED: { icon:"🔧", color:"#6366F1", bg:"#EEF2FF", label:"Complaint" },
  GENERAL:            { icon:"🔔", color:"#D97706", bg:"#FFFBEB", label:"General"   },
};
const getMeta = (type) => TYPE_META[type] ?? TYPE_META.GENERAL;

/* ── Time ago ───────────────────────────────────────────── */
const timeAgo = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff/86400)}d ago`;
  return new Date(d).toLocaleDateString();
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function NotificationBell() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const panelRef  = useRef(null);

  const [open,        setOpen]        = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const [unread,      setUnread]      = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [activeFilter,setActiveFilter]= useState("All");

  const role     = user?.role ?? "student";
  const viewPage = role === "warden" ? "/warden/notifications" : "/student/notifications";

  /* ── Lightweight unread count poll ─────────────────── */
  const pollCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnread(res.data.unreadCount);
    } catch {}
  }, []);

  useEffect(() => {
    pollCount();
    const iv = setInterval(pollCount, 20_000); // every 20s
    return () => clearInterval(iv);
  }, [pollCount]);

  /* ── Full fetch when panel opens ──────────────────── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ limit: 30 });
      setNotifs(res.data.notifications ?? []);
      setUnread(res.data.unreadCount ?? 0);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (open) fetchAll(); }, [open]);

  /* ── Outside click close ───────────────────────────── */
  useEffect(() => {
    const h = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Mark one read ─────────────────────────────────── */
  const handleRead = async (n) => {
    if (!n.isRead) {
      await markAsRead(n._id);
      setNotifs((p) => p.map((x) => x._id === n._id ? { ...x, isRead: true } : x));
      setUnread((c) => Math.max(0, c - 1));
    }
  };

  /* ── Mark all read ─────────────────────────────────── */
  const handleMarkAll = async () => {
    await markAllRead();
    setNotifs((p) => p.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
  };

  /* ── Delete one ────────────────────────────────────── */
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifs((p) => p.filter((x) => x._id !== id));
  };

  /* ── Filtered list ─────────────────────────────────── */
  const FILTERS  = ["All", "Unread", "Leave", "Room", "Payment"];
  const filtered = notifs.filter((n) => {
    if (activeFilter === "All")    return true;
    if (activeFilter === "Unread") return !n.isRead;
    return getMeta(n.type).label === activeFilter;
  });

  const P = {
    primary:"#2563EB", surface:"#F8FAFF", border:"#E8EEFF",
    text:"#0F1629", muted:"#6B7A99",
  };

  return (
    <div style={{ position:"relative", fontFamily:"'Sora',sans-serif" }} ref={panelRef}>

      {/* ── Bell Button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ position:"relative", padding:"8px 10px", background:open?"#EFF6FF":"none",
          border:`1.5px solid ${open?P.primary:P.border}`,
          borderRadius:12, cursor:"pointer", display:"flex", alignItems:"center",
          transition:"all .15s" }}
        aria-label="Notifications"
      >
        <span style={{ fontSize:18, lineHeight:1 }}>🔔</span>
        {unread > 0 && (
          <span style={{ position:"absolute", top:-6, right:-6,
            minWidth:18, height:18, padding:"0 4px",
            background:"#DC2626", color:"#fff",
            fontSize:10, fontWeight:700, borderRadius:20,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 6px rgba(220,38,38,0.45)",
            animation:"notif-pulse 2s infinite" }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* ── Pulse animation ── */}
      <style>{`@keyframes notif-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)",
          width:380, maxWidth:"95vw", background:"#fff",
          border:`1px solid ${P.border}`, borderRadius:20,
          boxShadow:"0 24px 64px rgba(15,22,41,0.18)",
          zIndex:9999, overflow:"hidden" }}>

          {/* Header */}
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${P.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background:"#FAFBFF" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:P.text }}>Notifications</div>
              {unread > 0 && (
                <div style={{ fontSize:11, color:P.muted, marginTop:1 }}>
                  {unread} unread message{unread > 1 ? "s" : ""}
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              {unread > 0 && (
                <button onClick={handleMarkAll}
                  style={{ fontSize:11, color:P.primary, fontWeight:600,
                    background:"#EFF6FF", border:"none", padding:"5px 10px",
                    borderRadius:8, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
                  ✓ All read
                </button>
              )}
              <button onClick={() => { setOpen(false); navigate(viewPage); }}
                style={{ fontSize:11, color:P.muted, background:"#F1F5F9",
                  border:"none", padding:"5px 10px", borderRadius:8,
                  cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
                View all →
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display:"flex", gap:4, padding:"10px 12px",
            borderBottom:`1px solid ${P.border}`, overflowX:"auto" }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ padding:"4px 12px", borderRadius:20, border:"none",
                  background:activeFilter===f ? P.primary : "#F1F5F9",
                  color:activeFilter===f ? "#fff" : P.muted,
                  fontSize:11, fontWeight:600, cursor:"pointer",
                  fontFamily:"'Sora',sans-serif", whiteSpace:"nowrap",
                  transition:"all .12s" }}>
                {f}
                {f === "Unread" && unread > 0 && (
                  <span style={{ marginLeft:4, background:activeFilter===f?"rgba(255,255,255,0.35)":"#DC2626",
                    color:"#fff", fontSize:10, borderRadius:10, padding:"1px 5px" }}>
                    {unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight:360, overflowY:"auto" }}>
            {loading ? (
              <div style={{ padding:"40px 20px", textAlign:"center", color:P.muted }}>
                <div style={{ fontSize:22, marginBottom:6 }}>⏳</div>
                <div style={{ fontSize:12 }}>Loading…</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:"40px 20px", textAlign:"center", color:P.muted }}>
                <div style={{ fontSize:32, marginBottom:6 }}>🔕</div>
                <div style={{ fontSize:13, fontWeight:600 }}>No notifications</div>
                <div style={{ fontSize:11, marginTop:2 }}>
                  {activeFilter !== "All" ? `No ${activeFilter.toLowerCase()} notifications` : "You're all caught up!"}
                </div>
              </div>
            ) : filtered.map((n) => {
              const { icon, color, bg } = getMeta(n.type);
              return (
                <div key={n._id}
                  onClick={() => handleRead(n)}
                  style={{ display:"flex", gap:10, padding:"12px 14px",
                    background:n.isRead ? "#fff" : "#F0F7FF",
                    borderBottom:`1px solid ${P.border}`,
                    cursor:"pointer", transition:"background .12s",
                    position:"relative" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = n.isRead ? "#F8FAFF" : "#E8F4FF"}
                  onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? "#fff" : "#F0F7FF"}>

                  {/* Icon */}
                  <div style={{ width:36, height:36, borderRadius:10, background:bg,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16, flexShrink:0 }}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:6 }}>
                      <div style={{ fontSize:12, fontWeight:n.isRead ? 500 : 700, color:P.text,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {n.title}
                      </div>
                      {!n.isRead && (
                        <span style={{ width:7, height:7, borderRadius:"50%",
                          background:"#2563EB", flexShrink:0, marginTop:3 }}/>
                      )}
                    </div>
                    <div style={{ fontSize:11, color:P.muted, marginTop:2,
                      overflow:"hidden", display:"-webkit-box",
                      WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize:10, color:"#9CA3AF", marginTop:4,
                      display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ color, fontWeight:600, fontSize:10 }}>
                        {getMeta(n.type).label}
                      </span>
                      · {timeAgo(n.createdAt)}
                    </div>
                  </div>

                  {/* Delete */}
                  <button onClick={(e) => handleDelete(e, n._id)}
                    style={{ position:"absolute", top:8, right:8,
                      background:"none", border:"none", cursor:"pointer",
                      color:"#D1D5DB", fontSize:14, padding:"2px 4px",
                      borderRadius:6, opacity:0 }}
                    className="notif-delete-btn">
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div style={{ padding:"10px 14px", borderTop:`1px solid ${P.border}`,
              background:"#FAFBFF", textAlign:"center" }}>
              <button onClick={() => { setOpen(false); navigate(viewPage); }}
                style={{ fontSize:12, color:P.primary, fontWeight:600,
                  background:"none", border:"none", cursor:"pointer",
                  fontFamily:"'Sora',sans-serif" }}>
                See all notifications →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Show delete btn on hover via CSS */}
      <style>{`
        div:hover > .notif-delete-btn { opacity: 1 !important; }
        .notif-delete-btn:hover { background: #FEE2E2 !important; color: #DC2626 !important; }
      `}</style>
    </div>
  );
}