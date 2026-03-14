"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getLeads, createLead, generateFollowup, assignLead } from "@/lib/leads";
import { getUsers } from "@/lib/users";
import { getCurrentUser } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import Layout from "@/components/Layout";

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followupMessage, setFollowupMessage] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
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
      const normalizedLeads = Array.isArray(data)
        ? data
        : Array.isArray(data?.leads)
          ? data.leads
          : Array.isArray(data?.items)
            ? data.items
            : [];
      setLeads(normalizedLeads);
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
  }, [router]);

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const resolvedRole = user?.role || "";
      setCurrentUserRole(resolvedRole);

      if (["super_admin", "superadmin", "admin", "manager"].includes(String(resolvedRole).toLowerCase())) {
        const data = await getUsers();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setCurrentUserRole("");
      setError(err?.message || "Unable to load current user.");
    }
  }, []);

  const canManageOwners = ["super_admin", "superadmin", "admin", "manager"].includes(
    String(currentUserRole || "").toLowerCase(),
  );

  useEffect(() => {
    fetchLeads({
      start_date: defaultStartDate,
      end_date: defaultEndDate,
      q: searchQuery,
    });
    loadCurrentUser();
  }, [defaultEndDate, defaultStartDate, fetchLeads, loadCurrentUser, searchQuery]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const budgetValue = Number(String(budget).replace(/[^\d.]/g, ""));
      const budgetScore = Number.isFinite(budgetValue)
        ? Math.min(45, Math.round(budgetValue / 50000) * 5)
        : 10;
      const completenessScore = [name, phone, location, budget].filter(Boolean).length * 10;
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
        location,
        budget,
        ai_score: aiScore,
        ai_priority: aiPriority,
        ai_reason: aiReason,
      });

      setName("");
      setPhone("");
      setLocation("");
      setBudget("");

      await fetchLeads({
        start_date: startDate,
        end_date: endDate,
        q: searchQuery,
      });
    } catch (err) {
      setError(err?.message || "Unable to create lead right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateFollowup = async (leadId) => {
    try {
      const data = await generateFollowup(leadId);
      setFollowupMessage(data?.message || data?.followup || "Follow-up generated successfully.");
    } catch (err) {
      setFollowupMessage(err?.message || "Unable to generate follow-up right now.");
    }
  };

  const handleShowLeads = async () => {
    await fetchLeads({
      start_date: startDate,
      end_date: endDate,
      q: searchQuery,
    });
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="mx-auto flex h-[calc(100vh-11.5rem)] max-w-7xl flex-col overflow-hidden">
          <header className="app-card mb-5 shrink-0 rounded-2xl p-6">
            <p className="section-kicker">Lead Operations</p>
            <h1 className="section-title mt-2">
              <span className="brand-gradient-text">Leads Management</span>
            </h1>
            <p className="muted-copy mt-2">Create, score, and follow up with high-intent opportunities.</p>
          </header>

          {error ? (
            <div className="mb-4 shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-3">
            <form onSubmit={handleCreateLead} className="app-card flex min-h-0 flex-col overflow-y-auto rounded-2xl p-5 xl:col-span-1">
              <h2 className="panel-title">Create Lead</h2>
              <p className="muted-copy mt-1">Add a new contact to your pipeline.</p>

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
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Adding..." : "Add Lead"}
              </button>
            </form>

            <div className="app-card flex min-h-0 flex-col overflow-hidden rounded-2xl xl:col-span-2">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="panel-title">Pipeline Leads</h2>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {leads.length} records
                </span>
              </div>

              <div className="grid shrink-0 gap-3 border-b border-slate-200 bg-white/80 px-5 py-4 md:grid-cols-[1fr_1fr_auto]">
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-600">From</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-600">To</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  />
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

              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.94))] px-3 pb-4">
                <table className="w-full table-auto border-separate border-spacing-y-3">
                  <colgroup>
                    <col className="w-[18%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                    <col className="w-[16%]" />
                    <col className="w-[5%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-white/85 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 backdrop-blur">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold">Lead</th>
                      <th className="px-3 py-3 text-left font-semibold">Phone</th>
                      <th className="px-3 py-3 text-left font-semibold">Location</th>
                      <th className="px-3 py-3 text-left font-semibold">Budget</th>
                      <th className="px-3 py-3 text-left font-semibold">AI Score</th>
                      <th className="px-3 py-3 text-left font-semibold">Priority</th>
                      <th className="px-3 py-3 text-left font-semibold">Owner</th>
                      <th className="px-3 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="text-sm text-slate-700 transition hover:-translate-y-0.5"
                      >
                        <td className="rounded-l-2xl bg-white px-3 py-4 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
                          <div className="min-w-0">
                            <Link href={`/leads/${lead.id}`} className="block font-semibold text-slate-900 transition hover:text-cyan-700">
                              {lead.name}
                            </Link>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              Lead ID #{lead.id}
                            </p>
                          </div>
                        </td>
                        <td className="bg-white px-3 py-4 font-medium text-slate-700">
                          <a href={`tel:${lead.phone}`} className="block transition hover:text-cyan-700">
                            {lead.phone}
                          </a>
                        </td>
                        <td className="bg-white px-3 py-4">
                          <span className="inline-flex max-w-full rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                            {lead.location}
                          </span>
                        </td>
                        <td className="bg-white px-3 py-4 font-semibold text-slate-900">
                          <span className="block">{lead.budget}</span>
                        </td>
                        <td className="bg-white px-3 py-4">
                          <span className="inline-flex min-w-12 justify-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            {lead.ai_score ?? "-"}
                          </span>
                        </td>
                        <td className="bg-white px-3 py-4">
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
                        <td className="bg-white px-3 py-4">
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
                        <td className="rounded-r-2xl bg-white px-3 py-4">
                          <button
                            onClick={() => handleGenerateFollowup(lead.id)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:brightness-110"
                            title="Generate AI follow-up"
                            aria-label="Generate AI follow-up"
                          >
                            <Sparkles size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!leads.length ? (
                      <tr>
                        <td className="px-3 py-12 text-center text-sm text-slate-500" colSpan={8}>
                          No leads found for the selected date range.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {followupMessage && (
                <div className="shrink-0 border-t border-slate-200 bg-slate-50/60 p-5">
                  <h2 className="mb-2 font-semibold text-slate-900">AI Follow-Up Message</h2>
                  <p className="text-sm text-slate-700">{followupMessage}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </Layout>
    </AuthGuard>
  );
}
