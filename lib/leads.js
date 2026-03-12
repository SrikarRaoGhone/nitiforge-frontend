import API from "./api";

export const getLeads = async () => {
  try {
    const res = await API.get("/leads");
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw new Error("Session expired. Please login to view leads.");
    }

    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      "Unable to load leads. Please check if your backend API is running.";
    throw new Error(message);
  }
};

export const createLead = async (leadData) => {
  try {
    const res = await API.post("/leads", leadData);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
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

export const updateLead = async (leadId, data) => {
  const res = await API.put(`/leads/${leadId}`, data);
  return res.data;
};

export const assignLead = async (leadId, userId) => {
  try {
    const res = await API.put(`/leads/assign/${leadId}/${userId}`);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw new Error("Session expired. Please login again.");
    }
    throw new Error(
      error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to assign lead",
    );
  }
};

export const getFollowupReminders = async () => {
  const attempts = [
    () => API.get("/leads/followup-reminders"),
    () => API.get("/leads/followup-reminders/"),
    () => API.get("/followup-reminders"),
    () => API.get("/followup-reminders/"),
    () => API.post("/leads/followup-reminders", {}),
    () => API.post("/leads/followup-reminders/", {}),
  ];

  let lastError;
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      return res.data;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        throw new Error("Session expired. Please login again.");
      }
      if (status === 404 || status === 405 || status === 500) {
        continue;
      }
      throw new Error(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to load follow-up reminders",
      );
    }
  }

  // Graceful fallback: derive reminder candidates from leads list when
  // dedicated reminder endpoint is unavailable/server-erroring.
  try {
    const leads = await getLeads();
    const leadList = Array.isArray(leads)
      ? leads
      : Array.isArray(leads?.leads)
        ? leads.leads
        : Array.isArray(leads?.items)
          ? leads.items
          : [];

    return leadList
      .filter((lead) => {
        const stage = String(lead?.stage || lead?.status || "").toLowerCase();
        return stage !== "closed";
      })
      .sort((a, b) => Number(b?.ai_score || 0) - Number(a?.ai_score || 0))
      .slice(0, 25);
  } catch {
    // Keep original error behavior if fallback cannot be generated.
  }

  throw new Error(
    lastError?.response?.data?.detail ||
      "Follow-up reminders endpoint is not available (tried common routes).",
  );
};
