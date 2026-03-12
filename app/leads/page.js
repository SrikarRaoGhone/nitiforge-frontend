"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLeads, createLead, generateFollowup, assignLead } from "@/lib/leads";
import { getUsers } from "@/lib/users";
import AuthGuard from "@/components/AuthGuard";
import Layout from "@/components/Layout";

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followupMessage, setFollowupMessage] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");

  const fetchLeads = useCallback(async () => {
    try {
      const data = await getLeads();
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

  const loadUsers = useCallback(async () => {
    const data = await getUsers();
    setUsers(data);
  }, []);

  useEffect(() => {
    fetchLeads();
    loadUsers();
  }, [fetchLeads, loadUsers]);

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

      await fetchLeads();
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

              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 text-sm text-slate-600">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Location</th>
                      <th className="p-3 text-left">Budget</th>
                      <th className="p-3 text-left">AI Score</th>
                      <th className="p-3 text-left">Priority</th>
                      <th className="p-3 text-left">Assigned To</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/80">
                        <td className="p-3 font-medium">
                          <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                            {lead.name}
                          </Link>
                        </td>
                        <td className="p-3">{lead.phone}</td>
                        <td className="p-3">{lead.location}</td>
                        <td className="p-3">{lead.budget}</td>
                        <td className="p-3 font-semibold text-cyan-700">{lead.ai_score ?? "-"}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              lead.ai_priority === "High" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {lead.ai_priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            className="border p-1 rounded"
                            value={lead.assigned_to || ""}
                            onChange={async (e)=>{
                              try {
                                await assignLead(lead.id, e.target.value);
                                await fetchLeads();
                              } catch (err) {
                                setError(err?.message || "Unable to assign lead right now.");
                              }
                            }}
                          >
                            <option value="">Unassigned</option>

                            {users.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleGenerateFollowup(lead.id)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                          >
                            AI Follow-Up
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!leads.length ? (
                      <tr>
                        <td className="p-4 text-sm text-slate-500" colSpan={8}>
                          No leads found.
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
