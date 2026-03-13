// pages/warden/Notifications.jsx  AND  pages/student/Notifications.jsx
// One shared component — auto-adapts to the logged-in role
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications, markAsRead, markAllRead,
  deleteNotification, clearAll,
} from "../../services/notificationService";

if (!document.getElementById("npage-font")) {
  const l = document.createElement("link");
  l.id  = "npage-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

const P = {
  primary:"#2563EB", approved:"#059669", pending:"#D97706",
  rejected:"#DC2626", surface:"#F8FAFF", border:"#E8EEFF",
  text:"#0F1629", muted:"#6B7A99",
};

const TYPE_META = {
  LEAVE_APPROVED:     { icon:"✅", color:"#059669", bg:"#ECFDF5", cat:"Leave"    },
  LEAVE_REJECTED:     { icon:"❌", color:"#DC2626", bg:"#FEF2F2", cat:"Leave"    },
  LEAVE_APPLIED:      { icon:"📄", color:"#2563EB", bg:"#EFF6FF", cat:"Leave"    },
  ROOM_ALLOCATED:     { icon:"🏠", color:"#7C3AED", bg:"#F5F3FF", cat:"Room"     },
  ROOM_DEALLOCATED:   { icon:"🚪", color:"#D97706", bg:"#FFFBEB", cat:"Room"     },
  PAYMENT_CONFIRMED:  { icon:"💳", color:"#059669", bg:"#ECFDF5", cat:"Payment"  },
  PAYMENT_RECEIVED:   { icon:"💰", color:"#059669", bg:"#ECFDF5", cat:"Payment"  },
  STUDENT_REGISTERED: { icon:"🎉", color:"#2563EB", bg:"#EFF6FF", cat:"Account"  },
  COMPLAINT_RESOLVED: { icon:"🔧", color:"#6366F1", bg:"#EEF2FF", cat:"Complaint"},
  GENERAL:            { icon:"🔔", color:"#D97706", bg:"#FFFBEB", cat:"General"  },
};
const getMeta = (t) => TYPE_META[t] ?? TYPE_META.GENERAL;

const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800)return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-IN");
};

