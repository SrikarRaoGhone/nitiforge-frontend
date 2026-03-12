import API from "./api";

export const getUsers = async () => {
  const endpoints = ["/users", "/users/", "/auth/users", "/auth/users/"];
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
      if (status === 404) {
        continue;
      }
      if (status === 502) {
        throw new Error("Unable to reach users API. Please check backend service.");
      }
      throw new Error(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to load users",
      );
    }
  }

  throw new Error(
    lastError?.response?.data?.detail ||
      "Users endpoint not found (tried /users and /auth/users).",
  );
};

export const createUser = async (data) => {
  try {
    const res = await API.post("/auth/register", data);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw new Error("Session expired. Please login again.");
    }
    throw new Error(
      error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to create user",
    );
  }
};
