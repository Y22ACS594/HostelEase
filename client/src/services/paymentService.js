import api from "./api";

export const getMyPayments = () => api.get("/payments/my");

export const initiatePayment = (data) =>
  api.post("/payments/initiate", data);

export const confirmPayment = (id) =>
  api.post(`/payments/confirm/${id}`);
