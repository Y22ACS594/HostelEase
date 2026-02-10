import { useState } from "react";
import { createRoom } from "../../services/roomService";

const CreateRoom = () => {
  const [form, setForm] = useState({
    blockName: "",
    roomNumber: "",
    totalBeds: "",
  });

  const submit = async () => {
    try {
      await createRoom(form);
      alert("Room created successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Create Room</h2>

      <input
        placeholder="Block Name"
        onChange={(e) =>
          setForm({ ...form, blockName: e.target.value })
        }
      />

      <input
        placeholder="Room Number"
        onChange={(e) =>
          setForm({ ...form, roomNumber: e.target.value })
        }
      />

      <input
        placeholder="Total Beds"
        type="number"
        onChange={(e) =>
          setForm({ ...form, totalBeds: e.target.value })
        }
      />

      <button onClick={submit}>Create Room</button>
    </div>
  );
};

export default CreateRoom;
