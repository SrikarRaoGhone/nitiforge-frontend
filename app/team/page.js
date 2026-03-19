"use client";

import Layout from "@/components/Layout";
import { useCallback, useEffect, useState } from "react";
import { createUser, deleteUser, getUsers, updateUser } from "@/lib/users";
import { getCurrentUser } from "@/lib/auth";
import { getDirectReports, getVisibleUsers, isAdminRole, isManagerRole, isSalesRole, normalizeUsers, normalizeUser } from "@/lib/hierarchy";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("sales");
  const [managerId, setManagerId] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const [me, data] = await Promise.all([getCurrentUser(), getUsers()]);
      const normalizedMe = normalizeUser(me || {});
      const allUsers = normalizeUsers(
        Array.isArray(data) ? data : data?.users || data?.items || [],
      );

      if (isSalesRole(normalizedMe.role)) {
        router.replace("/dashboard");
        return;
      }

      setCurrentUser(normalizedMe);
      setUsers(getVisibleUsers(allUsers, normalizedMe));
      setError("");
    } catch (err) {
      const message = err?.message || "Unable to load team members.";
      setError(message);
      if (message.toLowerCase().includes("login") || message.toLowerCase().includes("session expired")) {
        setTimeout(() => router.push("/login"), 600);
      }
    }
  }, [router]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const currentRole = String(currentUser?.role || "").toLowerCase();
  const isAdmin = isAdminRole(currentRole);
  const isManager = isManagerRole(currentRole);
  const directReports = getDirectReports(users, currentUser?.id);
  const managerOptions = users.filter((user) =>
    ["manager", "admin", "superadmin", "super_admin"].includes(String(user?.role || "").toLowerCase()),
  );
  const availableRoles = ["sales", "manager", "admin"];

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("sales");
    setManagerId("");
    setEditingUserId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        email,
        role,
        manager_id: role === "sales" ? (managerId ? Number(managerId) : null) : null,
      };

      if (editingUserId) {
        await updateUser(editingUserId, payload);
      } else {
        await createUser({
          ...payload,
          password: "123456",
        });
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err?.message || "Unable to save team member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setName(user.name || "");
    setEmail(user.email || "");
    setRole(user.role || "sales");
    setManagerId(user.manager_id ? String(user.manager_id) : "");
    setError("");
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.name}?`);
    if (!confirmed) return;

    try {
      await deleteUser(user.id);
      if (editingUserId === user.id) {
        resetForm();
      }
      await loadUsers();
    } catch (err) {
      setError(err?.message || "Unable to delete team member.");
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="mt-2 text-sm text-slate-500">
            {isAdmin
              ? "Admin can view the full company hierarchy."
              : "Managers can view their own team members only."}
          </p>
        </div>
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
          <p className="font-semibold">Visible Scope</p>
          <p>{isAdmin ? "All company users" : `${directReports.length} direct reports`}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Managers</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {users.filter((user) => isManagerRole(user.role)).length}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Sales Members</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {users.filter((user) => user.role === "sales").length}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Your Team</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{directReports.length}</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isAdmin ? (
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow mb-6"
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingUserId ? "Edit Team Member" : "Add Team Member"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Admins can create managers or sales reps, assign a manager to sales users, and change manager assignments later.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <input
            placeholder="Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="border p-2"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="border p-2"
          />

          <select
            value={role}
            onChange={(e)=>setRole(e.target.value)}
            className="border p-2"
          >
            {availableRoles.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={managerId}
            onChange={(e)=>setManagerId(e.target.value)}
            className="border p-2"
            disabled={role !== "sales"}
          >
            <option value="">Manager</option>
            {managerOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={isSubmitting}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : editingUserId ? "Update Team Member" : "Add Team Member"}
        </button>
        {editingUserId ? (
          <button
            type="button"
            onClick={resetForm}
            className="mt-4 ml-3 rounded border border-slate-300 px-4 py-2 text-slate-700"
          >
            Cancel
          </button>
        ) : null}
      </form>
      ) : null}

      {isAdmin ? (
      <div className="mb-6 rounded-xl border bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-slate-900">Hierarchy Overview</h2>
        <p className="mt-1 text-sm text-slate-500">
          Company -&gt; Manager -&gt; Sales hierarchy with `manager_id` ownership.
        </p>

        <div className="mt-4 space-y-3">
          {users
            .filter((user) => isAdminRole(user.role) || isManagerRole(user.role))
            .map((leader) => {
              const reports = users.filter((user) => user.manager_id === leader.id);

              return (
                <div key={leader.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{leader.name}</p>
                      <p className="text-sm capitalize text-slate-500">{leader.role}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {reports.length} reports
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {reports.length ? (
                      reports.map((member) => (
                        <span
                          key={member.id}
                          className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700"
                        >
                          {member.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">No direct reports</span>
                    )}
                  </div>
                </div>
              );
          })}
        </div>
      </div>
      ) : null}

      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Manager</th>
              {isAdmin ? <th className="p-3 text-left">Actions</th> : null}
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3">{user.manager_name || "-"}</td>
                {isAdmin ? (
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        className="rounded bg-rose-600 px-3 py-1 text-sm text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
