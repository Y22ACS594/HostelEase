import api from "./api";

export const getAllStudents = () => api.get("/warden/students");
export const getStudentDetails = (id) =>
  api.get(`/warden/students/${id}`);
export const deleteStudent = (id) =>
  api.delete(`/warden/students/${id}`);
export const updateStudent = (id, data) =>
  api.put(`/warden/students/${id}`, data);