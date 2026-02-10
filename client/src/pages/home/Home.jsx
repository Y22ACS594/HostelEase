
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px" }}>
      <h1>🏠 HostelEase</h1>

      {!user ? (
        <button onClick={() => navigate("/login")}>Login</button>
      ) : (
        <>
          <p>
            Logged in as: <b>{user.role}</b>
          </p>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
