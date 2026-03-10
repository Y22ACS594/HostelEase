// services/leaveService.js
//
// ✅ FIX: Uses the shared `api` instance (baseURL = http://localhost:5000/api)
//    OLD bug: used raw axios + `${VITE_API_URL}/api/leave/apply`
//            = http://localhost:5000/api/api/leave/apply  ← 404 double /api/
//    NOW: api.post("/leave/apply") = http://localhost:5000/api/leave/apply ✅

import api from "./api";

// ── STUDENT ──────────────────────────────────────────────────
export const applyLeave  = (data) => api.post("/leave/apply",    data);
export const getMyLeaves = ()     => api.get("/leave/my-leaves");

// ── WARDEN ───────────────────────────────────────────────────
export const getAllLeaves = () => api.get("/warden/leaves");

export const updateLeaveStatus = (id, status, rejectionReason = "") => {
  const body = { status };
  if (status === "Rejected") body.rejectionReason = rejectionReason;
  return api.put(`/warden/leaves/${id}`, body);
};