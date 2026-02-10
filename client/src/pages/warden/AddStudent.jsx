import { useState } from "react";
import api from "../../services/api";

const AddStudent = () => {
 const [form, setForm] = useState({
  fullName: "",
  email: "",
  password: "",
  rollNumber: "",
  course: "",
  department: "",
  year: "",
  collegeName: "",
  gender: "",
  dateOfBirth: "",
  bloodGroup: "",
  phoneNumber: "",
  fatherName: "",
  motherName: "",
  parentContact: "",
  aadhaarNumber: "",
  medicalIssues: "None",
  roomNumber: "",
  bedNumber: "",
});

  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await api.post("/warden/students", form);
      setMsg("✅ Student registered successfully");
      setForm({});
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Error");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Add New Student</h2>
      {msg && <p>{msg}</p>}

      <form
        onSubmit={submit}
        style={{ display: "grid", gap: "8px", maxWidth: "600px" }}
      >
        {/* BASIC */}
        <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" placeholder="Temp Password" onChange={handleChange} required />

        <input name="rollNumber" placeholder="Roll Number" onChange={handleChange} required />
        <input name="course" placeholder="Course (B.Tech)" onChange={handleChange} required />
        <input name="department" placeholder="Department" onChange={handleChange} required />
        <input name="year" placeholder="Year" onChange={handleChange} required />
        <input name="collegeName" placeholder="College Name" onChange={handleChange} required />

        {/* PERSONAL */}
        <select name="gender" onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input type="date" name="dateOfBirth" onChange={handleChange} required />
        <input name="bloodGroup" placeholder="Blood Group" onChange={handleChange} required />

        {/* CONTACT */}
        <input name="phoneNumber" placeholder="Student Phone" onChange={handleChange} required />
        <input name="aadhaarNumber" placeholder="Aadhaar Number" onChange={handleChange} required />

        {/* PARENTS */}
        <input name="fatherName" placeholder="Father Name" onChange={handleChange} required />
        <input name="motherName" placeholder="Mother Name" onChange={handleChange} required />
        <input name="parentContact" placeholder="Parent Contact" onChange={handleChange} required />

        {/* HOSTEL */}
        <input name="roomNumber" placeholder="Room Number (optional)" onChange={handleChange} />
        <input name="bedNumber" placeholder="Bed Number (optional)" onChange={handleChange} />

        <button type="submit">Register Student</button>
      </form>
    </div>
  );
};

export default AddStudent;
