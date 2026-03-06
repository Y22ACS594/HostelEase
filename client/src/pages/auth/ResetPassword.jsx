import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); 
  // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: form.password,
      });

      setStatus("success");
      setMessage("Password reset successful!");
    } catch (err) {
      setStatus("error");
      setMessage("Reset link expired or invalid.");
    }
  };

  return (
    <div className="rp-container">
      <div className="rp-card">
        {status !== "success" ? (
          <>
            <h2>Reset your password 🔐</h2>
            <p className="rp-subtitle">
              Create a strong new password for your account.
            </p>

            {status === "error" && (
              <div className="rp-error">{message}</div>
            )}

            <form onSubmit={handleSubmit} className="rp-form">
              <div className="rp-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="New password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="rp-input"
                />
              </div>

              <div className="rp-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="rp-input"
                />
                <span
                  className="rp-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              <div className="rp-hint">
                Password should be at least 8 characters long.
              </div>

              <button
                type="submit"
                className="rp-btn"
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? "Resetting..."
                  : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          /* Success */
          <div className="rp-success">
            <div className="rp-success-icon">✅</div>
            <h2>Password Reset!</h2>
            <p>
              Your password has been successfully updated.
              You can now login with your new password.
            </p>

            <button
              className="rp-btn"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
