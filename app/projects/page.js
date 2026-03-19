"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { createProject, deleteProject, getProjects, updateProject } from "@/lib/projects";
import AuthGuard from "@/components/AuthGuard";
import { getCurrentUser } from "@/lib/auth";
import { normalizeRole } from "@/lib/hierarchy";

const emptyForm = {
  name: "",
  location: "",
  price: "",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to load projects.");
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        const me = await getCurrentUser();
        setIsAdmin(normalizeRole(me?.role) === "admin");
      } catch {
        setIsAdmin(false);
      }

      await loadProjects();
    };

    loadPage();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProjectId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const payload = {
        name: form.name,
        location: form.location,
        price_range: form.price,
      };

      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
      } else {
        await createProject(payload);
      }

      resetForm();
      setError("");
      await loadProjects();
    } catch (err) {
      setError(err?.message || "Unable to save project.");
    }
  };

  const handleEdit = (project) => {
    if (!isAdmin) return;
    setEditingProjectId(project.id);
    setForm({
      name: project.name || "",
      location: project.location || "",
      price: project.price_range || "",
    });
    setError("");
  };

  const handleDelete = async (projectId) => {
    if (!isAdmin) return;

    try {
      await deleteProject(projectId);
      if (editingProjectId === projectId) {
        resetForm();
      }
      setError("");
      await loadProjects();
    } catch (err) {
      setError(err?.message || "Unable to delete project.");
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Projects</h1>
            <p className="text-sm text-slate-500">
              Manage real-estate inventory and connect leads to the right project.
            </p>
          </div>

          {error ? (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isAdmin ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded shadow mb-6 space-y-3"
            >
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  placeholder="Project Name"
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="border p-2 rounded"
                  required
                />

                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                  className="border p-2 rounded"
                />

                <input
                  placeholder="Price Range"
                  value={form.price}
                  onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                  className="border p-2 rounded"
                />

                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingProjectId ? "Update" : "Create"}
                </button>
              </div>

              {editingProjectId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm text-slate-500 underline underline-offset-2"
                >
                  Cancel editing
                </button>
              ) : null}
            </form>
          ) : (
            <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              You can view projects here. Only admins can create, edit, or delete projects.
            </div>
          )}

          <div className="bg-white rounded shadow divide-y">
            {projects.length ? projects.map((project) => (
              <div key={project.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.location || "-"}</p>
                  <p className="text-sm">{project.price_range || "-"}</p>
                </div>

                {isAdmin ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(project)}
                      className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      className="rounded border border-red-200 px-3 py-1 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            )) : (
              <div className="p-4 text-sm text-slate-500">No projects created yet.</div>
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
