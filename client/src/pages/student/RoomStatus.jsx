import { useEffect, useState } from "react";
import { getRoomStatus } from "../../services/studentService";

const RoomStatus = () => {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoomStatus()
      .then(setAllocation)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  // 🔥 important guard
  if (!allocation || !allocation.roomNumber) {
    return <p>❌ Room not allocated yet.</p>;
  }

  return (
    <div>
      <h2>My Room</h2>
      <p><b>Room:</b> {allocation.roomNumber}</p>
      <p><b>Bed:</b> {allocation.bedNumber}</p>
    </div>
  );
};

export default RoomStatus;
