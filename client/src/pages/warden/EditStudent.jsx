import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentDetails, updateStudent } from "../../services/wardenService";
import "./EditStudent.css";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    rollNumber: "",
    course: "",
    department: "",
    batch: "",
    collegeName: "",
    gender: "",
    bloodGroup: "",
    phoneNumber: "",
    fatherName: "",
    motherName: "",
    parentContact: "",
    medicalIssues: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      const res = await getStudentDetails(id);
      const student = res.data.student;

      setForm({
        fullName: student.fullName || "",
        rollNumber: student.rollNumber || "",
        course: student.course || "",
        department: student.department || "",
        batch: student.batch || "",
        collegeName: student.collegeName || "",
        gender: student.gender || "",
        bloodGroup: student.bloodGroup || "",
        phoneNumber: student.phoneNumber || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        parentContact: student.parentContact || "",
        medicalIssues: student.medicalIssues || "",
        address: student.address || "",
      });

    } catch (error) {
      alert("Failed to load student data");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateStudent(id, form);
      alert("Student updated successfully!");
      navigate(`/warden/student/${id}`);
    } catch (error) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-page">
      <div className="edit-card">

        <div className="edit-header">
          <h2>Edit Student</h2>
          <p>Update student profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Roll Number</label>
              <input name="rollNumber" value={form.rollNumber} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Course</label>
              <input name="course" value={form.course} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input name="department" value={form.department} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Batch</label>
              <input name="batch" value={form.batch} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>College Name</label>
              <input name="collegeName" value={form.collegeName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <input name="gender" value={form.gender} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Father Name</label>
              <input name="fatherName" value={form.fatherName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Mother Name</label>
              <input name="motherName" value={form.motherName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Parent Contact</label>
              <input name="parentContact" value={form.parentContact} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group full">
            <label>Medical Issues</label>
            <input name="medicalIssues" value={form.medicalIssues} onChange={handleChange} />
          </div>

          <div className="form-group full">
            <label>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditStudent;