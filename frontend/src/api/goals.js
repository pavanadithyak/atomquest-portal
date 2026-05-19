import api from "./axios";

export const getGoalSheets = () => api.get("/goals").then((r) => r.data);

export const getGoalSheet = (id) => api.get(`/goals/${id}`).then((r) => r.data);

export const createGoalSheet = (data) => api.post("/goals", data).then((r) => r.data);

export const updateGoalSheet = (id, data) => api.patch(`/goals/${id}`, data).then((r) => r.data);

export const submitGoalSheet = (id) =>
  api.patch(`/goals/${id}/status`, { status: "submitted" }).then((r) => r.data);

export const deleteGoalSheet = (id) => api.delete(`/goals/${id}`).then((r) => r.data);

export const getCycles = () => api.get("/cycles").then((r) => r.data);
