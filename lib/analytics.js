import API from "./api";

export const getRevenueForecast = async () => {
  const res = await API.get("/analytics/revenue-forecast");
  return res.data;
};

export const getSourcePerformance = async () => {
  const res = await API.get("/analytics/source-performance");
  return res.data;
};

export const getPipelineHealth = async () => {
  const res = await API.get("/analytics/pipeline-health");
  return res.data;
};

export const getSalesPerformance = async () => {
  const res = await API.get("/analytics/sales-performance");
  return res.data;
};

export const getRevenueTrend = async () => {
  const res = await API.get("/analytics/revenue-trend");
  return res.data;
};
