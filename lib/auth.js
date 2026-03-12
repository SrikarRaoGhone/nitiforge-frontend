import API from "./api";

export const loginUser = async (identifier, password) => {
  const form = new URLSearchParams();
  form.append("username", identifier);
  form.append("password", password);

  const res = await API.post("/auth/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data;
};

export const registerUser = async (name, email, password) => {
  const res = await API.post("/auth/register", {
    name,
    email,
    password,
  });

  return res.data;
};

const decodeTokenPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return decoded;
  } catch {
    return null;
  }
};

export const getTokenProfile = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  const claims = decodeTokenPayload(token);
  if (!claims) return null;

  return {
    name: claims.name || claims.full_name || claims.username || "",
    email: claims.email || claims.sub || "",
    company_id: claims.company_id || claims.companyId || "",
    company_name:
      claims.company_name ||
      claims.company ||
      claims.org_name ||
      claims.organization ||
      "",
  };
};

export const getCurrentUser = async () => {
  const endpoints = ["/auth/me", "/users/me", "/me"];
  let lastError;

  for (const endpoint of endpoints) {
    try {
      const res = await API.get(endpoint);
      return res.data;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        throw new Error("Session expired. Please login again.");
      }
      if (status === 404 || status === 405) {
        continue;
      }
      throw new Error(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to load user profile",
      );
    }
  }

  if (lastError?.response?.status) {
    throw new Error("User profile endpoint not available.");
  }
  return getTokenProfile();
};

export const getCurrentCompany = async (companyId) => {
  const endpoints = [
    "/companies/me",
    "/company/me",
    "/companies/current",
    "/companies/profile",
  ];
  if (companyId) {
    endpoints.push(`/companies/${companyId}`);
  }

  for (const endpoint of endpoints) {
    try {
      const res = await API.get(endpoint);
      return res.data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 405) continue;
      if (status === 401 || status === 403) {
        throw new Error("Session expired. Please login again.");
      }
    }
  }

  return null;
};

export const changePassword = async (currentPassword, newPassword) => {
  const attempts = [
    () =>
      API.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      }),
    () =>
      API.post("/users/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      }),
    () =>
      API.put("/auth/password", {
        old_password: currentPassword,
        new_password: newPassword,
      }),
  ];

  let lastError;
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      return res.data;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 404 || status === 405) continue;
      if (status === 401 || status === 403) {
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to change password",
      );
    }
  }

  throw new Error(
    lastError?.response?.data?.detail ||
      "Password change endpoint is not available.",
  );
};
