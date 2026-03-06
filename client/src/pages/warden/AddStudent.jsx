import { useState } from "react";
import api from "../../services/api";
import "./AddStudent.css";

const initialState = {
  fullName: "",
  email: "",
  password: "",
  rollNumber: "",
  course: "",
  department: "",
  batch: "",
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
  address: "",
};

const AddStudent = () => {
  const [form, setForm] = useState(initialState);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await api.post("/warden/students", form);
      setMsg("success");
      setForm(initialState);
    } catch (err) {
      setMsg("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-page">
      <div className="student-card">
        <h2>Add New Student</h2>
        <p className="subtitle">
          Register a new student into hostel system
        </p>

        {msg === "success" && (
          <div className="alert success">
            Student registered successfully
          </div>
        )}
        {msg === "error" && (
          <div className="alert error">
            Failed to register student
          </div>
        )}

        <form onSubmit={submit} className="student-form">
          
          {/* BASIC INFO */}
          <div className="section">
            <h3>Basic Information</h3>
            <div className="grid">
              <div>
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required />
              </div>
              <div>
                <label>Email</label>
                <input name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label>Temporary Password</label>
                <input name="password" value={form.password} onChange={handleChange} required />
              </div>
              <div>
                <label>Roll Number</label>
                <input name="rollNumber" value={form.rollNumber} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* ACADEMIC */}
          <div className="section">
            <h3>Academic Details</h3>
            <div className="grid">
              <div>
                <label>Course</label>
                <input name="course" value={form.course} onChange={handleChange} />
              </div>
              <div>
                <label>Department</label>
                <input name="department" value={form.department} onChange={handleChange} />
              </div>
                  <div>
                  <label>Batch</label>
                  <input
                    name="batch"
                    value={form.batch}
                    onChange={handleChange}
                    placeholder="2023-2027"
                    required
                  />
      </div>
              <div>
                <label>College Name</label>
                <input name="collegeName" value={form.collegeName} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* PERSONAL */}
          <div className="section">
            <h3>Personal Details</h3>
            <div className="grid">
              <div>
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
              <div>
                <label>Blood Group</label>
                <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
              </div>
              <div>
                <label>Medical Issues</label>
                <input name="medicalIssues" value={form.medicalIssues} onChange={handleChange} />
              </div>
            </div>
          </div>

              {/* CONTACT */}
        <div className="section">
          <h3>Contact</h3>
          <div className="grid">
            <div>
              <label>Phone Number</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </div>
            <div>
              <label>Aadhaar Number</label>
              <input name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} />
            </div>
            <div>
              <label>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>
        </div>

          {/* PARENTS */}
          <div className="section">
            <h3>Parent Details</h3>
            <div className="grid">
              <div>
                <label>Father Name</label>
                <input name="fatherName" value={form.fatherName} onChange={handleChange} />
              </div>
              <div>
                <label>Mother Name</label>
                <input name="motherName" value={form.motherName} onChange={handleChange} />
              </div>
              <div>
                <label>Parent Contact</label>
                <input name="parentContact" value={form.parentContact} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* HOSTEL */}
          <div className="section">
            <h3>Hostel Allocation</h3>
            <div className="grid">
              <div>
                <label>Room Number</label>
                <input name="roomNumber" value={form.roomNumber} onChange={handleChange} />
              </div>
              <div>
                <label>Bed Number</label>
                <input name="bedNumber" value={form.bedNumber} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? "Registering..." : "Register Student"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
