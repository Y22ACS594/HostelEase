import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRedirect from "./pages/HomeRedirect";
import Home from "./pages/home/Home";


// ── Auth pages ─────────────────────────────────────────────
import Login         from "./pages/auth/Login";
import AdminLogin    from "./pages/admin/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword  from "./pages/auth/ResetPassword";

// ── Student pages ───────────────────────────────────────────
import StudentDashboard from "./pages/student/Dashboard";
import ApplyLeave       from "./pages/student/ApplyLeave";
import LeaveStatus      from "./pages/student/LeaveStatus";
import RoomStatus       from "./pages/student/RoomStatus";
import Payments         from "./pages/student/Payments";

// ── Warden pages ────────────────────────────────────────────
import WardenDashboard    from "./pages/warden/Dashboard";
import AddStudent         from "./pages/warden/AddStudent";
import RoomAllocation     from "./pages/warden/RoomAllocation";
import CreateRoom         from "./pages/warden/CreateRoom";
import LeaveApprovals     from "./pages/warden/LeaveApprovals";
import LeaveDashboard     from "./pages/warden/LeaveDashboard";
import AnalyticsDashboard from "./pages/warden/AnalyticsDashboard";
import WardenPayments     from "./pages/warden/Payments";
import StudentsList       from "./pages/warden/StudentsList";
import StudentDetails     from "./pages/warden/StudentDetails";
import EditStudent        from "./pages/warden/EditStudent";

// ── Admin pages ─────────────────────────────────────────────
import AdminDashboard from "./pages/admin/Dashboard";
import CreateWarden   from "./pages/admin/CreateWarden";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ═══════════════════════════════════════════════
            PUBLIC ROUTES
        ═══════════════════════════════════════════════ */}
        
        <Route path="/" element={<Home />} />
        <Route path="/login"                   element={<Login />} />
        <Route path="/admin/login"             element={<AdminLogin />} />
        <Route path="/forgot-password"         element={<ForgotPassword />} />
        <Route path="/reset-password/:token"   element={<ResetPassword />} />

        {/* ═══════════════════════════════════════════════
            STUDENT ROUTES
        ═══════════════════════════════════════════════ */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/apply-leave"
          element={
            <ProtectedRoute role="student">
              <ApplyLeave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/leave-status"
          element={
            <ProtectedRoute role="student">
              <LeaveStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/room-status"
          element={
            <ProtectedRoute role="student">
              <RoomStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/payments"
          element={
            <ProtectedRoute role="student">
              <Payments />
            </ProtectedRoute>
          }
        />

        {/* ═══════════════════════════════════════════════
            WARDEN ROUTES
        ═══════════════════════════════════════════════ */}
        <Route
          path="/warden/dashboard"
          element={
            <ProtectedRoute role="warden">
              <WardenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/add-student"
          element={
            <ProtectedRoute role="warden">
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/students"
          element={
            <ProtectedRoute role="warden">
              <StudentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/student/:id"
          element={
            <ProtectedRoute role="warden">
              <StudentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/students/edit/:id"
          element={
            <ProtectedRoute role="warden">
              <EditStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/room-allocation"
          element={
            <ProtectedRoute role="warden">
              <RoomAllocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/create-room"
          element={
            <ProtectedRoute role="warden">
              <CreateRoom />
            </ProtectedRoute>
          }
        />
        {/* Leave Approvals — simple table view */}
        <Route
          path="/warden/leaves"
          element={
            <ProtectedRoute role="warden">
              <LeaveApprovals />
            </ProtectedRoute>
          }
        />
        {/* Leave Dashboard — full analytics + approve/reject */}
        <Route
          path="/warden/leave-dashboard"
          element={
            <ProtectedRoute role="warden">
              <LeaveDashboard />
            </ProtectedRoute>
          }
        />
        {/* Hostel Analytics Dashboard */}
        <Route
          path="/warden/analytics"
          element={
            <ProtectedRoute role="warden">
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/payments"
          element={
            <ProtectedRoute role="warden">
              <WardenPayments />
            </ProtectedRoute>
          }
        />

        {/* ═══════════════════════════════════════════════
            ADMIN ROUTES
        ═══════════════════════════════════════════════ */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-warden"
          element={
            <ProtectedRoute role="admin">
              <CreateWarden />
            </ProtectedRoute>
          }
        />

        {/* ═══════════════════════════════════════════════
            FALLBACK
        ═══════════════════════════════════════════════ */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;