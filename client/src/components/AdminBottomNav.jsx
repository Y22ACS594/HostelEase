// src/components/AdminBottomNav.jsx
import { NavLink } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const TABS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#7C3AED" : "none"}
        stroke={active ? "#7C3AED" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: "/admin/create-warden",
    label: "Wardens",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#7C3AED" : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
];

const COLOR = "#7C3AED";

export default function AdminBottomNav() {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      display: "flex", background: "#fff",
      borderTop: "1.5px solid #EDE9FE",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      boxShadow: "0 -4px 24px rgba(124,58,237,0.10)",
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

