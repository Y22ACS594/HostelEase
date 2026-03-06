import { useEffect, useState } from "react";
import { getAllLeaves, updateLeaveStatus } from "../../services/leaveService";
import "./LeaveApprovals.css";

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("All");

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

  const filteredLeaves =
    filter === "All"
      ? leaves
      : leaves.filter((l) => l.status === filter);

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  return (
    <div className="leave-layout">
      {/* LEFT */}
      <div className="left-panel">
        <h1>Leave Management System</h1>
      </div>

      {/* CENTER */}
      <div className="center-panel">
        <div className="stats-row">
          <div className="stat-card">
            <p>Total Requests</p>
            <h2>{stats.total}</h2>
          </div>
          <div className="stat-card pending">
            <p>Pending</p>
            <h2>{stats.pending}</h2>
          </div>
          <div className="stat-card approved">
            <p>Approved</p>
            <h2>{stats.approved}</h2>
          </div>
          <div className="stat-card rejected">
            <p>Rejected</p>
            <h2>{stats.rejected}</h2>
          </div>
        </div>

        <div className="filter-row">
          <select onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* RIGHT */}
      <div className="right-panel">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Reason</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.student?.fullName}</td>
                <td>{leave.reason}</td>
                <td>{leave.fromDate?.slice(0, 10)}</td>
                <td>{leave.toDate?.slice(0, 10)}</td>
                <td>
                  <span className={`badge ${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </span>
                </td>
                <td>
                  {leave.status === "Pending" ? (
                    <>
                      <button
                        className="approve"
                        onClick={() =>
                          handleAction(leave._id, "Approved")
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="reject"
                        onClick={() =>
                          handleAction(leave._id, "Rejected")
                        }
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="done">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveApprovals;
