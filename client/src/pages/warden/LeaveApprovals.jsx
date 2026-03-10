import { useEffect, useState } from "react";
import { getAllLeaves, updateLeaveStatus } from "../../services/leaveService";
import "./LeaveApprovals.css";

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState(null); // holds leave._id when open
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await getAllLeaves();
      // Handle both { leaves: [] } and plain [] response shapes
      const data = res.data?.leaves ?? res.data ?? [];
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      setLeaves([]);
    }
  };

  // ── APPROVE (no reason needed) ──────────────────────────
  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await updateLeaveStatus(id, "Approved", "");
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve leave");
    } finally {
      setLoading(false);
    }
  };

  // ── OPEN REJECT MODAL ───────────────────────────────────
  const openRejectModal = (id) => {
    setRejectModal(id);
    setRejectionReason("");
    setReasonError("");
  };

  // ── CONFIRM REJECTION ───────────────────────────────────
  const handleRejectConfirm = async () => {
    if (rejectionReason.trim().length < 5) {
      setReasonError("Rejection reason must be at least 5 characters.");
      return;
    }

    setLoading(true);
    try {
      await updateLeaveStatus(rejectModal, "Rejected", rejectionReason.trim());
      setRejectModal(null);
      setRejectionReason("");
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject leave");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves =
    filter === "All" ? leaves : leaves.filter((l) => l.status === filter);

  const stats = {
    total:    leaves.length,
    pending:  leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  return (
    <div className="leave-layout">

      {/* ── REJECTION REASON MODAL ──────────────────────── */}
      {rejectModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Reject Leave Request</h3>
            <p>Please provide a reason for rejection. This will be sent to the student.</p>
            <textarea
              rows={4}
              placeholder="Enter rejection reason (min 5 characters)…"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setReasonError("");
              }}
            />
            {reasonError && <p className="reason-error">{reasonError}</p>}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setRejectModal(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-reject"
                onClick={handleRejectConfirm}
                disabled={loading}
              >
                {loading ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <select onChange={(e) => setFilter(e.target.value)} value={filter}>
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* RIGHT */}
      <div className="right-panel">
        {filteredLeaves.length === 0 ? (
          <p className="no-data">No leave requests found.</p>
        ) : (
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
                  <td>{leave.student?.fullName ?? "—"}</td>
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
                          disabled={loading}
                          onClick={() => handleApprove(leave._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="reject"
                          disabled={loading}
                          onClick={() => openRejectModal(leave._id)}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="done">
                        {leave.status === "Rejected" && leave.rejectionReason
                          ? `Rejected: ${leave.rejectionReason.slice(0, 30)}…`
                          : "Completed"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovals;
