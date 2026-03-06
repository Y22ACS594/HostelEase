import { useState } from "react";
import { createRoom } from "../../services/roomService";
import "./CreateRoom.css";

const initialState = {
  blockName: "",
  roomNumber: "",
  totalBeds: "",
};

const CreateRoom = () => {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      await createRoom(form);
      setStatus("success");
      setForm(initialState);
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-page">
      <div className="room-card">
        
        {/* TITLE (NOW CLEARLY VISIBLE) */}
        <h1 className="room-title">Create New Room</h1>
        <p className="room-subtitle">
          Add new room details to hostel infrastructure
        </p>

        {status === "success" && (
          <div className="alert success">
            Room created successfully
          </div>
        )}

        {status === "error" && (
          <div className="alert error">
            Failed to create room
          </div>
        )}

        <form onSubmit={submit} className="room-form">
          <div className="field">
            <label>Block Name</label>
            <input
              name="blockName"
              value={form.blockName}
              onChange={handleChange}
              placeholder="A Block"
              required
            />
          </div>

          <div className="field">
            <label>Room Number</label>
            <input
              name="roomNumber"
              value={form.roomNumber}
              onChange={handleChange}
              placeholder="101"
              required
            />
          </div>

          <div className="field">
            <label>Total Beds</label>
            <input
              type="number"
              name="totalBeds"
              value={form.totalBeds}
              onChange={handleChange}
              placeholder="4"
              min="1"
              required
            />
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
