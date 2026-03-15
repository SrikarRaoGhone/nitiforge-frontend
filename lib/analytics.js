import API from "./api";

export const getRevenueForecast = async () => {
  const res = await API.get("/analytics/revenue-forecast");
  return res.data;
};
