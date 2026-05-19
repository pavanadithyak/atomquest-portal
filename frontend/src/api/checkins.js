import api from "./axios";

export const getCheckIns = (quarter) =>
  api.get("/check-ins", { params: { quarter } }).then((r) => r.data);

export const createCheckIn = (data) =>
  api.post("/check-ins", data).then((r) => r.data);

export const updateCheckIn = (id, data) =>
  api.patch(`/check-ins/${id}`, data).then((r) => r.data);
