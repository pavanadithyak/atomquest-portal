import api from "./axios";

export const getAchievements = () =>
  api.get("/achievements").then((r) => r.data);

export const createAchievement = (data) =>
  api.post("/achievements", data).then((r) => r.data);
