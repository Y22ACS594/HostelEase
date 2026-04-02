// client/src/services/gateService.js
// All API calls for the Gatekeeper portal

import api from "./api";

// ── Gatekeeper ────────────────────────────────────────────────────────

/** Get all approved students active today */
export const getApprovedList = () => api.get("/gate/approved-list");

/** Search student by roll number → { student, leave, hasActiveApproval } */
export const searchStudent = (roll) =>
  api.get("/gate/search", { params: { roll } });

/** Mark student as exited at gate */
export const markExit = (leaveId) =>
  api.put(`/gate/mark-exit/${leaveId}`);

/** Deny exit at gate */
export const denyAtGate = (leaveId, reason) =>
  api.put(`/gate/deny/${leaveId}`, { reason });

/** Get today's exit log */
export const getExitLogs = (date) =>
  api.get("/gate/exit-logs", date ? { params: { date } } : {});

/** Gate dashboard stats */
export const getGateStats = () => api.get("/gate/stats");

// ── Warden ────────────────────────────────────────────────────────────

/** Warden sends approved list to gatekeeper email */
export const sendApprovedListEmail = (gatekeeperEmail) =>
  api.post("/gate/send-list-email", { gatekeeperEmail });