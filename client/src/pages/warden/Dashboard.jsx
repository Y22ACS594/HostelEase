import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const WardenDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h1>🏨 Warden Dashboard</h1>
      <p>Hostel Management System</p>

      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        style={{ marginBottom: "20px" }}
      >
        Logout
      </button>

      <div style={{ display: "grid", gap: 20, maxWidth: 300 }}>
        <Link to="/warden/add-student">
          <button>Add Student</button>
        </Link>

        <Link to="/warden/create-room">
          <button>Create Rooms</button>
        </Link>

        <Link to="/warden/room-allocation">
          <button>Room Allocation</button>
        </Link>

        <Link to="/warden/leaves">
          <button>Leave Requests</button>
        </Link>

        
        <Link to="/warden/payments">View Payments</Link>    </div>
    </div>
  );
};

export default WardenDashboard;
