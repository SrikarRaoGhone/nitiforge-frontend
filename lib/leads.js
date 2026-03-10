import API from "./api";

export const getLeads = async () => {
  try {
    const res = await API.get("/leads/");
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error("Session expired. Please login to view leads.");
    }

    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      "Unable to load leads. Please check if your backend API is running.";
    throw new Error(message);
  }
};

export const createLead = async (leadData) => {
  try {
    const res = await API.post("/leads/", leadData);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error("Session expired. Please login to create leads.");
    }

    const message = error?.response?.data?.detail || error?.message || "Failed to create lead";
    throw new Error(message);
  }
};

export const generateFollowup = async (leadId) => {
  const res = await API.get(`/followup/${leadId}`);
  return res.data;
};

export const getLeadActivities = async (leadId) => {
  const res = await API.get(`/activities/${leadId}`);
  return res.data;
};

export const getLeadInsights = async (leadId) => {
  const candidates = [`/leads/insights/${leadId}`, `/insights/${leadId}`];
  let lastError;

  for (const endpoint of candidates) {
    try {
      const res = await API.get(endpoint);
      return res.data;
    } catch (error) {
      lastError = error;
      if (error?.response?.status !== 404) {
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load lead insights";
        throw new Error(message);
      }
    }
  }

  throw new Error(
    lastError?.response?.data?.detail ||
      "AI insights endpoint not found (expected /leads/insights/{id} or /insights/{id}).",
  );
};
