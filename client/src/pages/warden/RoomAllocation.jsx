import { useEffect, useState } from "react";
import { getAllRooms, allocateRoom } from "../../services/roomService";

const RoomAllocation = () => {
  const [rooms, setRooms] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getAllRooms().then(res => setRooms(res.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await allocateRoom({
        studentId,
        room: roomId,   // ✅ ObjectId
        bedNumber,
      });
      setMsg("✅ Room allocated");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Error");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Room Allocation</h2>
      {msg && <p>{msg}</p>}

      <form onSubmit={submit}>
        <input
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <select onChange={(e) => setRoomId(e.target.value)} required>
          <option value="">Select Room</option>
          {rooms.map(r => (
            <option key={r._id} value={r._id}>
              {r.blockName} - {r.roomNumber}
            </option>
          ))}
        </select>

        <input
          placeholder="Bed Number"
          value={bedNumber}
          onChange={(e) => setBedNumber(e.target.value)}
          required
        />

        <button type="submit">Allocate</button>
      </form>
    </div>
  );
};

export default RoomAllocation;
