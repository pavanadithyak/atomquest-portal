import api from "./axios";

export const getPendingApprovals = () =>
  api.get("/manager/pending-approvals").then((r) => r.data);

export const approveSheet = (id) =>
  api.patch(`/manager/approve/${id}`).then((r) => r.data);

export const rejectSheet = (id, reason) =>
  api.patch(`/manager/reject/${id}`, { rejection_reason: reason }).then((r) => r.data);
