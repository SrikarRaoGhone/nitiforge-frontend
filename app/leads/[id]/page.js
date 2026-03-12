"use client";

import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import { useParams } from "next/navigation";
import { getLeads, generateFollowup, getLeadActivities, getLeadInsights, updateLead } from "@/lib/leads";

export default function LeadDetailPage() {
  const { id } = useParams();

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [followup, setFollowup] = useState("");
  const [insights, setInsights] = useState(null);
  const [insightsError, setInsightsError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchLead = useCallback(async () => {
    const leads = await getLeads();

    const selected = leads.find((l) => l.id == id);

    setLead(selected);
  }, [id]);

  const fetchActivities = useCallback(async () => {
    const data = await getLeadActivities(id);

    setActivities(data);
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchLead();
      await fetchActivities();
    };

    load();
  }, [fetchActivities, fetchLead]);

  const handleFollowup = async () => {
    const data = await generateFollowup(id);

    setFollowup(data.message);
  };

  const loadInsights = async () => {
    try {
      const data = await getLeadInsights(id);
      setInsights(data);
      setInsightsError("");
    } catch (err) {
      setInsights(null);
      setInsightsError(err?.message || "Unable to generate AI deal insights right now.");
    }
  };

  const handleSave = async () => {
    try {
      await updateLead(id, lead);
      setEditing(false);
      setSaveError("");
    } catch (err) {
      setSaveError(err?.message || "Unable to save lead details.");
    }
  };

  if (!lead) {
    return (
      <AuthGuard>
        <Layout>
          <div className="app-card rounded-2xl p-8 text-center text-slate-500">
            Loading lead details...
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="app-card rounded-2xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Lead Profile</p>
                <h1 className="section-title mt-2">{lead.name}</h1>
                <p className="muted-copy mt-2">Manage contact details, stage progression, and AI guidance.</p>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Edit Lead
              </button>
            </div>

            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">Phone</p>
                <p className="mt-1 font-medium text-slate-900">{lead.phone || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">Location</p>
                <p className="mt-1 font-medium text-slate-900">{lead.location || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">Budget</p>
                <p className="mt-1 font-medium text-slate-900">{lead.budget || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">Stage</p>
                <select
                  value={lead.stage}
                  onChange={(e) => {
                    const stage = e.target.value;
                    setLead({ ...lead, stage });
                    updateLead(id, { stage }).catch(() => {});
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="site_visit">Site Visit</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`tel:${lead.phone}`}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Call
              </a>

              <a
                href={`https://wa.me/${lead.phone}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400"
              >
                WhatsApp
              </a>
            </div>
          </section>

          {editing && (
            <section className="app-card rounded-2xl p-6">
              <h2 className="panel-title mb-4">Edit Lead</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="rounded-lg border border-slate-200 p-2.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                />

                <input
                  className="rounded-lg border border-slate-200 p-2.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  value={lead.phone}
                  onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                />
              </div>

              <input
                className="mt-3 w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                value={lead.location}
                onChange={(e) => setLead({ ...lead, location: e.target.value })}
              />

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              {saveError ? <p className="mt-3 text-sm text-rose-600">{saveError}</p> : null}
            </section>
          )}

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="app-card rounded-2xl p-6 xl:col-span-2">
              <h2 className="panel-title mb-4">AI Insights</h2>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Score</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-700">{lead.ai_score ?? "-"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Priority</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{lead.ai_priority ?? "-"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Reason</p>
                  <p className="mt-1 text-slate-800">{lead.ai_reason ?? "-"}</p>
                </div>
              </div>

              <button
                onClick={loadInsights}
                className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500"
              >
                Generate AI Deal Insights
              </button>

              {insightsError ? <p className="mt-3 text-sm text-rose-600">{insightsError}</p> : null}

              {insights ? (
                <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50/60 p-4 text-sm">
                  <h3 className="mb-3 font-semibold text-slate-900">AI Deal Insights</h3>
                  <p><b>Conversion Probability:</b> {insights.conversion_probability}%</p>
                  <p><b>Suggested Action:</b> {insights.suggested_action}</p>
                  <p><b>Best Follow-Up Time:</b> {insights.best_followup_time}</p>
                  <p><b>AI Strategy:</b> {insights.ai_strategy}</p>
                </div>
              ) : null}
            </div>

            <div className="app-card rounded-2xl p-6">
              <h2 className="panel-title mb-3">AI Follow-Up</h2>
              <button
                onClick={handleFollowup}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Generate Follow-Up
              </button>

              {followup ? (
                <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-slate-700">
                  {followup}
                </p>
              ) : null}
            </div>
          </section>

          <section className="app-card rounded-2xl p-6">
            <h2 className="panel-title mb-3">Activity Timeline</h2>

            {!activities.length ? (
              <p className="text-sm text-slate-500">No activities yet.</p>
            ) : (
              <div className="space-y-2">
                {activities.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{a.activity_type}</p>
                    <p className="mt-1 text-sm text-slate-800">{a.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </Layout>
    </AuthGuard>
  );
}
