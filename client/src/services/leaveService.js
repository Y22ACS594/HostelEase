import api from "./api";

// Student
export const applyLeave = (data) =>
  api.post("/leave/apply", data);

export const getMyLeaves = () =>
  api.get("/leave/my");

// Warden
export const getAllLeaves = () =>
  api.get("/warden/leaves");

export const updateLeaveStatus = (id, status, remarks) =>
  api.put(`/warden/leaves/${id}`, { status, remarks });
