"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import API from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export default function AdminPage() {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const loadCompanies = async () => {
    try {
      const res = await API.get("/admin/companies");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.companies)
          ? res.data.companies
          : [];

      if (!Array.isArray(res.data) && res.data?.error) {
        setError(res.data.error);
        setCompanies([]);
        return;
      }

      setCompanies(data);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load companies.",
      );
      setCompanies([]);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCompanyName("");
    setAdminName("");
    setAdminEmail("");
    setPassword("");
  };

  const canManageCompanies = role === "superadmin" || role === "super_admin";
  const canViewPage = canManageCompanies || role === "admin";

  const createCompany = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canManageCompanies) {
      setError("Only super admin can create or update companies.");
      return;
    }

    try {
      let res;
      const payload = {
        company_name: companyName,
        admin_name: adminName,
        admin_email: adminEmail,
        password,
      };

      if (editingId) {
        res = await API.put(`/admin/companies/${editingId}`, payload);
      } else {
        try {
          res = await API.post("/admin/create-company", payload);
        } catch (err) {
          const status = err?.response?.status;
          if (status === 404) {
            res = await API.post("/companies/signup", {
              company_name: companyName,
              name: adminName,
              email: adminEmail,
              password,
            });
          } else {
            throw err;
          }
        }
      }

      if (res.data?.error) {
        setError(res.data.error);
        return;
      }

      setSuccess(
        res.data?.message ||
          (editingId ? "Company updated successfully." : "Company created successfully."),
      );
      resetForm();
      await loadCompanies();
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        `Unable to ${editingId ? "update" : "create"} company.`;
      setError(
        typeof message === "string" && message.includes("Internal Server Error")
          ? "Company action failed. The admin email may already exist."
          : message,
      );
    }
  };

  const startEdit = (company) => {
    setEditingId(company.id);
    setCompanyName(company.name || "");
    setAdminName(company.admin_name || "");
    setAdminEmail(company.admin_email || "");
    setPassword("");
    setError("");
    setSuccess("");
  };

  const handleDelete = async (company) => {
    setError("");
    setSuccess("");

    if (!canManageCompanies) {
      setError("Only super admin can delete companies.");
      return;
    }

    const confirmed = window.confirm(`Delete ${company.name}? This will remove its users, leads, and activities.`);
    if (!confirmed) return;

    try {
      await API.delete(`/admin/companies/${company.id}`);
      setSuccess("Company deleted successfully.");
      if (editingId === company.id) {
        resetForm();
      }
      await loadCompanies();
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to delete company.";
      setError(message);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await getCurrentUser();
        const resolvedRole = me?.role || "";
        setRole(resolvedRole);
        localStorage.setItem("role", resolvedRole);

        if (
          resolvedRole !== "admin" &&
          resolvedRole !== "superadmin" &&
          resolvedRole !== "super_admin"
        ) {
          setError("You are not authorized to view this page.");
          setCompanies([]);
          return;
        }
      } catch {
        // If user profile lookup fails, allow API response to drive UI.
      }
      loadCompanies();
    };

    bootstrap();
  }, []);

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold mb-6">
            Company Management
          </h1>

          {canManageCompanies ? (
            <form
              onSubmit={createCompany}
              className="bg-white p-6 rounded shadow mb-6"
            >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Edit Company" : "Create Company"}
                </h2>
                <p className="text-sm text-slate-500">
                  Manage tenant accounts, admin owners, and lifecycle actions.
                </p>
              </div>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                required
              />
              <input
                placeholder="Admin Name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                required
              />
              <input
                placeholder="Admin Email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                required
              />
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-500"
            >
              {editingId ? "Update Company" : "Create Company"}
            </button>
            </form>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-xl bg-white shadow">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Company</th>
                  <th className="p-3 text-left">Admin</th>
                  <th className="p-3 text-left">Admin Email</th>
                  <th className="p-3 text-left">Users</th>
                  <th className="p-3 text-left">Leads</th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.admin_name || "-"}</td>
                    <td className="p-3">{c.admin_email || "-"}</td>
                    <td className="p-3">{c.user_count ?? 0}</td>
                    <td className="p-3">{c.lead_count ?? 0}</td>
                    <td className="p-3">{c.id}</td>
                    <td className="p-3">
                      {canManageCompanies ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white transition hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white transition hover:bg-rose-500"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!companies.length && !error ? (
                  <tr className="border-t">
                    <td className="p-3 text-slate-500" colSpan={7}>
                      No companies found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
