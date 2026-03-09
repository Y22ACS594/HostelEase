import { useEffect, useState } from "react";
import { getMyLeaves } from "../../services/leaveService";
import "./LeaveStatus.css";

// ─── Config ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: "All",       label: "All",       dot: null },
  { key: "Casual",    label: "Casual",    dot: "#F59E0B" },
  { key: "Medical",   label: "Medical",   dot: "#EF4444" },
  { key: "Emergency", label: "Emergency", dot: "#6C63FF" },
];

const TYPE_COLORS = {
  Casual:    { text: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
  Medical:   { text: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
  Emergency: { text: "#7C3AED", bg: "#F5F3FF", dot: "#6C63FF" },
};

const STATUS_CONFIG = {
  Pending:  { label: "Awaiting",  text: "#92400E", bg: "#FEF3C7", border: "#FDE68A" },
  Approved: { label: "Approved",  text: "#065F46", bg: "#ECFDF5", border: "#6EE7B7" },
  Rejected: { label: "Declined",  text: "#991B1B", bg: "#FEF2F2", border: "#FECACA" },
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const WEEK_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDuration(from, to) {
  return Math.ceil((new Date(to) - new Date(from)) / 864e5) + 1;
}

function getDurationLabel(from, to) {
  const d = getDuration(from, to);
  if (d === 1) return "Full Day Application";
  if (d === 0.5) return "Half Day Application";
  return `${d} Days Application`;
}

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${WEEK_DAYS[d.getDay()]}, ${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()].slice(0,3)}`;
}

function fmtMonthYear(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtShort(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()].slice(0,3)}`;
}

// Group leaves by month label (newest first within each month)
function groupByMonth(leaves) {
  const map = {};
  const order = [];
  leaves.forEach(lv => {
    const key = fmtMonthYear(lv.fromDate.slice(0, 10));
    if (!map[key]) { map[key] = []; order.push(key); }
    map[key].push(lv);
  });
  return order.map(k => ({ month: k, items: map[k] }));
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ status }) {
  const step = status === "Pending" ? 2 : 3;
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";

  const steps = [
    { label: "Applied",      active: step >= 1, color: null },
    { label: "Under Review", active: step >= 2, color: null },
    { label: status === "Rejected" ? "Declined" : status === "Approved" ? "Approved" : "Pending",
      active: step >= 3,
      color: isApproved ? "#10B981" : isRejected ? "#EF4444" : null },
  ];

  return (
    <div className="ls-timeline">
      {steps.map((s, i) => (
        <div key={i} className="ls-timeline-row">
          {/* Node */}
          <div className="ls-tl-node-wrap">
            <div
              className={`ls-tl-circle ${s.active ? "ls-tl-circle--active" : ""}`}
              style={s.active && s.color ? { background: s.color, boxShadow: `0 0 0 4px ${s.color}22` } : {}}
            />
            <span
              className={`ls-tl-label ${s.active ? "ls-tl-label--active" : ""}`}
              style={s.active && s.color ? { color: s.color } : {}}
            >
              {s.label}
            </span>
          </div>
          {/* Connector */}
          {i < steps.length - 1 && (
            <div className={`ls-tl-line ${step > i + 1 ? "ls-tl-line--active" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Expanded Detail Panel ────────────────────────────────────────────────────
function LeaveDetail({ leave }) {
  const duration = getDuration(leave.fromDate.slice(0,10), leave.toDate.slice(0,10));

  return (
    <div className="ls-detail">
      <Timeline status={leave.status} />

      <div className="ls-detail-grid">
        <div className="ls-detail-item">
          <span className="ls-detail-key">📍 Destination</span>
          <span className="ls-detail-val">{leave.destination || "—"}</span>
        </div>
        <div className="ls-detail-item">
          <span className="ls-detail-key">📅 Duration</span>
          <span className="ls-detail-val">{duration} {duration === 1 ? "day" : "days"}</span>
        </div>
        <div className="ls-detail-item ls-detail-item--full">
          <span className="ls-detail-key">📝 Reason</span>
          <span className="ls-detail-val">{leave.reason || "—"}</span>
        </div>
        {leave.emergencyContact && (
          <div className="ls-detail-item">
            <span className="ls-detail-key">📞 Emergency Contact</span>
            <span className="ls-detail-val">{leave.emergencyContact}</span>
          </div>
        )}
        {leave.status === "Rejected" && (
          <div className="ls-detail-item ls-detail-item--full ls-remark">
            <span className="ls-detail-key">🏫 Warden Remark</span>
            <span className="ls-remark-val">{leave.remark || "No reason provided"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Single Leave Card ────────────────────────────────────────────────────────
function LeaveCard({ leave, index }) {
  const [open, setOpen] = useState(false);

  const from = leave.fromDate.slice(0, 10);
  const to   = leave.toDate.slice(0, 10);
  const duration = getDuration(from, to);
  const durationLabel = getDurationLabel(from, to);
  const typeStyle = TYPE_COLORS[leave.leaveType] || TYPE_COLORS.Casual;
  const statusCfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.Pending;

  const dateLabel = duration === 1
    ? fmtDate(from)
    : `${fmtDate(from)} — ${fmtShort(to)}`;

  return (
    <div
      className={`ls-card ${open ? "ls-card--open" : ""}`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* ── Card header row ── */}
      <div className="ls-card-main" onClick={() => setOpen(o => !o)}>
        <div className="ls-card-left">
          <span className="ls-card-duration-label">{durationLabel}</span>
          <span className="ls-card-date">{dateLabel}</span>
          <span
            className="ls-card-type"
            style={{ color: typeStyle.text }}
          >
            <span
              className="ls-card-dot"
              style={{ background: typeStyle.dot }}
            />
            {leave.leaveType}
          </span>
        </div>

        <div className="ls-card-right">
          <span
            className="ls-card-status"
            style={{
              color: statusCfg.text,
              background: statusCfg.bg,
              border: `1px solid ${statusCfg.border}`,
            }}
          >
            {statusCfg.label}
          </span>
          <span className={`ls-card-chevron ${open ? "ls-card-chevron--open" : ""}`}>›</span>
        </div>
      </div>

      {/* ── Expandable detail ── */}
      <div className={`ls-card-expand ${open ? "ls-card-expand--open" : ""}`}>
        <div className="ls-card-expand-inner">
          <LeaveDetail leave={leave} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const LeaveStatus = () => {
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("All");

  useEffect(() => { loadLeaves(); }, []);

  const loadLeaves = async () => {
    try {
      const res = await getMyLeaves();
      // Sort newest first
      const sorted = [...(res.data || [])].sort(
        (a, b) => new Date(b.fromDate) - new Date(a.fromDate)
      );
      setLeaves(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tab === "All"
    ? leaves
    : leaves.filter(l => l.leaveType === tab);

  const grouped = groupByMonth(filtered);

  // ── Summary counts for tabs ──
  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "All"
      ? leaves.length
      : leaves.filter(l => l.leaveType === t.key).length;
    return acc;
  }, {});

  // ── States ──
  if (loading) {
    return (
      <div className="ls-page ls-page--center">
        <div className="ls-skeleton-list">
          {[1,2,3].map(i => (
            <div key={i} className="ls-skeleton-card">
              <div className="ls-skeleton-line ls-skeleton-line--sm" />
              <div className="ls-skeleton-line ls-skeleton-line--lg" />
              <div className="ls-skeleton-line ls-skeleton-line--md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!leaves.length) {
    return (
      <div className="ls-page ls-page--center">
        <div className="ls-empty">
          <span className="ls-empty-icon">🏖️</span>
          <h3>No Leave Requests Yet</h3>
          <p>Your leave history will appear here once you apply.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ls-page">
      {/* ── Background blobs ── */}
      <div className="ls-blob ls-blob--a" />
      <div className="ls-blob ls-blob--b" />

      <div className="ls-inner">

        {/* ── Page heading ── */}
        <div className="ls-top-row">
          <div>
            <h1 className="ls-heading">Leaves</h1>
            <p className="ls-subheading">{leaves.length} total request{leaves.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="ls-summary-badges">
            {["Approved","Pending","Rejected"].map(s => {
              const n = leaves.filter(l => l.status === s).length;
              const cfg = STATUS_CONFIG[s];
              return n > 0 ? (
                <span
                  key={s}
                  className="ls-summary-badge"
                  style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  {n} {STATUS_CONFIG[s].label}
                </span>
              ) : null;
            })}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="ls-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`ls-tab ${tab === t.key ? "ls-tab--active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.dot && (
                <span className="ls-tab-dot" style={{ background: t.dot }} />
              )}
              {t.label}
              {counts[t.key] > 0 && (
                <span className="ls-tab-count">{counts[t.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── No results for this filter ── */}
        {filtered.length === 0 ? (
          <div className="ls-empty-filter">
            <span>No {tab} leave requests found.</span>
          </div>
        ) : (
          /* ── Month groups ── */
          grouped.map(({ month, items }) => (
            <div key={month} className="ls-group">
              <div className="ls-group-header">
                <span className="ls-group-label">{month}</span>
                <span className="ls-group-count">{items.length}</span>
              </div>
              <div className="ls-card-list">
                {items.map((leave, i) => (
                  <LeaveCard key={leave._id} leave={leave} index={i} />
                ))}
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default LeaveStatus;