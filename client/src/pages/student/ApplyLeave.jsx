import { useState } from "react";
import { applyLeave } from "../../services/leaveService";
import "./ApplyLeave.css";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAVE_TYPES = [
  { value: "Casual",    label: "Casual Leave",    icon: "🏖️",  accent: "#6C63FF" },
  { value: "Medical",   label: "Medical Leave",   icon: "🏥",  accent: "#EF4444" },
  { value: "Emergency", label: "Emergency Leave", icon: "⚡",  accent: "#F59E0B" },
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const INITIAL_FORM = {
  leaveType: "Casual",
  fromDate: "",
  toDate: "",
  destination: "",
  reason: "",
  emergencyContact: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcDays(from, to) {
  if (!from || !to) return 0;
  const s = new Date(from), e = new Date(to);
  if (e < s) return 0;
  return Math.ceil((e - s) / 864e5) + 1;
}

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatLabel(iso) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ value, minDate, onChange }) {
  const seed = value
    ? new Date(value + "T00:00:00")
    : minDate
    ? new Date(minDate + "T00:00:00")
    : new Date();

  const [year, setYear]   = useState(seed.getFullYear());
  const [month, setMonth] = useState(seed.getMonth());

  const min = minDate ? new Date(minDate + "T00:00:00") : null;
  const sel = value   ? new Date(value   + "T00:00:00") : null;

  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays    = new Date(year, month + 1, 0).getDate();

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function pick(d) {
    const date = new Date(year, month, d);
    if (min && date < min) return;
    onChange(toISO(year, month, d));
  }

  function dayState(d) {
    const date = new Date(year, month, d);
    if (min && date < min) return "disabled";
    if (sel && date.toDateString() === sel.toDateString()) return "selected";
    const today = new Date(); today.setHours(0,0,0,0);
    if (date.toDateString() === today.toDateString()) return "today";
    return "normal";
  }

  const cells = Array(firstWeekday).fill(null)
    .concat(Array.from({ length: totalDays }, (_, i) => i + 1));

  return (
    <div className="al-calendar">
      <div className="al-cal-header">
        <button type="button" className="al-cal-nav" onClick={prev}>‹</button>
        <span className="al-cal-title">{MONTHS[month]} {year}</span>
        <button type="button" className="al-cal-nav" onClick={next}>›</button>
      </div>
      <div className="al-cal-grid">
        {DAY_LABELS.map(d => (
          <div key={d} className="al-cal-daylabel">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`al-cal-cell al-cal-cell--${d ? dayState(d) : "empty"}`}
            onClick={() => d && dayState(d) !== "disabled" && pick(d)}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function FieldRow({ icon, accent, label, children, clickable, onClick, chevron }) {
  return (
    <div
      className={`al-field${clickable ? " al-field--clickable" : ""}`}
      onClick={onClick}
    >
      <div className="al-field-icon" style={{ background: accent }}>
        <span>{icon}</span>
      </div>
      <div className="al-field-body">
        <span className="al-field-label">{label}</span>
        <div className="al-field-content">{children}</div>
      </div>
      {chevron && <span className="al-field-chevron">{chevron}</span>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ApplyLeave = () => {
  const [form, setForm]         = useState({ ...INITIAL_FORM });
  const [openCal, setOpenCal]   = useState(null); // "from" | "to" | null
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus]     = useState(null); // { type: "success"|"error", text }

  const days       = calcDays(form.fromDate, form.toDate);
  const leaveInfo  = LEAVE_TYPES.find(l => l.value === form.leaveType) || LEAVE_TYPES[0];

  // ── Form helpers ────────────────────────────────────────────────────────────
  function set(name, value) {
    setForm(f => ({ ...f, [name]: value }));
    setStatus(null);
  }

  function toggleCal(key) {
    setOpenCal(prev => (prev === key ? null : key));
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (days === 0) {
      setStatus({ type: "error", text: "Please select valid From and To dates." });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await applyLeave({ ...form, totalDays: days });
      setStatus({ type: "success", text: `Leave applied successfully for ${days} day${days > 1 ? "s" : ""}! 🎉` });
      setForm({ ...INITIAL_FORM });
    } catch (err) {
      setStatus({ type: "error", text: err?.response?.data?.message || "Failed to submit leave. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="al-page">
      {/* Decorative background blobs */}
      <div className="al-blob al-blob--top" />
      <div className="al-blob al-blob--bottom" />

      <div className="al-card">

        {/* ── Header ── */}
        <div className="al-header">
          <div className="al-header-icon">📋</div>
          <div>
            <h2 className="al-heading">New Leave Request</h2>
            <p className="al-subheading">Fill in the details below to apply for leave</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="al-form" noValidate>

          {/* ── Leave Type ── */}
          <FieldRow icon={leaveInfo.icon} accent={leaveInfo.accent} label="Leave Type">
            <select
              className="al-select"
              name="leaveType"
              value={form.leaveType}
              onChange={e => set("leaveType", e.target.value)}
            >
              {LEAVE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </FieldRow>

          {/* ── From Date ── */}
          <FieldRow
            icon="📅"
            accent="#6C63FF"
            label="From Date"
            clickable
            onClick={() => toggleCal("from")}
            chevron={openCal === "from" ? "▲" : "▼"}
          >
            <span className={`al-date-display${!form.fromDate ? " al-date-display--placeholder" : ""}`}>
              {form.fromDate ? formatLabel(form.fromDate) : "Select start date"}
            </span>
          </FieldRow>

          {openCal === "from" && (
            <MiniCalendar
              value={form.fromDate}
              onChange={v => { set("fromDate", v); set("toDate", ""); setOpenCal(null); }}
            />
          )}

          {/* ── To Date ── */}
          <FieldRow
            icon="📅"
            accent="#4F46E5"
            label="To Date"
            clickable
            onClick={() => toggleCal("to")}
            chevron={openCal === "to" ? "▲" : "▼"}
          >
            <span className={`al-date-display${!form.toDate ? " al-date-display--placeholder" : ""}`}>
              {form.toDate ? formatLabel(form.toDate) : "Select end date"}
            </span>
          </FieldRow>

          {openCal === "to" && (
            <MiniCalendar
              value={form.toDate}
              minDate={form.fromDate || undefined}
              onChange={v => { set("toDate", v); setOpenCal(null); }}
            />
          )}

          {/* ── Days Badge ── */}
          {days > 0 && (
            <div className="al-days-badge">
              <span className="al-days-num">{days}</span>
              <div className="al-days-text">
                <span className="al-days-label">{days === 1 ? "Day" : "Days"}</span>
                <span className="al-days-sub">of {leaveInfo.label}</span>
              </div>
              <div className="al-days-bar" style={{ "--accent": leaveInfo.accent }} />
            </div>
          )}

          {/* ── Destination ── */}
          <FieldRow icon="📍" accent="#10B981" label="Destination">
            <input
              className="al-input"
              type="text"
              name="destination"
              value={form.destination}
              onChange={e => set("destination", e.target.value)}
              placeholder="Where are you going?"
              required
            />
          </FieldRow>

          {/* ── Reason ── */}
          <FieldRow icon="📝" accent="#3B82F6" label="Reason for Leave">
            <textarea
              className="al-textarea"
              name="reason"
              value={form.reason}
              onChange={e => set("reason", e.target.value)}
              placeholder="Briefly describe your reason..."
              rows={3}
              required
            />
          </FieldRow>

          {/* ── Emergency Contact ── */}
          <FieldRow icon="📞" accent="#F59E0B" label="Emergency Contact">
            <input
              className="al-input"
              type="tel"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={e => set("emergencyContact", e.target.value)}
              placeholder="Parent / Guardian phone number"
              required
            />
          </FieldRow>

          {/* ── Status Message ── */}
          {status && (
            <div className={`al-status al-status--${status.type}`}>
              <span className="al-status-icon">
                {status.type === "success" ? "✅" : "❌"}
              </span>
              <span>{status.text}</span>
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            className={`al-submit${submitting ? " al-submit--loading" : ""}${status?.type === "success" ? " al-submit--success" : ""}`}
            disabled={submitting}
            style={{ "--accent": leaveInfo.accent }}
          >
            {submitting ? (
              <>
                <span className="al-spinner" />
                Submitting…
              </>
            ) : status?.type === "success" ? (
              "✓ Leave Submitted!"
            ) : days > 0 ? (
              `Apply for ${days} Day${days > 1 ? "s" : ""} Leave`
            ) : (
              "Apply Leave"
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;