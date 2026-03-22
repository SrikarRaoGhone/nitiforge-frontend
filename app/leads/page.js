"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLeads, createLead, assignLead } from "@/lib/leads";
import { getProjects } from "@/lib/projects";
import { getUsers } from "@/lib/users";
import { getCurrentUser } from "@/lib/auth";
import {
  filterLeadsByHierarchy,
  getAssignableUsers,
  getScopeLabel,
  isManagerRole,
  normalizeUsers,
  normalizeUser,
} from "@/lib/hierarchy";
import AuthGuard from "@/components/AuthGuard";
import Layout from "@/components/Layout";

const LEAD_SOURCE_OPTIONS = [
  "Website",
  "Walk-in",
  "99acres",
  "MagicBricks",
  "Housing",
  "Google Ads",
  "Facebook Ads",
  "Instagram",
  "WhatsApp Campaign",
  "Channel Partner",
  "Broker",
  "Referral",
  "Site Visit",
  "Cold Call",
  "Property Expo",
  "Other",
];

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [scopeLabel, setScopeLabel] = useState("All company leads");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [projectId, setProjectId] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterOwnerId, setFilterOwnerId] = useState("");
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultStartDate = monthStart.toISOString().split("T")[0];
  const defaultEndDate = today.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const searchQuery = searchParams.get("q") || "";

  const fetchLeads = useCallback(async (filters = {}) => {
    try {
      const data = await getLeads(filters);
      const rawLeads = Array.isArray(data)
        ? data
        : Array.isArray(data?.leads)
          ? data.leads
          : Array.isArray(data?.items)
            ? data.items
            : [];
      const visibleLeads = currentUser
        ? filterLeadsByHierarchy(rawLeads, currentUser, users)
        : rawLeads;
      const filteredLeads = visibleLeads.filter((lead) => {
        const matchesProject =
          !filters?.project_id || String(lead?.project_id || "") === String(filters.project_id);
        const matchesOwner =
          !filters?.owner_id || String(lead?.assigned_to || "") === String(filters.owner_id);
        return matchesProject && matchesOwner;
      });
      setLeads(filteredLeads);
      setError("");
    } catch (err) {
      setLeads([]);
      const message = err?.message || "Unable to load leads. Please check if your backend API is running.";
      setError(message);
      const normalized = message.toLowerCase();
      if (
        normalized.includes("login") ||
        normalized.includes("session expired") ||
        normalized.includes("not authenticated") ||
        normalized.includes("unauthorized")
      ) {
        setTimeout(() => router.push("/login"), 600);
      }
    }
  }, [currentUser, router, users]);

  const loadCurrentUser = useCallback(async () => {
    try {
      const [userData, projectData] = await Promise.all([getCurrentUser(), getProjects()]);
      const user = normalizeUser(userData);
      const resolvedRole = user?.role || "";
      setCurrentUserRole(resolvedRole);
      setCurrentUser(user);
      setScopeLabel(getScopeLabel(resolvedRole));
      setProjects(Array.isArray(projectData) ? projectData : []);

      if (["super_admin", "superadmin", "admin", "manager"].includes(String(resolvedRole).toLowerCase())) {
        const data = await getUsers();
        const allUsers = normalizeUsers(Array.isArray(data) ? data : data?.users || data?.items || []);
        setUsers(getAssignableUsers(allUsers, user));
      } else {
        setUsers([]);
      }
    } catch (err) {
      setCurrentUser(null);
      setCurrentUserRole("");
      setError(err?.message || "Unable to load current user.");
    }
  }, []);

  const canManageOwners = ["super_admin", "superadmin", "admin", "manager"].includes(
    String(currentUserRole || "").toLowerCase(),
  );

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    fetchLeads({
      start_date: defaultStartDate,
      end_date: defaultEndDate,
      q: searchQuery,
    });
  }, [defaultEndDate, defaultStartDate, fetchLeads, searchQuery]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const budgetValue = Number(String(budget).replace(/[^\d.]/g, ""));
      const budgetScore = Number.isFinite(budgetValue)
        ? Math.min(45, Math.round(budgetValue / 50000) * 5)
        : 10;
      const completenessScore = [name, phone, source, location, budget].filter(Boolean).length * 10;
      const aiScore = Math.max(20, Math.min(100, budgetScore + completenessScore));
      const aiPriority = aiScore >= 75 ? "High" : aiScore >= 50 ? "Medium" : "Low";
      const aiReason =
        aiPriority === "High"
          ? "Strong budget and complete profile indicate high conversion potential."
          : aiPriority === "Medium"
            ? "Moderate intent signal. Requires timely follow-up."
            : "Low-intent profile. Needs qualification and nurturing.";

      await createLead({
        name,
        phone,
        source,
        location,
        budget,
        project_id: projectId ? Number(projectId) : null,
        ai_score: aiScore,
        ai_priority: aiPriority,
        ai_reason: aiReason,
      });

      setName("");
      setPhone("");
      setSource("");
      setLocation("");
      setBudget("");
      setProjectId("");

      await fetchLeads({
        start_date: startDate,
        end_date: endDate,
        q: searchQuery,
        project_id: filterProjectId,
        owner_id: filterOwnerId,
      });
    } catch (err) {
      setError(err?.message || "Unable to create lead right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowLeads = async () => {
    await fetchLeads({
      start_date: startDate,
      end_date: endDate,
      q: searchQuery,
      project_id: filterProjectId,
      owner_id: filterOwnerId,
    });
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="mx-auto flex h-[calc(100vh-11.5rem)] max-w-7xl flex-col overflow-hidden">
          <header className="app-card mb-4 shrink-0 rounded-2xl px-6 py-4">
            <h1 className="section-title">
              <span className="brand-gradient-text">Leads Management</span>
            </h1>
            <p className="muted-copy mt-1.5">Create, score, and follow up with high-intent opportunities.</p>
          </header>

          {error ? (
            <div className="mb-4 shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[0.59fr_1.41fr]">
            <form onSubmit={handleCreateLead} className="app-card flex min-h-0 flex-col overflow-y-auto rounded-2xl p-5">
              <h2 className="panel-title">Create Lead</h2>
              <p className="muted-copy mt-1">
                {isManagerRole(currentUserRole)
                  ? "Add a new contact to your team pipeline and assign it to a valid owner."
                  : "Add a new contact to your pipeline."}
              </p>

              <div className="mt-5 space-y-3">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                >
                  <option value="">Select Lead Source</option>
                  {LEAD_SOURCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Adding..." : "Add Lead"}
              </button>
            </form>

            <div className="app-card flex min-h-0 flex-col overflow-hidden rounded-2xl">
              <div className="shrink-0 border-b border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.92))] px-5 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="panel-title text-xl">Pipeline Leads</h2>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                      {scopeLabel}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
                      {leads.length} records
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid shrink-0 items-center gap-3 border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.9))] px-5 py-3 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <label className="text-sm">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="From date"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>
                <label className="text-sm">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="To date"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>
                <label className="text-sm">
                  <select
                    value={filterProjectId}
                    onChange={(e) => setFilterProjectId(e.target.value)}
                    aria-label="Project filter"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <select
                    value={filterOwnerId}
                    onChange={(e) => setFilterOwnerId(e.target.value)}
                    aria-label="Owner filter"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  >
                    <option value="">All Owners</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                    {!users.some((user) => user.id === currentUser?.id) && currentUser?.id ? (
                      <option value={currentUser.id}>{currentUser.name || "You"}</option>
                    ) : null}
                  </select>
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleShowLeads}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 font-medium text-white transition hover:brightness-110 md:w-auto"
                  >
                    Show
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.09),_transparent_34%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.94))] px-4 py-3">
                <table className="w-full table-auto border-separate border-spacing-y-4">
                  <colgroup>
                    <col className="w-[24%]" />
                    <col className="w-[17%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                    <col className="w-[15%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-white/88 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 backdrop-blur">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold">Lead</th>
                      <th className="px-3 py-3 text-left font-semibold">Phone</th>
                      <th className="px-3 py-3 text-left font-semibold">AI Score</th>
                      <th className="px-3 py-3 text-left font-semibold">Priority</th>
                      <th className="px-3 py-3 text-left font-semibold">Project</th>
                      <th className="px-3 py-3 text-left font-semibold">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="text-sm text-slate-700 transition hover:-translate-y-0.5"
                      >
                        <td className="rounded-l-[1.4rem] bg-white px-4 py-3.5 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                          <div className="min-w-0">
                            <Link href={`/leads/${lead.id}`} className="block font-semibold text-slate-900 transition hover:text-cyan-700">
                              {lead.name}
                            </Link>
                          </div>
                        </td>
                        <td className="bg-white px-3 py-3.5 font-medium text-slate-700 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                          <a href={`tel:${lead.phone}`} className="block transition hover:text-cyan-700">
                            {lead.phone}
                          </a>
                        </td>
                        <td className="bg-white px-3 py-3.5 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                          <span className="inline-flex min-w-12 justify-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            {lead.ai_score ?? "-"}
                          </span>
                        </td>
                        <td className="bg-white px-3 py-3.5 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                              lead.ai_priority === "High"
                                ? "bg-rose-100 text-rose-700"
                                : lead.ai_priority === "Medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {lead.ai_priority || "Unrated"}
                          </span>
                        </td>
                        <td className="bg-white px-3 py-3.5 text-sm text-slate-700 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                            {lead.project_name || "No project"}
                          </span>
                        </td>
                        <td className="rounded-r-[1.4rem] bg-white px-3 py-3.5 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                          {canManageOwners ? (
                            <select
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                              value={lead.assigned_to || ""}
                              onChange={async (e)=>{
                                try {
                                  await assignLead(lead.id, e.target.value);
                                  await fetchLeads({
                                    start_date: startDate,
                                    end_date: endDate,
                                    q: searchQuery,
                                  });
                                } catch (err) {
                                  setError(err?.message || "Unable to assign lead right now.");
                                }
                              }}
                            >
                              <option value="">Unassigned</option>

                              {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                              {lead.assigned_to_name || "Unassigned"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!leads.length ? (
                      <tr>
                        <td className="px-3 py-12 text-center text-sm text-slate-500" colSpan={6}>
                          No leads found for the selected date range.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </AuthGuard>
  );
}
