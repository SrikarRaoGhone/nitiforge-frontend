"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLeads, createLead } from "@/lib/leads";
import { generateFollowup } from "@/lib/leads";
import Layout from "@/components/Layout";

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
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
      if (message.toLowerCase().includes("login")) {
        setTimeout(() => router.push("/login"), 600);
      }
    }
  }, [router]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createLead({
        name,
        phone,
        location,
        budget,
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
    <Layout>
      <div className="p-10">
        <div className="mx-auto max-w-6xl">
        <header className="fade-up glass-card mb-7 rounded-2xl p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-200/90">
            LEAD OPERATIONS
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Leads Management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            Capture new opportunities and monitor AI-ranked lead priority in one
            focused workspace.
          </p>
        </header>

        {error ? (
          <div className="mb-5 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <form
            onSubmit={handleCreateLead}
            className="glass-card fade-up rounded-2xl p-5 lg:col-span-1"
          >
            <h2 className="text-lg font-semibold text-white">Create Lead</h2>
            <p className="mt-1 text-sm text-slate-300">
              Add a lead to your active pipeline.
            </p>

            <div className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300/70 outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/30"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300/70 outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/30"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300/70 outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/30"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <input
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300/70 outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/30"
                placeholder="Budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Adding..." : "Add Lead"}
            </button>
          </form>

          <div className="glass-card fade-up overflow-hidden rounded-2xl lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Pipeline Leads</h2>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-200">
                {leads.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Budget</th>
                    <th className="p-3 text-left">AI Score</th>
                    <th className="p-3 text-left">Priority</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-blue-600"
                        >
                          {lead.name}
                        </Link>
                      </td>
                      <td className="p-3">{lead.phone}</td>
                      <td className="p-3">{lead.location}</td>
                      <td className="p-3">{lead.budget}</td>

                      <td className="p-3">
                        <span className="font-bold text-blue-600">
                        {lead.ai_score}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm
${lead.ai_priority === "High"
? "bg-red-100 text-red-600"
: "bg-yellow-100 text-yellow-600"}`}>
                          {lead.ai_priority}
                        </span>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={()=>handleGenerateFollowup(lead.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          AI Follow-Up
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!leads.length ? (
                    <tr>
                      <td className="p-3 text-sm text-gray-600" colSpan={7}>
                        No leads found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {followupMessage && (
              <div className="mt-6 bg-white p-6 rounded shadow">
                <h2 className="font-bold mb-2">
                  AI Follow-Up Message
                </h2>

                <p className="text-gray-700">
                  {followupMessage}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      </div>
    </Layout>
  );
}
