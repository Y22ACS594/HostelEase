// src/pages/warden/Notifications.jsx — Fully responsive
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications, getUnreadCount,
  markAsRead, markAllRead, deleteNotification, clearAllNotifications,
} from "../../services/notificationService";
import useIsMobile from "../../hooks/useIsMobile";

if (!document.getElementById("wn-font")) {
  const l = document.createElement("link");
  l.id = "wn-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

const P = { primary: "#059669", surface: "#F0FDF4", border: "#D1FAE5", text: "#0F1629", muted: "#6B7A99" };

const TYPE_META = {
  LEAVE_APPLIED:      { icon: "📄", color: "#2563EB", bg: "#EFF6FF", label: "Leave"   },
  LEAVE_APPROVED:     { icon: "✅", color: "#059669", bg: "#ECFDF5", label: "Leave"   },
  LEAVE_REJECTED:     { icon: "❌", color: "#DC2626", bg: "#FEF2F2", label: "Leave"   },
  ROOM_ALLOCATED:     { icon: "🏠", color: "#7C3AED", bg: "#F5F3FF", label: "Room"    },
  ROOM_DEALLOCATED:   { icon: "🚪", color: "#D97706", bg: "#FFFBEB", label: "Room"    },

  STUDENT_REGISTERED: { icon: "🎉", color: "#2563EB", bg: "#EFF6FF", label: "Student" },
  COMPLAINT_RESOLVED: { icon: "🔧", color: "#6366F1", bg: "#EEF2FF", label: "Issues"  },
  GENERAL:            { icon: "🔔", color: "#D97706", bg: "#FFFBEB", label: "General" },
};
const getMeta = (type) => TYPE_META[type] ?? TYPE_META.GENERAL;

const timeAgo = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const FILTERS = ["All", "Unread", "Leave", "Room", "Student"];

export default function WardenNotifications() {
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();
  const [notifs,  setNotifs]  = useState([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("All");
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const pg  = reset ? 1 : page;
      const res = await getNotifications({ limit: LIMIT, page: pg });
      const arr = res.data.notifications ?? [];
      setNotifs(reset ? arr : prev => [...prev, ...arr]);
      setUnread(res.data.unreadCount ?? 0);
      setHasMore(arr.length === LIMIT);
      if (!reset) setPage(pg + 1);
    } catch {}
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(true); }, []);

  const handleRead = async (n) => {
    if (!n.isRead) {
      await markAsRead(n._id);
      setNotifs(p => p.map(x => x._id === n._id ? { ...x, isRead: true } : x));
      setUnread(c => Math.max(0, c - 1));
    }
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifs(p => p.map(x => ({ ...x, isRead: true })));
    setUnread(0);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifs(p => p.filter(x => x._id !== id));
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    await clearAllNotifications();
    setNotifs([]);
    setUnread(0);
  };

  const filtered = notifs.filter(n => {
    if (filter === "All")    return true;
    if (filter === "Unread") return !n.isRead;
    return getMeta(n.type).label === filter;
  });

  return (
    <div style={{ minHeight: "100vh", background: P.surface, fontFamily: "'Sora',sans-serif",
      paddingTop: isMobile ? 56 : 0 }}>

      {!isMobile && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${P.border}`,
          padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: P.primary, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Warden Portal</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: P.text }}>Notifications</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {unread > 0 && (
              <button onClick={handleMarkAll}
                style={{ padding: "9px 16px", background: "#ECFDF5", color: P.primary,
                  border: `1px solid ${P.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
                ✓ Mark all read
              </button>
            )}
            <button onClick={handleClearAll}
              style={{ padding: "9px 16px", background: "#FEF2F2", color: "#DC2626",
                border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
              🗑 Clear all
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: isMobile ? "100%" : 720, margin: "0 auto",
        padding: isMobile ? "12px 0 80px" : "24px 32px" }}>

        {isMobile && (
          <div style={{ padding: "0 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: P.text }}>
              Notifications {unread > 0 && <span style={{ fontSize: 13, color: "#DC2626" }}>({unread})</span>}
            </h2>
            {unread > 0 && (
              <button onClick={handleMarkAll}
                style={{ fontSize: 12, color: P.primary, fontWeight: 600, background: "#ECFDF5",
                  border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                  fontFamily: "'Sora',sans-serif" }}>
                ✓ All read
              </button>
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, padding: isMobile ? "0 16px 12px" : "0 0 16px",
          overflowX: "auto", scrollbarWidth: "none" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "7px 14px", borderRadius: 20,
                background: filter === f ? P.primary : "#fff",
                color: filter === f ? "#fff" : P.muted,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Sora',sans-serif", whiteSpace: "nowrap",
                border: `1px solid ${filter === f ? P.primary : P.border}`,
                transition: "all .12s", minHeight: 36 }}>
              {f}
              {f === "Unread" && unread > 0 && (
                <span style={{ marginLeft: 4, background: filter === f ? "rgba(255,255,255,0.3)" : "#DC2626",
                  color: "#fff", fontSize: 10, borderRadius: 10, padding: "1px 5px" }}>
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ background: "#fff", border: isMobile ? "none" : `1px solid ${P.border}`,
          borderRadius: isMobile ? 0 : 16, overflow: "hidden",
          boxShadow: isMobile ? "none" : "0 1px 4px rgba(0,0,0,0.04)" }}>

          {loading && notifs.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: P.muted }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
              <div style={{ fontSize: 14 }}>Loading notifications…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: P.muted }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🔕</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No notifications</div>
              <div style={{ fontSize: 13 }}>
                {filter !== "All" ? `No ${filter.toLowerCase()} notifications.` : "All caught up!"}
              </div>
            </div>
          ) : filtered.map(n => {
            const { icon, color, bg } = getMeta(n.type);
            return (
              <div key={n._id} onClick={() => handleRead(n)}
                style={{ display: "flex", gap: 12, padding: "14px 16px",
                  background: n.isRead ? "#fff" : "#F0FDF4",
                  borderBottom: `1px solid ${P.border}`,
                  cursor: "pointer", transition: "background .12s", position: "relative" }}
                onMouseEnter={e => e.currentTarget.style.background = n.isRead ? "#F8FAF9" : "#DCFCE7"}
                onMouseLeave={e => e.currentTarget.style.background = n.isRead ? "#fff" : "#F0FDF4"}>

                <div style={{ width: 40, height: 40, borderRadius: 12, background: bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0 }}>
                  {icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: P.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.title}
                    </div>
                    {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: "50%",
                      background: P.primary, flexShrink: 0, marginTop: 4 }}/>}
                  </div>
                  <div style={{ fontSize: 12, color: P.muted, marginTop: 3, lineHeight: 1.4,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 5, display: "flex", gap: 6 }}>
                    <span style={{ color, fontWeight: 700 }}>{getMeta(n.type).label}</span>
                    · {timeAgo(n.createdAt)}
                  </div>
                </div>

                <button onClick={e => handleDelete(e, n._id)}
                  style={{ position: "absolute", top: 10, right: 10,
                    background: "none", border: "none", cursor: "pointer",
                    color: "#D1D5DB", fontSize: 14, padding: "4px", borderRadius: 6,
                    opacity: 0, transition: "opacity .15s" }}
                  className="wn-notif-del">✕</button>
              </div>
            );
          })}

          {hasMore && filtered.length > 0 && (
            <div style={{ padding: 16, textAlign: "center" }}>
              <button onClick={() => load(false)} disabled={loading}
                style={{ padding: "10px 24px", background: P.primary, color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Sora',sans-serif" }}>
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`div:hover > .wn-notif-del { opacity: 1 !important; } .wn-notif-del:hover { background: #FEE2E2 !important; color: #DC2626 !important; }`}</style>
    </div>
  );
}
