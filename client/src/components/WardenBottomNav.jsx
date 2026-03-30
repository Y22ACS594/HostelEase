// src/components/WardenBottomNav.jsx
import { NavLink } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const TABS = [
  {
    to: "/warden/dashboard",
    label: "Home",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#059669" : "none"}
        stroke={active ? "#059669" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: "/warden/students",
    label: "Students",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#059669" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    to: "/warden/room-allocation",
    label: "Rooms",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#059669" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    to: "/warden/leaves",
    label: "Leaves",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#059669" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    to: "/warden/issues",
    label: "Issues",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#059669" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
];

const COLOR = "#059669";

export default function WardenBottomNav() {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      display: "flex", background: "#fff",
      borderTop: "1.5px solid #D1FAE5",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      boxShadow: "0 -4px 24px rgba(5,150,105,0.10)",
      fontFamily: "'Sora', sans-serif",
    }}>
      {TABS.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} style={{ flex: 1, textDecoration: "none" }}>
          {({ isActive }) => (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "9px 4px 7px",
              position: "relative",
            }}>
              {isActive && (
                <div style={{
                  position: "absolute", top: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: 32, height: 3, borderRadius: "0 0 3px 3px",
                  background: COLOR,
                }}/>
              )}
              {icon(isActive)}
              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                marginTop: 4, letterSpacing: "0.01em",
                color: isActive ? COLOR : "#6B7A99",
              }}>{label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

