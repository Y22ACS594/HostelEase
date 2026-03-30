// src/components/StudentBottomNav.jsx
import { NavLink } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const TABS = [
  {
    to: "/student/dashboard",
    label: "Home",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#2563EB" : "none"}
        stroke={active ? "#2563EB" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: "/student/room-status",
    label: "Room",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#2563EB" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <rect x="9" y="14" width="6" height="8" rx="1"/>
        <line x1="12" y1="2" x2="12" y2="6"/>
      </svg>
    ),
  },
  {
    to: "/student/apply-leave",
    label: "Leave",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#2563EB" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    to: "/student/issues",
    label: "Issues",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#2563EB" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="11"/>
        <line x1="11" y1="14" x2="11.01" y2="14"/>
      </svg>
    ),
  },
  {
    to: "/student/notifications",
    label: "Alerts",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#2563EB" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
  },
];

export default function StudentBottomNav() {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      display: "flex", background: "#fff",
      borderTop: "1.5px solid #E8EEFF",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      boxShadow: "0 -4px 24px rgba(37,99,235,0.10)",
      fontFamily: "'Sora', sans-serif",
    }}>
      {TABS.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} style={{ flex: 1, textDecoration: "none" }}>
          {({ isActive }) => (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "9px 4px 7px",
              color: isActive ? "#2563EB" : "#6B7A99",
              position: "relative",
            }}>
              {isActive && (
                <div style={{
                  position: "absolute", top: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: 32, height: 3, borderRadius: "0 0 3px 3px",
                  background: "#2563EB",
                }}/>
              )}
              {icon(isActive)}
              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                marginTop: 4, letterSpacing: "0.01em",
                color: isActive ? "#2563EB" : "#6B7A99",
              }}>{label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

