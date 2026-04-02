// client/src/components/GatekeeperBottomNav.jsx
// Uses ?tab=scan|approved|logs query param to control the dashboard tab
// so all links point to /gatekeeper/dashboard — the only existing route.

import { useNavigate, useLocation } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const COLOR = "#059669";

const TABS = [
  {
    tabKey: "scan",
    label: "Scan",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? COLOR : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    tabKey: "approved",
    label: "Approved",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? COLOR : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    tabKey: "logs",
    label: "Exit Log",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? COLOR : "#6B7A99"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

export default function GatekeeperBottomNav() {
  const isMobile  = useIsMobile();
  const navigate  = useNavigate();
  const location  = useLocation();

  if (!isMobile) return null;

  // Read active tab from ?tab= query param; default to "scan"
  const params    = new URLSearchParams(location.search);
  const activeTab = params.get("tab") || "scan";

  const goTab = (tabKey) =>
    navigate(`/gatekeeper/dashboard?tab=${tabKey}`, { replace: true });

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      display: "flex", background: "#fff",
      borderTop: "1.5px solid #D1FAE5",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      boxShadow: "0 -4px 24px rgba(5,150,105,0.10)",
      fontFamily: "'Sora', sans-serif",
    }}>
      {TABS.map(({ tabKey, label, icon }) => {
        const isActive = activeTab === tabKey;
        return (
          <button
            key={tabKey}
            onClick={() => goTab(tabKey)}
            style={{
              flex: 1, background: "none", border: "none",
              cursor: "pointer", padding: 0, textDecoration: "none",
            }}
          >
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
          </button>
        );
      })}
    </nav>
  );
}