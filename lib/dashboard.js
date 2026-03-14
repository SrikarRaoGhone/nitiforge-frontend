import API from "./api";

export const getDashboardSummary = async () => {
  try {
    const res = await API.get("/dashboard/summary");
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      "Unable to load dashboard summary";
    throw new Error(message);
  }
};

export const getPipelineData = async () => {
  try {
    const res = await API.get("/dashboard/pipeline");
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      "Unable to load pipeline data";
    throw new Error(message);
  }
};

export const getLeadSources = async () => {
  try {
    const res = await API.get("/dashboard/leads-by-source");
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      "Unable to load lead sources";
    throw new Error(message);
  }
};
