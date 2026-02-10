import { useState } from "react";
import { applyLeave } from "../../services/leaveService";

const ApplyLeave = () => {
  const [form, setForm] = useState({
    leaveType: "Casual",
    fromDate: "",
    toDate: "",
    destination: "",
    reason: "",
    emergencyContact: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await applyLeave(form);
      setMessage("Leave applied successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div>
      <h2>Apply Leave</h2>

      <form onSubmit={handleSubmit}>
        <select
          name="leaveType"
          value={form.leaveType}
          onChange={handleChange}
        >
          <option>Casual</option>
          <option>Medical</option>
          <option>Emergency</option>
        </select>

        <input type="date" name="fromDate" onChange={handleChange} required />
        <input type="date" name="toDate" onChange={handleChange} required />

        <textarea
          name="destination"
          placeholder="Destination"
          onChange={handleChange}
          required
        />

        <textarea
          name="reason"
          placeholder="Reason"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="emergencyContact"
          placeholder="Emergency Contact"
          onChange={handleChange}
          required
        />

        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default ApplyLeave;
