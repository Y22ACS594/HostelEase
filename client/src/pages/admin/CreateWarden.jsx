import { useState } from "react";
import api from "../../services/api";
import "./CreateWarden.css";

const CreateWarden = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await api.post("/admin/warden", form);
      setMsg("success");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="warden-container">
      <div className="warden-card">
        <h2>Create Warden</h2>
        <p className="subtitle">
          Add a new hostel warden with system access
        </p>

        {msg === "success" && (
          <div className="success-msg">
            ✅ Warden account created successfully
          </div>
        )}

        {msg && msg !== "success" && (
          <div className="error-msg">❌ {msg}</div>
        )}

        <form onSubmit={submit}>
          <div className="input-group">
            <label>Warden Name</label>
            <input
              name="name"
              placeholder="Enter Warden Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="warden@hostel.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Temporary Password</label>
            <input
              name="password"
              type="password"
              placeholder="Auto-generated or manual"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="create-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Warden"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWarden;
