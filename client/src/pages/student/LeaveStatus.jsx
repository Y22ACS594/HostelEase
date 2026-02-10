import { useEffect, useState } from "react";
import { getMyLeaves } from "../../services/leaveService";

const LeaveStatus = () => {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    getMyLeaves().then((res) => setLeaves(res.data));
  }, []);

  if (!leaves.length) return <p>No leave requests yet.</p>;

  return (
    <div>
      <h2>My Leave Requests</h2>
      {leaves.map((leave) => (
        <div key={leave._id}>
          <p>
            {leave.fromDate.slice(0, 10)} → {leave.toDate.slice(0, 10)}
          </p>
          <p>Status: {leave.status}</p>
        </div>
      ))}
    </div>
  );
};

export default LeaveStatus;
