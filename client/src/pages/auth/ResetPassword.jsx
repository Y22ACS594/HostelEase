import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(`/auth/reset-password/${token}`, { password });
    alert("Password reset successful");
    navigate("/login");
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button>Reset</button>
      </form>
    </div>
  );
};

export default ResetPassword;
