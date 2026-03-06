import { useEffect, useState } from "react";
import { getStudents } from "../../services/studentService";
import { useNavigate } from "react-router-dom";
import "./StudentsList.css";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, [page, batch, department]);

  const loadStudents = async () => {
    const res = await getStudents({
      page,
      limit: 5,
      batch,
      department,
    });

    setStudents(res.data.students);
    setTotalPages(res.data.totalPages);
  };

  const filtered = students.filter((s) =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.phoneNumber?.includes(search)
  );

  return (
    <div className="members-page">
      <div className="members-header">
        <h2>👩‍🎓 Student Profiles</h2>

        <input
          className="search-box"
          placeholder="Search Students by name, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🔥 FILTER SECTION */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
        <select
          value={batch}
          onChange={(e) => {
            setBatch(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Batches</option>
          <option value="2022-2026">2022-2026</option>
          <option value="2023-2027">2023-2027</option>
          <option value="2024-2028">2024-2028</option>
        </select>

        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="MECH">MECH</option>
        </select>
      </div>

      <div className="members-list">
        {filtered.length === 0 ? (
          <p>No students found</p>
        ) : (
          filtered.map((student) => (
            <div className="member-card" key={student._id}>
              <div className="member-left">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="profile"
                  className="avatar"
                />
                <div>
                  <h3>{student.fullName}</h3>
                  <p>📞 {student.phoneNumber || "N/A"}</p>
                  <p>🏫 {student.collegeName}</p>
                  <p>🎓 {student.batch}</p>
                  <p>📚 {student.department}</p>
                </div>
              </div>

              <div className="member-right">
                <span className="status-badge">Active</span>
                <p className="joined">
                  Joined: {new Date(student.createdAt).toLocaleDateString()}
                </p>

                <div className="actions">
                  <button
                    className="btn view"
                    onClick={() =>
                      navigate(`/warden/student/${student._id}`)
                    }
                  >
                    View Details
                  </button>
                  <button className="btn pay">Add Payment</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 PAGINATION SECTION */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ⬅ Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default StudentsList;