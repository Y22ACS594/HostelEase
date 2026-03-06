import { useState } from "react";
import api from "../../services/api";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); 
  // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Reset link sent to your email.");
      setStatus("success");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-card">
        {status !== "success" ? (
          <>
            <h2>Forgot your password?</h2>
            <p className="fp-subtitle">
              No worries. Enter your registered email and we’ll send you a reset link.
            </p>

            {status === "error" && (
              <div className="fp-error">{message}</div>
            )}

            <form onSubmit={handleSubmit} className="fp-form">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="fp-input"
              />

              <button type="submit" className="fp-btn" disabled={status === "loading"}>
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="fp-footer">
              <p>🔐 We’ll never share your email.</p>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="fp-success">
            <div className="success-icon">📧</div>
            <h2>Check your inbox</h2>
            <p>
              We’ve sent a password reset link to:
            </p>
            <strong>{email}</strong>

            <p className="fp-note">
              Click the link in the email to reset your password.
              If you don’t see it, check your spam folder.
            </p>

            <button
              className="fp-btn secondary"
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
            >
              Send again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
