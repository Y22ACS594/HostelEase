import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>
      <h1>Student Dashboard</h1>

      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        style={{ marginBottom: "20px" }}
      >
        Logout
      </button>

      <ul>
        <li>
          <Link to="/student/room-status">🏨 My Room Details</Link>
        </li>
        <li>
          <Link to="/student/apply-leave">📝 Apply Leave</Link>
        </li>
        <li>
          <Link to="/student/leave-status">📄 Leave Status</Link>
        </li>
        <li><Link to="/student/payments">Hostel Payments</Link></li>
      </ul>
    </div>
  );
};

export default StudentDashboard;
