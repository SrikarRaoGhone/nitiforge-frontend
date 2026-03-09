import API from "./api";

export const getDashboardSummary = async () => {
  const res = await API.get("/dashboard/summary");
  return res.data;
};

export const getPipelineData = async () => {
  const res = await API.get("/dashboard/pipeline");
  return res.data;
};
