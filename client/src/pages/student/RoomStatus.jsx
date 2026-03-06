import { useEffect, useState } from "react";
import { getRoomStatus } from "../../services/studentService";
import "./RoomStatus.css";

const RoomStatus = () => {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const res = await getRoomStatus();
        setAllocation(res);
      } catch (err) {
        setError("Failed to load room status. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomStatus();
  }, []);

  // Loading UI
  if (loading) {
    return (
      <div className="room-card loading">
        <div className="skeleton title"></div>
        <div className="skeleton line"></div>
        <div className="skeleton line"></div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="room-card error">
        <h3>⚠ Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Not allocated yet
  if (!allocation || !allocation.roomNumber) {
    return (
      <div className="room-card not-allocated">
        <h2>Room Status</h2>
        <p className="status-badge pending">Not Allocated</p>
        <p>
          Your room has not been allocated yet.  
          Please contact the hostel administration.
        </p>
      </div>
    );
  }

  // Allocated
  return (
    <div className="room-card allocated">
      <div className="room-header">
        <h2>My Room Details</h2>
        <span className="status-badge success">Allocated</span>
      </div>

      <div className="room-grid">
        <div className="room-item">
          <span className="label">Room Number</span>
          <span className="value">{allocation.roomNumber}</span>
        </div>

        <div className="room-item">
          <span className="label">Bed Number</span>
          <span className="value">{allocation.bedNumber}</span>
        </div>

        <div className="room-item">
          <span className="label">Block</span>
          <span className="value">{allocation.block || "A"}</span>
        </div>

        <div className="room-item">
          <span className="label">Floor</span>
          <span className="value">{allocation.floor || "2nd Floor"}</span>
        </div>
      </div>

      <div className="room-footer">
        <p>
          If any issue in allocation, raise a request to hostel office.
        </p>
        <button className="report-btn">Report Issue</button>
      </div>
    </div>
  );
};

export default RoomStatus;
