// src/components/MobileTopBar.jsx
// Shown only on mobile — shows app name + notification bell + profile dropdown (TopbarProfile)
import useIsMobile from "../hooks/useIsMobile";
import { useAuth } from "../context/AuthContext";
import TopbarProfile from "./TopbarProfile";

const ROLE_CONFIG = {
  student: { label: "Student Portal", color: "#2563EB" },
  warden:  { label: "Warden Portal",  color: "#059669" },
  admin:   { label: "Admin Portal",   color: "#7C3AED" },
};

export default function MobileTopBar() {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  if (!isMobile) return null;
  if (!user) return null;

  const cfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.student;

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      height: 56,
      background: "#fff",
      borderBottom: "1.5px solid #E8EEFF",
      display: "flex", alignItems: "center",
      padding: "0 16px",
      boxShadow: "0 2px 12px rgba(37,99,235,0.07)",
      fontFamily: "'Sora', sans-serif",
    }}>
      {/* Logo + app name */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>🏠</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0F1629", lineHeight: 1 }}>
            HostelEase
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, color: cfg.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Right: TopbarProfile (has bell + avatar dropdown built-in) */}
      <TopbarProfile theme="light" />
    </header>
  );
}
