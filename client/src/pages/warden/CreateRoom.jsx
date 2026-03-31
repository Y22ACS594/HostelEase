// pages/warden/CreateRoom.jsx
import { useState, useEffect } from "react";
import { createRoom } from "../../services/roomService";

if (!document.getElementById("cr-font")) {
  const l = document.createElement("link");
  l.id   = "cr-font";
  l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}

const P = {
  primary:"#2563EB", indigo:"#4338CA", surface:"#F8FAFF",
  border:"#E8EEFF", text:"#0F1629", muted:"#6B7A99",
  green:"#059669", red:"#DC2626",
};

const PRESETS = [2, 3, 4, 5, 6];
const initialState = { blockName:"", roomNumber:"", totalBeds:"" };

/* ── useIsMobile ── OUTSIDE component ─────────────────── */
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

/* ══════════════════════════════════════════════════════
   ⚠️  CRITICAL: Field MUST be defined OUTSIDE CreateRoom.
   If defined inside, React sees a new component type on
   every render → unmounts input → loses focus after 1 char.
══════════════════════════════════════════════════════ */
function Field({ label, required, children }) {
  return (
    <div>
      <label style={{
        display:"block", fontSize:11, fontWeight:700,
        color:P.muted, textTransform:"uppercase",
        letterSpacing:"0.08em", marginBottom:8,
      }}>
        {label}
        {required && <span style={{ color:P.red, marginLeft:2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const CreateRoom = () => {
  const isMobile = useIsMobile();
  const [form,       setForm]       = useState(initialState);
  const [status,     setStatus]     = useState("");
  const [errMsg,     setErrMsg]     = useState("");
  const [loading,    setLoading]    = useState(false);
  const [focusField, setFocusField] = useState("");

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const setBeds = (n) =>
    setForm(f => ({ ...f, totalBeds: String(n) }));

  const inputStyle = (focused) => ({
    width:"100%", padding: isMobile ? "10px 12px" : "11px 14px",
    border:`1.5px solid ${focused ? P.primary : P.border}`,
    borderRadius:12, fontSize: isMobile ? 15 : 14,
    fontFamily:"'Sora',sans-serif",
    color:P.text, background:"#fff", outline:"none",
    boxSizing:"border-box", transition:"border .15s",
    boxShadow:focused ? "0 0 0 3px rgba(37,99,235,0.10)" : "none",
  });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus(""); setErrMsg("");
    try {
      await createRoom(form);
      setStatus("success");
      setForm(initialState);
      setTimeout(() => setStatus(""), 4000);
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Failed to create room. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily:"'Sora',sans-serif", background:P.surface,
      minHeight:"100vh",
      padding: isMobile ? "20px 16px" : "32px 36px",
      color:P.text,
    }}>
      <style>{`
        @keyframes cr-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes cr-spin  { to{transform:rotate(360deg)} }
        .cr-preset:hover { border-color:${P.primary}!important; color:${P.primary}!important; }
      `}</style>

      <div style={{ maxWidth:580, margin:"0 auto", animation:"cr-fade .4s ease" }}>

        {/* Page header */}
        <div style={{ marginBottom: isMobile ? 20 : 28 }}>
          <div style={{
            fontSize:10, fontWeight:700, color:P.primary,
            letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4,
          }}>
            HostelEase · Warden Portal
          </div>
          <h1 style={{ margin:0, fontSize: isMobile ? 22 : 26, fontWeight:800, letterSpacing:"-0.5px" }}>
            🏗️ Create New Room
          </h1>
          <p style={{ margin:"6px 0 0", fontSize:13, color:P.muted }}>
            Add a new room to your hostel's floor plan
          </p>
        </div>

        {/* Success banner */}
        {status === "success" && (
          <div style={{
            background:"#D1FAE5", border:"1px solid #6EE7B7",
            borderRadius:14, padding:"14px 18px", marginBottom:20,
            display:"flex", alignItems:"center", gap:12,
            animation:"cr-fade .3s ease",
          }}>
            <div style={{
              width:36, height:36, borderRadius:"50%",
              background:"#059669", display:"flex",
              alignItems:"center", justifyContent:"center",
              fontSize:18, flexShrink:0,
            }}>✅</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#065F46" }}>
                Room created successfully!
              </div>
              <div style={{ fontSize:12, color:"#047857", marginTop:2 }}>
                The room is now available for student allocation.
              </div>
            </div>
            <button onClick={() => setStatus("")}
              style={{ marginLeft:"auto", background:"none", border:"none",
                cursor:"pointer", color:"#065F46", fontSize:18, lineHeight:1 }}>
              ×
            </button>
          </div>
        )}

        {/* Error banner */}
        {status === "error" && (
          <div style={{
            background:"#FEE2E2", border:"1px solid #FECACA",
            borderRadius:14, padding:"14px 18px", marginBottom:20,
            display:"flex", alignItems:"center", gap:10,
            animation:"cr-fade .3s ease",
          }}>
            <span style={{ fontSize:18 }}>❌</span>
            <div style={{ fontSize:13, fontWeight:600, color:"#991B1B" }}>{errMsg}</div>
            <button onClick={() => setStatus("")}
              style={{ marginLeft:"auto", background:"none", border:"none",
                cursor:"pointer", color:"#991B1B", fontSize:18, lineHeight:1 }}>
              ×
            </button>
          </div>
        )}

        {/* Form card */}
        <div style={{
          background:"#fff", border:`1px solid ${P.border}`,
          borderRadius:20, padding: isMobile ? "20px 18px" : "28px 32px",
          boxShadow:"0 4px 20px rgba(37,99,235,0.08)",
        }}>

          {/* Card title row */}
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            paddingBottom:20, marginBottom:24,
            borderBottom:`1px solid ${P.border}`,
          }}>
            <div style={{
              width:44, height:44, borderRadius:12,
              background:`linear-gradient(135deg,${P.primary},${P.indigo})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, boxShadow:"0 4px 12px rgba(37,99,235,0.28)",
            }}>🏠</div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:P.text }}>Room Details</div>
              <div style={{ fontSize:12, color:P.muted, marginTop:2 }}>
                Fill in the room info below
              </div>
            </div>
          </div>

          <form onSubmit={submit}>
            <div style={{ display:"grid", gap:20 }}>

              {/* Block Name */}
              <Field label="Block Name" required>
                <input
                  name="blockName"
                  value={form.blockName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Block A"
                  style={inputStyle(focusField === "blockName")}
                  onFocus={() => setFocusField("blockName")}
                  onBlur={()  => setFocusField("")}
                />
              </Field>

              {/* Room Number */}
              <Field label="Room Number" required>
                <input
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 101"
                  style={inputStyle(focusField === "roomNumber")}
                  onFocus={() => setFocusField("roomNumber")}
                  onBlur={()  => setFocusField("")}
                />
              </Field>

              {/* Total Beds */}
              <Field label="Total Beds" required>
                {/* Quick preset chips */}
                <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                  {PRESETS.map(n => {
                    const sel = form.totalBeds === String(n);
                    return (
                      <button key={n} type="button"
                        className="cr-preset"
                        onClick={() => setBeds(n)}
                        style={{
                          padding:"6px 16px", borderRadius:9, cursor:"pointer",
                          border:`1.5px solid ${sel ? P.primary : P.border}`,
                          background:sel ? "#EFF6FF" : "#fff",
                          color:sel ? P.primary : P.muted,
                          fontSize:13, fontWeight:700,
                          fontFamily:"'Sora',sans-serif",
                          transition:"all .15s",
                        }}>
                        {n} Beds
                      </button>
                    );
                  })}
                </div>
                <input
                  type="number"
                  name="totalBeds"
                  value={form.totalBeds}
                  onChange={handleChange}
                  required
                  min="1"
                  max="20"
                  placeholder="Or enter custom number…"
                  style={inputStyle(focusField === "totalBeds")}
                  onFocus={() => setFocusField("totalBeds")}
                  onBlur={()  => setFocusField("")}
                />
              </Field>

              {/* Preview strip */}
              {(form.blockName || form.roomNumber || form.totalBeds) && (
                <div style={{
                  background:`linear-gradient(135deg,${P.primary},${P.indigo})`,
                  borderRadius:14, padding:"16px 18px",
                  display:"flex", alignItems:"center", gap:14,
                  animation:"cr-fade .3s ease",
                }}>
                  <div style={{ fontSize:32 }}>🏢</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)",
                      fontWeight:600, textTransform:"uppercase",
                      letterSpacing:"0.07em", marginBottom:4 }}>
                      Preview
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>
                      {form.blockName || "—"} · Room {form.roomNumber || "—"}
                    </div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>
                      {form.totalBeds ? `${form.totalBeds} beds` : "Beds not set"}
                    </div>
                  </div>
                  {form.totalBeds && (
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap", maxWidth:120 }}>
                      {Array.from({length:Math.min(Number(form.totalBeds),10)}).map((_,i)=>(
                        <div key={i} style={{
                          width:14, height:14, borderRadius:3,
                          background:"rgba(255,255,255,0.3)",
                        }}/>
                      ))}
                      {Number(form.totalBeds) > 10 && (
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)",
                          alignSelf:"center", marginLeft:2 }}>
                          +{Number(form.totalBeds)-10}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{
                  width:"100%", padding:"13px",
                  background:loading ? "rgba(37,99,235,0.5)"
                    : `linear-gradient(135deg,${P.primary},${P.indigo})`,
                  border:"none", borderRadius:14,
                  cursor:loading ? "not-allowed" : "pointer",
                  fontSize:15, fontWeight:700, color:"#fff",
                  fontFamily:"'Sora',sans-serif",
                  boxShadow:loading ? "none" : "0 6px 20px rgba(37,99,235,0.32)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  transition:"all .2s",
                }}>
                {loading ? (
                  <>
                    <span style={{
                      width:16, height:16,
                      border:"2px solid rgba(255,255,255,0.35)",
                      borderTop:"2px solid #fff", borderRadius:"50%",
                      display:"inline-block", animation:"cr-spin .7s linear infinite",
                    }}/>
                    Creating room…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor"
                      strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Create Room
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info footer */}
        <div style={{
          marginTop:16, padding:"13px 18px",
          background:"#fff", border:`1px solid ${P.border}`,
          borderRadius:14, display:"flex", gap:12, alignItems:"flex-start",
        }}>
          <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
          <div style={{ fontSize:12, color:P.muted, lineHeight:1.6 }}>
            Once created, students can be allocated to individual beds from the
            <strong style={{ color:P.text }}> Room Allocation</strong> page.
            The room will immediately appear in your hostel floor map.
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateRoom;