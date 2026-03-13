// services/leaveService.js
import api from "./api";

// ── STUDENT ────────────────────────────────────────────────────────────
export const applyLeave  = (data) => api.post("/leave/apply",    data);
export const getMyLeaves = ()     => api.get("/leave/my-leaves");

// ── WARDEN ─────────────────────────────────────────────────────────────

/**
 * getAllLeaves({ page, limit, status, leaveType, studentName, department })
 * Returns: { leaves, pagination: { total, page, limit, totalPages } }
 */
export const getAllLeaves = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== "All") query.set(k, v);
  });
  const qs = query.toString();
  return api.get(`/warden/leaves${qs ? `?${qs}` : ""}`);
};

/**
 * getLeaveStats()
 * Returns: { summary, monthly, byType, byDepartment }
 */
export const getLeaveStats = () => api.get("/leave/stats");

export const updateLeaveStatus = (id, status, rejectionReason = "") => {
  const body = { status };
  if (status === "Rejected") body.rejectionReason = rejectionReason;
  return api.put(`/warden/leaves/${id}`, body);
};