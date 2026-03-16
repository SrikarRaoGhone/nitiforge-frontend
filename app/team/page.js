"use client";

import Layout from "@/components/Layout";
import { useCallback, useEffect, useState } from "react";
import { getUsers, createUser } from "@/lib/users";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("sales");
  const [managerId, setManagerId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data?.users || data?.items || []);
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

  useEffect(() => {
    const loadMe = async () => {
      try {
        const data = await getCurrentUser();
        setCurrentUser(data);
        if (String(data?.role || "").toLowerCase() === "manager") {
          setManagerId(String(data?.id || ""));
        }
      } catch {
        setCurrentUser(null);
      }
    };

    loadMe();
  }, []);

  const currentRole = String(currentUser?.role || "").toLowerCase();
  const managerOptions = users.filter((user) =>
    ["manager", "admin", "superadmin", "super_admin"].includes(String(user?.role || "").toLowerCase()),
  );
  const canAssignManager = currentRole === "admin" || currentRole === "superadmin" || currentRole === "super_admin";
  const availableRoles =
    currentRole === "manager"
      ? ["sales"]
      : ["sales", "manager", "admin"];

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createUser({
        name,
        email,
        password: "123456",
        role,
        manager_id: role === "sales" ? (managerId ? Number(managerId) : null) : null,
      });

      setName("");
      setEmail("");
      if (currentRole !== "manager") {
        setManagerId("");
      }

      await loadUsers();
    } catch (err) {
      setError(err?.message || "Unable to create team member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Team Management
      </h1>

      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded shadow mb-6"
      >
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
            disabled={role !== "sales" || (!canAssignManager && currentRole === "manager")}
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
          {isSubmitting ? "Adding..." : "Add Team Member"}
        </button>
      </form>

      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Manager</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3">{user.manager_name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
