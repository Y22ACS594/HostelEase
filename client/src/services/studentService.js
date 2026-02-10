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
  return res.data; // null OR allocation
};
