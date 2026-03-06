import { useEffect, useState } from "react";
import { getMyLeaves } from "../../services/leaveService";
import "./LeaveStatus.css";

const LeaveStatus = () => {

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const res = await getMyLeaves();
      setLeaves(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getDuration = (from, to) => {
    return (
      Math.ceil(
        (new Date(to) - new Date(from)) /
        (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const getStep = (status) => {
    if (status === "Pending") return 2;
    if (status === "Approved") return 3;
    if (status === "Rejected") return 3;
    return 1;
  };

  if (loading) {
    return <div className="loading">Loading Leave History...</div>;
  }

  if (!leaves.length) {
    return <div className="empty">No leave requests yet.</div>;
  }

  return (
    <div className="leave-status-page">

      <h1 className="page-title">Leave Tracking</h1>

      <div className="leave-list">

        {leaves.map((leave) => {

          const step = getStep(leave.status);

          return (

            <div key={leave._id} className="leave-card">

              {/* HEADER */}
              <div className="leave-header">

                <div>
                  <h3>{leave.leaveType} Leave</h3>

                  <p className="date">
                    {leave.fromDate.slice(0,10)} → {leave.toDate.slice(0,10)}
                  </p>

                  <p className="duration">
                    {getDuration(leave.fromDate, leave.toDate)} days
                  </p>
                </div>

                <span className={`status ${leave.status.toLowerCase()}`}>
                  {leave.status}
                </span>

              </div>

              {/* TIMELINE */}
              <div className="timeline">

                <div className={`step ${step >= 1 ? "active" : ""}`}>
                  <div className="circle"></div>
                  <p>Applied</p>
                </div>

                <div className={`line ${step >= 2 ? "active" : ""}`}></div>

                <div className={`step ${step >= 2 ? "active" : ""}`}>
                  <div className="circle"></div>
                  <p>Under Review</p>
                </div>

                <div className={`line ${step >= 3 ? "active" : ""}`}></div>

                <div
                  className={`step ${
                    leave.status === "Approved"
                      ? "approved"
                      : leave.status === "Rejected"
                      ? "rejected"
                      : ""
                  }`}
                >
                  <div className="circle"></div>
                  <p>{leave.status}</p>
                </div>

              </div>

              {/* DETAILS */}
              <div className="leave-body">

                <p>
                  <strong>Destination:</strong> {leave.destination}
                </p>

                <p>
                  <strong>Reason:</strong> {leave.reason}
                </p>

                {leave.status === "Rejected" && (
                  <div className="remark-box">
                    <strong>Warden Remark</strong>
                    <p>{leave.remark || "No reason provided"}</p>
                  </div>
                )}

              </div>

            </div>

          );
        })}

      </div>

    </div>
  );
};

export default LeaveStatus;