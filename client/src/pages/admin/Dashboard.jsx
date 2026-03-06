import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-container">
      {/* Header Section */}
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage hostel system and staff access
          </p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main Content */}
      <section className="admin-content">
        <ul className="admin-actions">
          <li className="admin-card">
            <Link to="/admin/create-warden">
              <h3>➕ Create Warden</h3>
              <p>Add new wardens with system privileges</p>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboard;