function StatCard({ icon, value, label, bg }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ background:"#fff", borderRadius:20, padding:"20px 22px",
      border:`1px solid ${P.border}`,
      boxShadow:hov?"0 6px 24px rgba(37,99,235,0.10)":"0 1px 4px rgba(0,0,0,0.04)",
      display:"flex", flexDirection:"column", gap:8, transition:"box-shadow .2s" }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ width:38,height:38,borderRadius:12,background:bg,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:17 }}>{icon}</div>
      <div style={{ fontSize:26,fontWeight:700,color:P.text,lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12,color:P.muted,fontWeight:500 }}>{label}</div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,22,41,0.55)",
      backdropFilter:"blur(4px)",zIndex:200,display:"flex",
      alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif" }}>
      <div style={{ background:"#fff",borderRadius:20,padding:"28px 32px",
        width:340,boxShadow:"0 32px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize:16,fontWeight:700,color:P.text,marginBottom:8 }}>Are you sure?</div>
        <div style={{ fontSize:13,color:P.muted,marginBottom:24 }}>{message}</div>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel}
            style={{ padding:"8px 18px",border:`1.5px solid ${P.border}`,borderRadius:10,
              background:"none",cursor:"pointer",fontSize:13,color:P.muted,fontFamily:"'Sora',sans-serif" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ padding:"8px 18px",background:P.rejected,border:"none",borderRadius:10,
              color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Sora',sans-serif" }}>
            Delete all
          </button>
        </div>
      </div>
    </div>
  );
}

const Notifications = () => {
  const { user } = useAuth();
  const role = user?.role ?? "student";

  const [notifs,       setNotifs]       = useState([]);
  const [total,        setTotal]        = useState(0);
  const [unread,       setUnread]       = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("All");
  const [catFilter,    setCatFilter]    = useState("All");
  const [search,       setSearch]       = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ limit: 100 });
      setNotifs(res.data.notifications ?? []);
      setTotal(res.data.total ?? 0);
      setUnread(res.data.unreadCount ?? 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, []);

  const handleRead = async (n) => {
    if (n.isRead) return;
    await markAsRead(n._id);
    setNotifs((p) => p.map((x) => x._id === n._id ? { ...x, isRead: true } : x));
    setUnread((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifs((p) => p.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
    const rem = notifs.find((n) => n._id === id);
    setNotifs((p) => p.filter((x) => x._id !== id));
    setTotal((t) => t - 1);
    if (rem && !rem.isRead) setUnread((c) => Math.max(0, c - 1));
  };

  const handleClearAll = async () => {
    await clearAll();
    setNotifs([]); setTotal(0); setUnread(0);
    setConfirmClear(false);
  };

  const displayed = notifs.filter((n) => {
    const meta = getMeta(n.type);
    if (filter === "Unread" && n.isRead)  return false;
    if (filter === "Read"   && !n.isRead) return false;
    if (catFilter !== "All" && meta.cat !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const readCount = notifs.filter((n) => n.isRead).length;
  const CATS      = ["All","Leave","Room","Payment","Account","Complaint","General"];
  const CAT_ICONS = { Leave:"📄",Room:"🏠",Payment:"💳",Account:"🎉",Complaint:"🔧",General:"🔔" };
  const todayStr  = new Date().toLocaleDateString("en-IN",{
    weekday:"long",day:"numeric",month:"long",year:"numeric"
  });

  return (
    <div style={{ fontFamily:"'Sora',sans-serif",background:P.surface,minHeight:"100vh",padding:24,color:P.text }}>

      {confirmClear && (
        <ConfirmDialog
          message="This will permanently delete all your notifications. This cannot be undone."
          onConfirm={handleClearAll}
          onCancel={()=>setConfirmClear(false)}
        />
      )}

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:28,flexWrap:"wrap",gap:12 }}>
        <div>
          <div style={{ fontSize:11,fontWeight:600,color:P.primary,
            letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>
            HostelEase · {role === "warden" ? "Warden Portal" : "Student Portal"}
          </div>
          <h1 style={{ margin:0,fontSize:24,fontWeight:700,color:P.text }}>🔔 Notifications</h1>
          <p style={{ margin:"4px 0 0",fontSize:13,color:P.muted }}>{todayStr}</p>
        </div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {unread > 0 && (
            <button onClick={handleMarkAll}
              style={{ padding:"9px 16px",background:"#EFF6FF",color:P.primary,
                border:`1.5px solid ${P.border}`,borderRadius:12,fontFamily:"'Sora',sans-serif",
                fontWeight:600,fontSize:13,cursor:"pointer" }}>
              ✓ Mark all read
            </button>
          )}
          {notifs.length > 0 && (
            <button onClick={()=>setConfirmClear(true)}
              style={{ padding:"9px 16px",background:"#FEF2F2",color:P.rejected,
                border:`1.5px solid #FCA5A5`,borderRadius:12,fontFamily:"'Sora',sans-serif",
                fontWeight:600,fontSize:13,cursor:"pointer" }}>
              🗑 Clear all
            </button>
          )}
          <button onClick={fetchNotifs}
            style={{ padding:"9px 16px",background:P.primary,color:"#fff",border:"none",
              borderRadius:12,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:13,
              cursor:"pointer",boxShadow:"0 4px 14px rgba(37,99,235,0.35)" }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24 }}>
        <StatCard icon="🔔" value={loading?"…":total}     label="Total"  bg="#EFF6FF"/>
        <StatCard icon="🔵" value={loading?"…":unread}    label="Unread" bg="#FFFBEB"/>
        <StatCard icon="✅" value={loading?"…":readCount} label="Read"   bg="#ECFDF5"/>
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
        {/* Status tabs */}
        <div style={{ display:"flex",background:"#fff",borderRadius:12,padding:3,
          border:`1px solid ${P.border}`,gap:2 }}>
          {["All","Unread","Read"].map((f)=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"6px 14px",borderRadius:9,border:"none",
                background:filter===f?P.primary:"none",
                color:filter===f?"#fff":P.muted,fontFamily:"'Sora',sans-serif",
                fontWeight:600,fontSize:12,cursor:"pointer",transition:"all .12s" }}>
              {f}
              {f==="Unread"&&unread>0&&(
                <span style={{ marginLeft:4,background:filter==="Unread"?"rgba(255,255,255,0.3)":"#DC2626",
                  color:"#fff",fontSize:10,borderRadius:10,padding:"1px 5px" }}>
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
          {CATS.map((c)=>(
            <button key={c} onClick={()=>setCatFilter(c)}
              style={{ padding:"6px 12px",borderRadius:20,
                border:`1.5px solid ${catFilter===c?P.primary:P.border}`,
                background:catFilter===c?"#EFF6FF":"#fff",
                color:catFilter===c?P.primary:P.muted,
                fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer" }}>
              {c!=="All"?CAT_ICONS[c]+" ":""}{c}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 12px",
          border:`1.5px solid ${P.border}`,borderRadius:12,background:"#fff",
          flex:1,minWidth:180,maxWidth:260,marginLeft:"auto" }}>
          <span style={{ color:P.muted,fontSize:14 }}>🔍</span>
          <input value={search} onChange={(e)=>setSearch(e.target.value)}
            placeholder="Search notifications…"
            style={{ border:"none",outline:"none",fontSize:13,color:P.text,
              fontFamily:"'Sora',sans-serif",background:"none",width:"100%" }}/>
          {search&&<button onClick={()=>setSearch("")}
            style={{ border:"none",background:"none",cursor:"pointer",color:P.muted,fontSize:12 }}>✕</button>}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div style={{ fontSize:12,color:P.muted,marginBottom:12 }}>
          Showing {displayed.length} notification{displayed.length!==1?"s":""}
          {(filter!=="All"||catFilter!=="All"||search)?" (filtered)":""}
        </div>
      )}

      {/* List */}
      <div style={{ background:"#fff",borderRadius:20,border:`1px solid ${P.border}`,
        overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>

        {loading ? (
          <div style={{ padding:"60px 24px",textAlign:"center",color:P.muted }}>
            <div style={{ fontSize:32,marginBottom:10 }}>⏳</div>
            <div style={{ fontWeight:600 }}>Loading notifications…</div>
          </div>
        ) : displayed.length===0 ? (
          <div style={{ padding:"60px 24px",textAlign:"center",color:P.muted }}>
            <div style={{ fontSize:48,marginBottom:12 }}>🔕</div>
            <div style={{ fontWeight:700,fontSize:16,color:P.text,marginBottom:6 }}>
              No notifications
            </div>
            <div style={{ fontSize:13 }}>
              {filter!=="All"||catFilter!=="All"||search
                ? "Try adjusting your filters"
                : role==="warden"
                  ? "You'll be notified when students apply for leave, make payments, and more."
                  : "You'll be notified when your leave is approved, room is assigned, and more."}
            </div>
          </div>
        ) : displayed.map((n, idx) => {
          const { icon, color, bg, cat } = getMeta(n.type);
          return (
            <div key={n._id}
              style={{ display:"flex",alignItems:"flex-start",gap:14,padding:"16px 20px",
                borderBottom:idx<displayed.length-1?`1px solid ${P.border}`:"none",
                background:n.isRead?"#fff":"#F0F7FF",
                cursor:"pointer",transition:"background .12s",position:"relative" }}
              onClick={()=>handleRead(n)}
              onMouseEnter={(e)=>e.currentTarget.style.background=n.isRead?"#F8FAFF":"#E8F4FF"}
              onMouseLeave={(e)=>e.currentTarget.style.background=n.isRead?"#fff":"#F0F7FF"}>

              {/* Icon bubble */}
              <div style={{ width:44,height:44,borderRadius:14,background:bg,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:20,flexShrink:0 }}>
                {icon}
              </div>

              {/* Content */}
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"flex-start",
                  justifyContent:"space-between",gap:6,flexWrap:"wrap" }}>
                  <div style={{ fontSize:14,fontWeight:n.isRead?500:700,color:P.text }}>
                    {n.title}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                    {!n.isRead&&(
                      <span style={{ width:8,height:8,borderRadius:"50%",
                        background:P.primary,display:"inline-block" }}/>
                    )}
                    <span style={{ fontSize:11,color:P.muted,fontFamily:"'DM Mono',monospace" }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize:12,color:P.muted,marginTop:4,lineHeight:1.55 }}>
                  {n.message}
                </div>

                <div style={{ display:"flex",alignItems:"center",gap:10,marginTop:8 }}>
                  <span style={{ display:"inline-flex",alignItems:"center",gap:4,
                    background:bg,color,fontSize:11,fontWeight:600,
                    padding:"3px 8px",borderRadius:20 }}>
                    {icon} {cat}
                  </span>
                  <span style={{ fontSize:11,color:P.muted }}>
                    {new Date(n.createdAt).toLocaleString("en-IN",{
                      day:"2-digit",month:"short",year:"numeric",
                      hour:"2-digit",minute:"2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display:"flex",flexDirection:"column",gap:5,flexShrink:0 }}>
                {!n.isRead && (
                  <button onClick={(e)=>{e.stopPropagation();handleRead(n);}}
                    style={{ padding:"5px 10px",background:"#EFF6FF",color:P.primary,
                      border:`1px solid ${P.border}`,borderRadius:8,fontSize:11,
                      fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif" }}>
                    ✓ Read
                  </button>
                )}
                <button onClick={(e)=>handleDelete(e,n._id)}
                  style={{ padding:"5px 10px",background:"#FEF2F2",color:P.rejected,
                    border:`1px solid #FCA5A5`,borderRadius:8,fontSize:11,
                    fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif" }}>
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {!loading && total > 0 && (
        <div style={{ textAlign:"center",marginTop:14,fontSize:11,color:P.muted }}>
          {total} total notification{total!==1?"s":""}
          {" · "}Auto-deleted after 90 days
        </div>
      )}
    </div>
  );
};

export default Notifications;