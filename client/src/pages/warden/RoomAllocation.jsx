import { useEffect, useState } from "react";
import api from "../../services/api";

/* ── Google Font ─────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

/* ── Palette (matches LeaveDashboard) ────────────────────── */
const P = {
  primary:  "#2563EB",
  green:    "#059669",
  amber:    "#D97706",
  red:      "#DC2626",
  surface:  "#F8FAFF",
  border:   "#E8EEFF",
  text:     "#0F1629",
  muted:    "#6B7A99",
  cardBg:   "#FFFFFF",
};

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ icon, value, label, color, bg }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        background: P.cardBg,
        borderRadius: 20,
        padding: "22px 24px",
        border: `1px solid ${P.border}`,
        boxShadow: hov
          ? "0 6px 24px rgba(37,99,235,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "box-shadow .2s",
        cursor: "default",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: P.text,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: P.muted, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

/* ── Bed Card ────────────────────────────────────────────── */
function BedCard({ bed, room, onClick }) {
  const [hov, setHov] = useState(false);
  const isOccupied = bed.status === "occupied";
  const accent = isOccupied ? P.red : P.green;
  const bgBase = isOccupied ? "#FEF2F2" : "#ECFDF5";
  const bgHov  = isOccupied ? "#FFE4E6" : "#D1FAE5";

  return (
    <div
      onClick={() => onClick(room, bed)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? bgHov : bgBase,
        border: `1.5px solid ${accent}33`,
        borderRadius: 14,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "all .18s",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 120,
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 6px 20px ${accent}20` : "none",
      }}
    >
      {/* Bed icon */}
      <div style={{ fontSize: 20 }}>{isOccupied ? "🛌" : "🛏️"}</div>

      {/* Bed number */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: accent,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        Bed-{bed.number}
      </div>

      {/* Status badge */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          fontWeight: 600,
          color: accent,
          background: `${accent}18`,
          padding: "3px 8px",
          borderRadius: 20,
          width: "fit-content",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: accent,
            display: "inline-block",
          }}
        />
        {bed.status}
      </span>
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────── */
function Modal({ children, onClose }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,22,41,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          width: 420,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const RoomAllocation = () => {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, percent: 0 });

  /* modal state */
  const [selectedBed, setSelectedBed] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bedInfo, setBedInfo] = useState(null);

  /* search / filter */
  const [search, setSearch] = useState("");

  useEffect(() => { loadRooms(); }, []);

  /* ── Load rooms ─── */
  const loadRooms = async () => {
    try {
      const res = await api.get("/warden/rooms-with-beds");
      const data = res.data;
      let total = 0, occupied = 0;
      data.forEach((r) => {
        total += r.totalBeds;
        r.beds.forEach((b) => { if (b.status === "occupied") occupied++; });
      });
      setStats({
        total,
        available: total - occupied,
        occupied,
        percent: total === 0 ? 0 : Math.round(((total - occupied) / total) * 100),
      });
      setRooms(data);
    } catch (err) {
      console.error("Failed to load rooms", err);
    }
  };

  /* ── Bed click ─── */
  const handleBedClick = (room, bed) => {
    if (bed.status === "occupied") {
      fetchBedDetails(room._id, bed.number);
      return;
    }
    setSelectedBed({ roomId: room._id, roomNumber: room.roomNumber, bedNumber: bed.number });
    setStudentId(""); setStudentName(""); setBedInfo(null);
    setModalOpen(true);
  };

  /* ── Fetch student ─── */
  const fetchStudent = async () => {
    if (!studentId.trim()) return alert("Enter Roll Number");
    try {
      const res = await api.get(`/students/by-roll/${studentId}`);
      setStudentName(res.data.fullName);
    } catch {
      setStudentName("Student not found");
    }
  };

  /* ── Allocate ─── */
  const allocateBed = async () => {
    if (!studentName || studentName === "Student not found")
      return alert("Fetch valid student first");
    setLoading(true);
    try {
      await api.post("/warden/allocate-room", {
        studentId,
        room: selectedBed.roomId,
        bedNumber: selectedBed.bedNumber,
      });
      setModalOpen(false); setStudentId(""); setStudentName("");
      loadRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Allocation failed");
    } finally { setLoading(false); }
  };

  /* ── Fetch bed details ─── */
  const fetchBedDetails = async (roomId, bedNumber) => {
    try {
      const res = await api.get(`/warden/rooms/${roomId}/bed/${bedNumber}`);
      setBedInfo(res.data);
      setSelectedBed({ roomId, bedNumber });
      setModalOpen(true);
    } catch {
      alert("Unable to fetch bed details");
    }
  };

  /* ── Deallocate ─── */
  const removeAllocation = async () => {
    if (!window.confirm("Remove this student from the bed?")) return;
    try {
      await api.delete(`/warden/bed/${bedInfo.allocationId}`);
      setModalOpen(false); setBedInfo(null);
      loadRooms();
    } catch {
      alert("Failed to deallocate bed");
    }
  };

  /* ── Filtered rooms ─── */
  const filteredRooms = rooms.filter((r) =>
    !search || String(r.roomNumber).includes(search)
  );

  /* ── UI ─────────────────────────────────────────────────── */
  return (
    <div
      style={{
        fontFamily: "'Sora', sans-serif",
        background: P.surface,
        minHeight: "100vh",
        padding: 24,
        color: P.text,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: P.primary,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            HostelEase · Warden Portal
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: P.text,
            }}
          >
            Room Allocation
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: P.muted }}>
            Manage bed assignments across all hostel rooms
          </p>
        </div>

        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 14px",
            border: `1.5px solid ${P.border}`,
            borderRadius: 12,
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ color: P.muted, fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room number…"
            style={{
              border: "none",
              outline: "none",
              fontSize: 13,
              color: P.text,
              fontFamily: "'Sora', sans-serif",
              background: "none",
              width: 160,
            }}
          />
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard icon="🏨" value={stats.total}     label="Total Beds"   color={P.primary} bg="#EFF6FF" />
        <StatCard icon="✅" value={stats.available}  label="Available"    color={P.green}   bg="#ECFDF5" />
        <StatCard icon="🛌" value={stats.occupied}   label="Occupied"     color={P.red}     bg="#FEF2F2" />
        <StatCard icon="📊" value={`${stats.percent}%`} label="Availability" color={P.primary} bg="#EFF6FF" />
      </div>

      {/* ── Occupancy progress bar ── */}
      {stats.total > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "16px 22px",
            border: `1px solid ${P.border}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span style={{ fontSize: 12, color: P.muted, fontWeight: 600, whiteSpace: "nowrap" }}>
            Overall Occupancy
          </span>
          <div
            style={{
              flex: 1,
              height: 8,
              background: "#EFF6FF",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0}%`,
                background: `linear-gradient(90deg, ${P.red}, #F87171)`,
                borderRadius: 99,
                transition: "width .5s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: P.red,
              fontFamily: "'DM Mono', monospace",
              whiteSpace: "nowrap",
            }}
          >
            {stats.total
              ? Math.round((stats.occupied / stats.total) * 100)
              : 0}
            % occupied
          </span>
        </div>
      )}

      {/* ── Rooms Grid ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {filteredRooms.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: `1px solid ${P.border}`,
              padding: "60px 24px",
              textAlign: "center",
              color: P.muted,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>🚪</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {search ? "No rooms match your search" : "No rooms found"}
            </div>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const roomOccupied = room.beds.filter((b) => b.status === "occupied").length;
            const roomTotal    = room.beds.length;
            const roomPct      = roomTotal ? Math.round((roomOccupied / roomTotal) * 100) : 0;

            return (
              <div
                key={room._id}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: `1px solid ${P.border}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Room header */}
                <div
                  style={{
                    padding: "16px 22px 14px",
                    borderBottom: `1px solid ${P.border}`,
                    background: "#FAFBFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "#EFF6FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                      }}
                    >
                      🏠
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: P.text,
                        }}
                      >
                        Room {room.roomNumber}
                      </div>
                      <div style={{ fontSize: 11, color: P.muted }}>
                        {roomOccupied}/{roomTotal} beds occupied
                      </div>
                    </div>
                  </div>

                  {/* Mini progress */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 100,
                        height: 6,
                        background: "#EFF6FF",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${roomPct}%`,
                          background:
                            roomPct > 75
                              ? `linear-gradient(90deg,${P.red},#F87171)`
                              : roomPct > 40
                              ? `linear-gradient(90deg,${P.amber},#FCD34D)`
                              : `linear-gradient(90deg,${P.green},#34D399)`,
                          borderRadius: 99,
                          transition: "width .4s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "'DM Mono', monospace",
                        color: P.muted,
                      }}
                    >
                      {roomPct}%
                    </span>
                  </div>
                </div>

                {/* Beds */}
                <div
                  style={{
                    padding: "18px 22px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {room.beds.map((bed) => (
                    <BedCard
                      key={bed.number}
                      bed={bed}
                      room={room}
                      onClick={handleBedClick}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ══ MODAL ══════════════════════════════════════════ */}
      {modalOpen && (
        <Modal onClose={() => { setModalOpen(false); setBedInfo(null); }}>
          {bedInfo ? (
            /* ── Occupied Bed Info ── */
            <>
              <div
                style={{
                  background: `linear-gradient(135deg, ${P.red}, #B91C1C)`,
                  padding: "24px 28px",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  Bed Details
                </div>
                <div style={{ fontSize: 13, color: "#FECACA", marginTop: 4 }}>
                  Room {selectedBed?.roomNumber || ""} · Bed-{bedInfo.bedNumber || selectedBed?.bedNumber}
                </div>
              </div>

              <div style={{ padding: "24px 28px" }}>
                {[
                  ["👤 Student", bedInfo.studentName],
                  ["🎓 Roll No", bedInfo.rollNumber],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: `1px solid ${P.border}`,
                    }}
                  >
                    <span style={{ fontSize: 13, color: P.muted, fontWeight: 600 }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: P.text,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: "0 28px 24px",
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => { setModalOpen(false); setBedInfo(null); }}
                  style={{
                    padding: "10px 20px",
                    border: `1.5px solid ${P.border}`,
                    borderRadius: 12,
                    background: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: P.muted,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={removeAllocation}
                  style={{
                    padding: "10px 20px",
                    background: P.red,
                    border: "none",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Deallocate Bed
                </button>
              </div>
            </>
          ) : (
            /* ── Allocate Bed ── */
            <>
              <div
                style={{
                  background: `linear-gradient(135deg, ${P.primary}, #1D4ED8)`,
                  padding: "24px 28px",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  Allocate Bed
                </div>
                <div style={{ fontSize: 13, color: "#BFDBFE", marginTop: 4 }}>
                  Room {selectedBed?.roomNumber} · Bed-{selectedBed?.bedNumber}
                </div>
              </div>

              <div style={{ padding: "24px 28px" }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: P.text,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Student Roll Number
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter Roll Number"
                    value={studentId}
                    onChange={(e) => { setStudentId(e.target.value); setStudentName(""); }}
                    style={{
                      flex: 1,
                      border: `1.5px solid ${P.border}`,
                      borderRadius: 12,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontFamily: "'Sora', sans-serif",
                      color: P.text,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={fetchStudent}
                    style={{
                      padding: "10px 16px",
                      background: P.primary,
                      border: "none",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Sora', sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Fetch
                  </button>
                </div>

                {studentName && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background:
                        studentName === "Student not found" ? "#FEF2F2" : "#ECFDF5",
                      border: `1.5px solid ${studentName === "Student not found" ? P.red : P.green}33`,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>
                      {studentName === "Student not found" ? "❌" : "✅"}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color:
                          studentName === "Student not found" ? P.red : P.green,
                      }}
                    >
                      {studentName}
                    </span>
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: "0 28px 24px",
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    border: `1.5px solid ${P.border}`,
                    borderRadius: 12,
                    background: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: P.muted,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={allocateBed}
                  disabled={loading || !studentName || studentName === "Student not found"}
                  style={{
                    padding: "10px 22px",
                    background:
                      loading || !studentName || studentName === "Student not found"
                        ? "#93C5FD"
                        : P.primary,
                    border: "none",
                    borderRadius: 12,
                    cursor:
                      loading || !studentName || studentName === "Student not found"
                        ? "not-allowed"
                        : "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {loading ? "Allocating…" : "Confirm Allocation"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default RoomAllocation;