import API from "./api";

export const getProjects = async () => {
  const res = await API.get("/projects");
  return res.data;
};

export const createProject = async (data) => {
  const res = await API.post("/projects", data);
  return res.data;
};

export const updateProject = async (projectId, data) => {
  const res = await API.put(`/projects/${projectId}`, data);
  return res.data;
};

export const deleteProject = async (projectId) => {
  const res = await API.delete(`/projects/${projectId}`);
  return res.data;
};

export const assignProject = async (leadId, projectId) => {
  const res = await API.put(`/projects/assign/${leadId}/${projectId}`);
  return res.data;
};
