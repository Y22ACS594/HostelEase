// services/notificationService.js
import api from "./api";

export const getNotifications  = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/notifications${q ? `?${q}` : ""}`);
};
export const getUnreadCount    = ()   => api.get("/notifications/unread-count");
export const markAsRead        = (id) => api.patch(`/notifications/${id}/read`, {});
export const markAllRead       = ()   => api.patch("/notifications/read-all", {});
export const deleteNotification= (id) => api.delete(`/notifications/${id}`);
export const clearAll          = ()   => api.delete("/notifications/clear-all");