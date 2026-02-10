import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

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
          <Link to="/admin/create-warden">➕ Create Warden</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
