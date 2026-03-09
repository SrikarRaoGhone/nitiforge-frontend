import API from "./api";

export const getLeads = async () => {
  const res = await API.get("/leads");
  return res.data;
};

export const createLead = async (leadData) => {
  const res = await API.post("/leads", leadData);
  return res.data;
};
