import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const WardenDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>🏨 Warden Dashboard</h1>
          <p>Welcome, {user?.name || "Warden"} · Hostel Management System</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-grid">

        {/* ── Student Management ── */}
        <Link to="/warden/add-student" className="dashboard-card">
          <span>👩‍🎓</span>
          <h3>Add Student</h3>
          <p>Register new hostel student</p>
        </Link>

        <Link to="/warden/students" className="dashboard-card">
          <span>📋</span>
          <h3>Students List</h3>
          <p>View all registered students</p>
        </Link>

        {/* ── Room Management ── */}
        <Link to="/warden/create-room" className="dashboard-card">
          <span>🏠</span>
          <h3>Create Rooms</h3>
          <p>Add and manage rooms</p>
        </Link>

        <Link to="/warden/room-allocation" className="dashboard-card">
          <span>🛏️</span>
          <h3>Room Allocation</h3>
          <p>Assign students to rooms</p>
        </Link>

        {/* ── Leave Management ── */}
        <Link to="/warden/leaves" className="dashboard-card">
          <span>📄</span>
          <h3>Leave Approvals</h3>
          <p>Approve or reject leave requests</p>
        </Link>

        {/* ── Payments ── */}
        <Link to="/warden/payments" className="dashboard-card">
          <span>💳</span>
          <h3>Payments</h3>
          <p>View hostel fee payments</p>
        </Link>

        {/* ── Notifications ── */}
        <Link to="/warden/notifications" className="dashboard-card">
          <span>🔔</span>
          <h3>Notifications</h3>
          <p>View all system notifications</p>
        </Link>

        {/* ── Audit Logs ── */}
        <Link to="/warden/audit-logs" className="dashboard-card">
          <span>🗂️</span>
          <h3>Audit Logs</h3>
          <p>Track all warden activity logs</p>
        </Link>

      </div>
    </div>
  );
};

export default WardenDashboard;