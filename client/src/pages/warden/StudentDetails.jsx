import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentDetails } from "../../services/wardenService";
import { deleteStudent } from "../../services/wardenService";
import "./StudentDetails.css";

const StudentDetails = () => {

const { id } = useParams();
const navigate = useNavigate();

const [data, setData] = useState(null);

useEffect(() => {
fetchDetails();
}, []);

const fetchDetails = async () => {
const res = await getStudentDetails(id);
setData(res.data);
};

const handleDelete = async () => {
const confirmDelete = window.confirm(
"Are you sure you want to delete this student?"
);

if (!confirmDelete) return;

try {
  await deleteStudent(id);
  alert("Student deleted successfully");
  navigate("/warden/students");
} catch (error) {
  alert("Failed to delete student");
}

};

if (!data) return <div className="loader">Loading profile...</div>;

const { student, payments, leaves, room } = data;

const stayDuration =
room && room.checkInDate
? Math.floor(
((room.checkOutDate
? new Date(room.checkOutDate)
: new Date()) -
new Date(room.checkInDate)) /
(1000 * 60 * 60 * 24)
)
: null;

return (
<div className="profile-page">

  {/* PROFILE HEADER */}
  <div className="profile-header">

    <img
      src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
      className="profile-avatar"
    />

    <div>

      <div className="profile-actions">

        <button
          className="edit-btn"
          onClick={() => navigate(`/warden/students/edit/${student._id}`)}
        >
          ✏ Edit
        </button>

        <button
          className="delete-btn"
          onClick={handleDelete}
        >
          🗑 Delete
        </button>

      </div>

      <h2>{student.fullName}</h2>

      <p className="sub">
        Roll: {student.rollNumber} • {student.collegeName}
      </p>

      <span className="status active">Active</span>

    </div>

  </div>

  {/* INFO CARDS */}
  <div className="info-grid">

    {/* PERSONAL INFO */}
    <div className="info-card">

      <h4>Personal Info</h4>

      <p><b>Phone:</b> {student.phoneNumber}</p>
      <p><b>Blood Group:</b> {student.bloodGroup}</p>
      <p><b>Gender:</b> {student.gender}</p>
      <p><b>Address:</b> {student.address || "Not Provided"}</p>

    </div>

    {/* PARENT INFO */}
    <div className="info-card">

      <h4>Parent Info</h4>

      <p><b>Father Name:</b> {student.fatherName || "Not Provided"}</p>
      <p><b>Mother Name:</b> {student.motherName || "Not Provided"}</p>
      <p><b>Parent Contact:</b> {student.parentContact || "Not Provided"}</p>

    </div>

    {/* ROOM DETAILS */}
    <div className="info-card">

      <h4>Room Details</h4>

      {room ? (
        <>

          <p><b>Room No:</b> {room.room.roomNumber}</p>

          <p><b>Block:</b> {room.room.blockName}</p>

          <p><b>Bed No:</b> {room.bedNumber}</p>

          <p>
            <b>Check-In Date:</b>{" "}
            {room.checkInDate
              ? new Date(room.checkInDate).toLocaleDateString()
              : "Not recorded"}
          </p>

          {room.checkOutDate ? (
            <p>
              <b>Check-Out Date:</b>{" "}
              {new Date(room.checkOutDate).toLocaleDateString()}
            </p>
          ) : (
            <p><b>Check-Out Date:</b> Still Staying</p>
          )}

          {stayDuration !== null && (
            <p><b>Stay Duration:</b> {stayDuration} days</p>
          )}

          <p>
            <b>Status:</b>{" "}
            <span
              className={
                room.status === "active"
                  ? "status active"
                  : "status inactive"
              }
            >
              {room.status === "active"
                ? "Checked In"
                : "Checked Out"}
            </span>
          </p>

        </>
      ) : (
        <p className="warn">No room allocated</p>
      )}

    </div>

  </div>

  {/* PAYMENT HISTORY */}
  <div className="section">

    <h3>💳 Payment History</h3>

    <table>

      <thead>
        <tr>
          <th>Amount</th>
          <th>Month</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>

        {payments.length === 0 ? (
          <tr>
            <td colSpan="4">No payments found</td>
          </tr>
        ) : (
          payments.map((p) => (
            <tr key={p._id}>

              <td>₹{p.amount}</td>

              <td>
                {new Date(p.createdAt).toLocaleString("en-IN", {
                  month: "long",
                })}
              </td>

              <td>
                <span className={`badge ${p.paymentStatus}`}>
                  {p.paymentStatus}
                </span>
              </td>

              <td>{new Date(p.createdAt).toLocaleDateString()}</td>

            </tr>
          ))
        )}

      </tbody>

    </table>

  </div>

  {/* LEAVE HISTORY */}
  <div className="section">

    <h3>📝 Leave History</h3>

    <table>

      <thead>
        <tr>
          <th>Reason</th>
          <th>From</th>
          <th>To</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>

        {leaves.length === 0 ? (
          <tr>
            <td colSpan="4">No leave requests</td>
          </tr>
        ) : (
          leaves.map((l) => (
            <tr key={l._id}>

              <td>{l.reason}</td>

              <td>{new Date(l.fromDate).toLocaleDateString()}</td>

              <td>{new Date(l.toDate).toLocaleDateString()}</td>

              <td>
                <span className={`badge ${l.status}`}>
                  {l.status}
                </span>
              </td>

            </tr>
          ))
        )}

      </tbody>

    </table>

  </div>

</div>

);
};

export default StudentDetails;