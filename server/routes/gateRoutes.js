// server/routes/gateRoutes.js
// All routes for gatekeeper + warden gate actions

const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");
const authorize= require("../middleware/roleMiddleware");

const {
  getApprovedList,
  searchStudent,
  markExit,
  denyAtGate,
  getExitLogs,
  sendApprovedListEmail,
  getGateStats,
} = require("../controllers/gateController");

// ── Gatekeeper-only routes ─────────────────────────────────────────
const gate = [protect, authorize("gatekeeper", "warden", "admin")];

// Get all approved students active today
router.get("/approved-list",      ...gate, getApprovedList);

// Search by roll number
router.get("/search",             ...gate, searchStudent);

// Mark exit at gate
router.put("/mark-exit/:leaveId", ...gate, markExit);

// Deny exit at gate
router.put("/deny/:leaveId",      ...gate, denyAtGate);

// Today's exit log
router.get("/exit-logs",          ...gate, getExitLogs);

// Stats for gatekeeper dashboard
router.get("/stats",              ...gate, getGateStats);

// ── Warden/Admin-only route ────────────────────────────────────────
// Send approved list email to gatekeeper
router.post(
  "/send-list-email",
  protect,
  authorize("warden", "admin"),
  sendApprovedListEmail
);

module.exports = router;