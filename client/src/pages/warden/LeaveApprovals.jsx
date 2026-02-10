import { useEffect, useState } from "react";
import { getAllLeaves, updateLeaveStatus } from "../../services/leaveService";

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    const res = await getAllLeaves();
    setLeaves(res.data);
  };

  const handleAction = async (id, status) => {
    await updateLeaveStatus(id, status);
    fetchLeaves();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Leave Requests</h2>

      {leaves.length === 0 && <p>No leave requests</p>}

      {leaves.map((leave) => (
        <div
          key={leave._id}
          style={{
            border: "2px solid black",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <p><b>Student:</b> {leave.student?.fullName}</p>
          <p><b>Reason:</b> {leave.reason}</p>
          <p>
            {leave.fromDate?.slice(0, 10)} → {leave.toDate?.slice(0, 10)}
          </p>
          <p><b>Status:</b> {leave.status}</p>

          {leave.status === "Pending" && (
            <>
              <button onClick={() => handleAction(leave._id, "Approved")}>
                Approve
              </button>
              <button onClick={() => handleAction(leave._id, "Rejected")}>
                Reject
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default LeaveApprovals;
