import api from "./api";
export const createRoom = (data) =>
  api.post("/rooms", data);

export const getAllRooms = () =>
  api.get("/rooms");

export const allocateRoom = (data) =>
  api.post("/warden/allocate-room", data);
