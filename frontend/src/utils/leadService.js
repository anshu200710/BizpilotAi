import API from "./axios";

export const fetchLeads = (params = {}) =>
  API.get("/api/leads", { params });

export const createLead = (data) =>
  API.post("/api/leads", data);

export const updateLead = (id, data) =>
  API.put(`/api/leads/${id}`, data);

export const updateLeadStatus = (id, data) =>
  API.patch(`/api/leads/${id}/status`, data);

export const deleteLead = (id) =>
  API.delete(`/api/leads/${id}`);
