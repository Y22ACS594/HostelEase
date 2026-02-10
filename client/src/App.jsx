import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRedirect from "./pages/HomeRedirect";


// Auth pages
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/admin/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import ApplyLeave from "./pages/student/ApplyLeave";
import LeaveStatus from "./pages/student/LeaveStatus";
import RoomStatus from "./pages/student/RoomStatus";
import CreateRoom from "./pages/warden/CreateRoom";
import Payments from "./pages/student/Payments";

// Warden pages
import WardenDashboard from "./pages/warden/Dashboard";
import AddStudent from "./pages/warden/AddStudent";
import RoomAllocation from "./pages/warden/RoomAllocation";
import LeaveApprovals from "./pages/warden/LeaveApprovals";
import WardenPayments from "./pages/warden/Payments";


// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import CreateWarden from "./pages/admin/CreateWarden";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 PUBLIC ROUTES */}
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 🎓 STUDENT ROUTES */}
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

        {/* 🛡️ WARDEN ROUTES */}
        <Route
          path="/warden/dashboard"
          element={
            <ProtectedRoute role="warden">
              <WardenDashboard />
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

        <Route
          path="/warden/add-student"
          element={
            <ProtectedRoute role="warden">
              <AddStudent />
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

        {/* 🔐 ADMIN ROUTES */}
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
        <Route
  path="/warden/create-room"
  element={
    <ProtectedRoute role="warden">
      <CreateRoom />
    </ProtectedRoute>
  }
/>

      <Route
        path="/warden/leaves"
        element={
          <ProtectedRoute role="warden">
            <LeaveApprovals />
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

        {/* ❌ FALLBACK */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
