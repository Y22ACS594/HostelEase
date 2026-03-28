import api from "./api";

export const getMyProfile = async () => {
  const res = await api.get("/students/profile");
  return res.data;
};

export const createStudent = (data) => {
  return api.post("/students/create", data);
};

export const getRoomStatus = async () => {
  const res = await api.get("/students/room-status");
  return res.data;
};

// Fetch roommates — students sharing the same room (active allocations)
export const getRoommates = async () => {
  const res = await api.get("/students/roommates");
  return res.data; // { roommates: [...] }
};

export const getStudents = (filters) => {
  return api.get("/students", { params: filters });
};