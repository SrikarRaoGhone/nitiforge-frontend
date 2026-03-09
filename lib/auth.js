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
