import { useState } from "react";
import api from "../../services/api";


const CreateWarden = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/warden", form);
      setMsg("✅ Warden created successfully");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Error");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Create Warden</h2>
      {msg && <p>{msg}</p>}

      <form onSubmit={submit}>
        <input
          name="name"
          placeholder="Warden Name"
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="email"
          placeholder="Warden Email"
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="password"
          type="password"
          placeholder="Temporary Password"
          onChange={handleChange}
          required
        />
        <br />

        <button>Create Warden</button>
      </form>
    </div>
  );
};

export default CreateWarden;
