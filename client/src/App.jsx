// src/App.jsx  ← UPDATED: gatekeeper role skips MobileTopBar (has its own header)
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute    from "./components/ProtectedRoute";
import MobileTopBar      from "./components/MobileTopBar";
import StudentBottomNav  from "./components/StudentBottomNav";
import WardenBottomNav   from "./components/WardenBottomNav";
import AdminBottomNav    from "./components/AdminBottomNav";
import GatekeeperBottomNav from "./components/GatekeeperBottomNav";
import useIsMobile       from "./hooks/useIsMobile";

// Public / auth pages
import Home           from "./pages/home/Home";
import Login          from "./pages/auth/Login";
import AdminLogin     from "./pages/admin/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword  from "./pages/auth/ResetPassword";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import ApplyLeave       from "./pages/student/ApplyLeave";
import LeaveStatus      from "./pages/student/LeaveStatus";
import RoomStatus       from "./pages/student/RoomStatus";
import Notifications    from "./pages/student/Notifications";
import RaiseIssue       from "./pages/student/RaiseIssue";

// Warden pages
import WardenDashboard    from "./pages/warden/Dashboard";
import AddStudent         from "./pages/warden/AddStudent";
import RoomAllocation     from "./pages/warden/RoomAllocation";
import CreateRoom         from "./pages/warden/CreateRoom";
import LeaveApprovals     from "./pages/warden/LeaveApprovals";
import AnalyticsDashboard from "./pages/warden/AnalyticsDashboard";
import StudentsList       from "./pages/warden/StudentsList";
import StudentDetails     from "./pages/warden/StudentDetails";
import EditStudent        from "./pages/warden/EditStudent";
import WardenNotifications from "./pages/warden/Notifications";
import AuditLogs          from "./pages/warden/AuditLogs";
import WardenIssues       from "./pages/warden/WardenIssues";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import CreateWarden   from "./pages/admin/CreateWarden";

// Gatekeeper pages
import GatekeeperLogin     from "./pages/gatekeeper/GatekeeperLogin";
import GatekeeperDashboard from "./pages/gatekeeper/GatekeeperDashboard";

// Public paths that should NOT show the mobile nav/topbar
const PUBLIC_PATHS = ["/", "/login", "/admin/login", "/forgot-password", "/gatekeeper/login"];

function AppShell({ children }) {
  const { user }   = useAuth();
  const location   = useLocation();
  const isMobile   = useIsMobile();

  const isPublic =
    PUBLIC_PATHS.some((p) =>
      location.pathname.startsWith(p.replace(/\/$/, "")) && p !== "/"
    ) ||
    location.pathname === "/" ||
    location.pathname.startsWith("/reset-password");

  const showMobileChrome = isMobile && !isPublic && !!user;

  // ✅ Gatekeeper has its own header inside the dashboard — skip MobileTopBar for them
  const isGatekeeper = user?.role === "gatekeeper";

  return (
    <>
      {/* Mobile top header — NOT shown for gatekeeper (they have their own) */}
      {showMobileChrome && !isGatekeeper && <MobileTopBar />}

      {/* Page content */}
      <div style={{
        // Gatekeeper dashboard manages its own top padding internally
        paddingTop:    (showMobileChrome && !isGatekeeper) ? 56 : 0,
        paddingBottom: showMobileChrome ? 72 : 0,
        minHeight: "100vh",
        ...(showMobileChrome ? { overflowX: "hidden" } : {}),
      }}>
        {children}
      </div>

      {/* Bottom nav — role-specific, mobile only */}
      {showMobileChrome && user?.role === "student"    && <StudentBottomNav />}
      {showMobileChrome && user?.role === "warden"     && <WardenBottomNav  />}
      {showMobileChrome && user?.role === "admin"      && <AdminBottomNav   />}
      {showMobileChrome && user?.role === "gatekeeper" && <GatekeeperBottomNav />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>

          {/* ═══ PUBLIC ═════════════════════════════════════════════ */}
          <Route path="/"                          element={<Home />} />
          <Route path="/login"                     element={<Login />} />
          <Route path="/admin/login"               element={<AdminLogin />} />
          <Route path="/forgot-password"           element={<ForgotPassword />} />
          <Route path="/reset-password/:token"     element={<ResetPassword />} />
          <Route path="/gatekeeper/login"          element={<GatekeeperLogin />} />

          {/* ═══ STUDENT ════════════════════════════════════════════ */}
          <Route path="/student/dashboard"
            element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>}/>
          <Route path="/student/apply-leave"
            element={<ProtectedRoute role="student"><ApplyLeave /></ProtectedRoute>}/>
          <Route path="/student/leave-status"
            element={<ProtectedRoute role="student"><LeaveStatus /></ProtectedRoute>}/>
          <Route path="/student/room-status"
            element={<ProtectedRoute role="student"><RoomStatus /></ProtectedRoute>}/>
         
          <Route path="/student/notifications"
            element={<ProtectedRoute role="student"><Notifications /></ProtectedRoute>}/>
          <Route path="/student/issues"
            element={<ProtectedRoute role="student"><RaiseIssue /></ProtectedRoute>}/>

          {/* ═══ WARDEN ═════════════════════════════════════════════ */}
          <Route path="/warden/dashboard"
            element={<ProtectedRoute role="warden"><WardenDashboard /></ProtectedRoute>}/>
          <Route path="/warden/add-student"
            element={<ProtectedRoute role="warden"><AddStudent /></ProtectedRoute>}/>
          <Route path="/warden/students"
            element={<ProtectedRoute role="warden"><StudentsList /></ProtectedRoute>}/>
          <Route path="/warden/student/:id"
            element={<ProtectedRoute role="warden"><StudentDetails /></ProtectedRoute>}/>
          <Route path="/warden/students/edit/:id"
            element={<ProtectedRoute role="warden"><EditStudent /></ProtectedRoute>}/>
          <Route path="/warden/room-allocation"
            element={<ProtectedRoute role="warden"><RoomAllocation /></ProtectedRoute>}/>
          <Route path="/warden/create-room"
            element={<ProtectedRoute role="warden"><CreateRoom /></ProtectedRoute>}/>
          <Route path="/warden/leaves"
            element={<ProtectedRoute role="warden"><LeaveApprovals /></ProtectedRoute>}/>
          <Route path="/warden/analytics"
            element={<ProtectedRoute role="warden"><AnalyticsDashboard /></ProtectedRoute>}/>
         
          <Route path="/warden/notifications"
            element={<ProtectedRoute role="warden"><WardenNotifications /></ProtectedRoute>}/>
          <Route path="/warden/audit-logs"
            element={<ProtectedRoute role="warden"><AuditLogs /></ProtectedRoute>}/>
          <Route path="/warden/issues"
            element={<ProtectedRoute role="warden"><WardenIssues /></ProtectedRoute>}/>

          {/* ═══ ADMIN ══════════════════════════════════════════════ */}
          <Route path="/admin/dashboard"
            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}/>
          <Route path="/admin/create-warden"
            element={<ProtectedRoute role="admin"><CreateWarden /></ProtectedRoute>}/>

          {/* ═══ GATEKEEPER ═════════════════════════════════════════ */}
          <Route path="/gatekeeper/dashboard"
            element={<ProtectedRoute role="gatekeeper"><GatekeeperDashboard /></ProtectedRoute>}/>

          {/* ═══ FALLBACK ═══════════════════════════════════════════ */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;