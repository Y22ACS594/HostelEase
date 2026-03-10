// ============================================================
// components/NotificationBell.jsx
// Req 9: In-app notification centre for students
// ============================================================
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

const TYPE_ICON = {
  LEAVE_APPROVED:     { icon: "✅", color: "#10b981" },
  LEAVE_REJECTED:     { icon: "❌", color: "#ef4444" },
  COMPLAINT_RESOLVED: { icon: "🔧", color: "#6366f1" },
  PAYMENT_CONFIRMED:  { icon: "💳", color: "#059669" },
  ROOM_ALLOCATED:     { icon: "🏠", color: "#8b5cf6" },
  GENERAL:            { icon: "🔔", color: "#f59e0b" },
};

export default function NotificationBell() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Notification fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await axios.patch(
        `${API}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.patch(
        `${API}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white
                       text-xs font-bold rounded-full flex items-center justify-center
                       animate-pulse"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl
                     border border-gray-100 z-50 overflow-hidden"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-2">🔕</div>
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { icon, color } = TYPE_ICON[n.type] ?? TYPE_ICON.GENERAL;
                return (
                  <button
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`w-full text-left flex gap-3 px-4 py-3 transition-colors
                                hover:bg-gray-50 border-b border-gray-50 last:border-0
                                ${!n.isRead ? "bg-indigo-50/40" : ""}`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center
                                 text-base shrink-0 mt-0.5"
                      style={{ background: `${color}20` }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                        {!n.isRead && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
