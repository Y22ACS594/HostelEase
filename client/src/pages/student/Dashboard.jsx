import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const StudentDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="sidebar">
        <h2 className="logo">HostelEase</h2>
        <nav>
          {/* ✅ Fixed: /student/dashboard not /student */}
          <Link to="/student/dashboard" className="active">🏠 Dashboard</Link>
          <Link to="/student/room-status">🏨 My Room</Link>
          <Link to="/student/apply-leave">📝 Apply Leave</Link>
          <Link to="/student/leave-status">📄 Leave Status</Link>
          <Link to="/student/payments">💳 Payments</Link>
        </nav>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="main-area">
        {/* Top Bar */}
        <div className="topbar">
          <div>
            <h1>Welcome back 👋</h1>
            <p>{user?.name || "Student"} · Hostel Dashboard</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <h3>Room No</h3>
            <p>100-1</p>
          </div>
          <div className="stat-card green">
            <h3>Leave Requests</h3>
            <p>3</p>
          </div>
          <div className="stat-card purple">
            <h3>Fees Due</h3>
            <p>₹12,000</p>
          </div>
          <div className="stat-card orange">
            <h3>Status</h3>
            <p>Active</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="action-grid">
          <Link to="/student/room-status" className="action-card">
            <h3>🏨 My Room</h3>
            <p>View full room info</p>
          </Link>

          <Link to="/student/apply-leave" className="action-card">
            <h3>📝 Apply Leave</h3>
            <p>Submit new leave request</p>
          </Link>

          <Link to="/student/leave-status" className="action-card">
            <h3>📄 Leave Status</h3>
            <p>Track approvals</p>
          </Link>
           {/* ── Notifications ── */}
                  <Link to="/warden/notifications" className="dashboard-card">
                    <span>🔔</span>
                    <h3>Notifications</h3>
                    <p>View all system notifications</p>
                  </Link>
          
          <Link to="/student/payments" className="action-card">
            <h3>💳 Payments</h3>
            <p>Fee & transaction history</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;