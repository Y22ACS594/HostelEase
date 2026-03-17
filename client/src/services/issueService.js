// services/issueService.js
import api from "./api";

export const raiseIssue         = (data)   => api.post("/issues", data);
export const getMyIssues        = ()       => api.get("/issues/my");
export const getAllIssues        = (params) => {
  const q = new URLSearchParams(params || {}).toString();
  return api.get(`/issues${q ? `?${q}` : ""}`);
};
export const getIssueStats      = ()       => api.get("/issues/stats");
export const updateIssueStatus  = (id, data) => api.patch(`/issues/${id}/status`, data);