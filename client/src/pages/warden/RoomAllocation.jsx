import { useEffect, useState } from "react";
import api from "../../services/api";
import "./RoomAllocation.css";

const RoomAllocation = () => {

  const [rooms, setRooms] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    percent: 0,
  });

  const [selectedBed, setSelectedBed] = useState(null);

  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [bedInfo, setBedInfo] = useState(null);

  useEffect(() => {
    loadRooms();
  }, []);

  /* =============================
     LOAD ROOMS + BEDS
  ============================= */

  const loadRooms = async () => {
    try {

      const res = await api.get("/rooms");
      const roomsData = res.data;

      let totalBeds = 0;
      let occupiedBeds = 0;

      const updatedRooms = await Promise.all(

        roomsData.map(async (room) => {

          const occRes = await api.get(
            `/warden/rooms/${room._id}/occupied-beds`
          );

          const occupied = occRes.data;

          totalBeds += room.totalBeds;
          occupiedBeds += occupied.length;

          const beds = [];

          for (let i = 1; i <= room.totalBeds; i++) {

            const bedNumber = String(i);

            const isOccupied = occupied.includes(bedNumber);

            beds.push({
              number: bedNumber,
              status: isOccupied ? "occupied" : "available",
            });

          }

          return { ...room, beds };

        })
      );

      const availableBeds = totalBeds - occupiedBeds;

      setStats({
        total: totalBeds,
        available: availableBeds,
        occupied: occupiedBeds,
        percent:
          totalBeds === 0
            ? 0
            : Math.round((availableBeds / totalBeds) * 100),
      });

      setRooms(updatedRooms);

    } catch (err) {

      console.error("Error loading rooms", err);

    }
  };

  /* =============================
     BED CLICK
  ============================= */

  const handleBedClick = (room, bed) => {

    if (bed.status === "occupied") {

      fetchBedDetails(room._id, bed.number);

      return;

    }

    setSelectedBed({
      roomId: room._id,
      roomNumber: room.roomNumber,
      bedNumber: bed.number,
    });

    setStudentId("");
    setStudentName("");
    setBedInfo(null);

    setModalOpen(true);
  };

  /* =============================
     FETCH STUDENT BY ROLL
  ============================= */

  const fetchStudent = async () => {

    if (!studentId.trim()) {
      alert("Enter Roll Number");
      return;
    }

    try {

      const res = await api.get(`/students/by-roll/${studentId}`);

      setStudentName(res.data.fullName);

    } catch {

      setStudentName("Student not found");

    }

  };

  /* =============================
     ALLOCATE BED
  ============================= */

  const allocateBed = async () => {

    if (!studentName || studentName === "Student not found") {
      alert("Fetch valid student first");
      return;
    }

    try {

      setLoading(true);

      await api.post("/warden/allocate-room", {
        studentId,
        room: selectedBed.roomId,
        bedNumber: selectedBed.bedNumber,
      });

      alert("Room allocated successfully");

      setModalOpen(false);
      setStudentId("");
      setStudentName("");

      loadRooms();

    } catch (err) {

      if (err.response && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Allocation failed");
      }

    } finally {

      setLoading(false);

    }

  };

  /* =============================
     FETCH OCCUPIED BED DETAILS
  ============================= */

  const fetchBedDetails = async (roomId, bedNumber) => {

    try {

      const res = await api.get(
        `/warden/rooms/${roomId}/bed/${bedNumber}`
      );

      setBedInfo(res.data);

      setSelectedBed({
        roomId,
        bedNumber,
      });

      setModalOpen(true);

    } catch {

      alert("Unable to fetch bed details");

    }

  };

  /* =============================
     DEALLOCATE BED
  ============================= */

  const removeAllocation = async () => {

    const confirm = window.confirm(
      "Are you sure you want to remove this student from the bed?"
    );

    if (!confirm) return;

    try {

      await api.delete(`/warden/bed/${bedInfo.allocationId}`);

      alert("Bed deallocated successfully");

      setModalOpen(false);
      setBedInfo(null);

      loadRooms();

    } catch {

      alert("Failed to deallocate bed");

    }

  };

  /* =============================
     UI
  ============================= */

  return (
    <div className="allocation-container">

      <h2 className="page-title">Room Allocation</h2>

      {/* STATS */}

      <div className="stats-bar">

        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Beds</p>
        </div>

        <div className="stat-card green">
          <h3>{stats.available}</h3>
          <p>Available</p>
        </div>

        <div className="stat-card red">
          <h3>{stats.occupied}</h3>
          <p>Occupied</p>
        </div>

        <div className="stat-card blue">
          <h3>{stats.percent}%</h3>
          <p>Availability</p>
        </div>

      </div>

      {/* ROOMS */}

      {rooms.map((room) => (

        <div key={room._id} className="room-box">

          <h3 className="room-title">
            Room {room.roomNumber}
          </h3>

          <div className="beds-grid">

            {room.beds.map((bed) => (

              <div
                key={bed.number}
                className={`bed-card ${bed.status}`}
                onClick={() => handleBedClick(room, bed)}
              >

                <div className="bed-number">
                  Bed-{bed.number}
                </div>

                <div className="bed-status">
                  {bed.status}
                </div>

              </div>

            ))}

          </div>

        </div>

      ))}

      {/* MODAL */}

      {modalOpen && (

        <div className="modal-overlay">

          <div className="modal-box">

            {/* OCCUPIED BED DETAILS */}

            {bedInfo ? (

              <>
                <h3>Bed Details</h3>

                <p>
                  <b>Student:</b> {bedInfo.studentName}
                </p>

                <p>
                  <b>Roll No:</b> {bedInfo.rollNumber}
                </p>

                <div className="modal-actions">

                  <button
                    className="deallocate-btn"
                    onClick={removeAllocation}
                  >
                    Deallocate Bed
                  </button>

                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setModalOpen(false);
                      setBedInfo(null);
                    }}
                  >
                    Back
                  </button>

                </div>
              </>

            ) : (

              <>
                <h3>
                  Allocate Bed-{selectedBed.bedNumber}
                </h3>

                <input
                  type="text"
                  placeholder="Enter Roll Number"
                  value={studentId}
                  onChange={(e) =>
                    setStudentId(e.target.value)
                  }
                />

                <button
                  className="fetch-btn"
                  onClick={fetchStudent}
                >
                  Fetch Student
                </button>

                {studentName && (
                  <p className="student-name">
                    {studentName}
                  </p>
                )}

                <div className="modal-actions">

                  <button
                    className="confirm-btn"
                    onClick={allocateBed}
                    disabled={loading}
                  >
                    {loading
                      ? "Allocating..."
                      : "Confirm"}
                  </button>

                  <button
                    className="cancel-btn"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default RoomAllocation;