import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const WardenDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>🏨 Warden Dashboard</h1>
          <p>Hostel Management System</p>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <Link to="/warden/add-student" className="dashboard-card">
          <span>👩‍🎓</span>
          <h3>Add Student</h3>
          <p>Register new hostel student</p>
        </Link>

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

        <Link to="/warden/leaves" className="dashboard-card">
          <span>📄</span>
          <h3>Leave Requests</h3>
          <p>Approve or reject leaves</p>
        </Link>

        <Link to="/warden/payments" className="dashboard-card">
          <span>💳</span>
          <h3>Payments</h3>
          <p>View hostel payments</p>
        </Link>
      </div>
      <button onClick={() => navigate("/warden/students")}>
  View Registered Students
</button>
    </div>
  );
};

export default WardenDashboard;
