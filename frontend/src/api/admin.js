import api from "./axios";

export const getDashboard = () =>
  api.get("/admin/completion-dashboard").then((r) => r.data);

export const getAuditLogs = (params = {}) =>
  api.get("/admin/audit-logs", { params }).then((r) => r.data);

export const getReport = (cycleId, format = "json") =>
  api.get("/admin/reports/achievement", { params: { cycle_id: cycleId, format }, responseType: format === "csv" ? "blob" : "json" }).then((r) => r.data);

export const unlockGoalSheet = (id, reason) =>
  api.patch(`/admin/unlock-goal/${id}`, { reason }).then((r) => r.data);

export const pushSharedGoal = (data) =>
  api.post("/admin/shared-goals", data).then((r) => r.data);

export const getUsers = () =>
  api.get("/admin/users").then((r) => r.data);
