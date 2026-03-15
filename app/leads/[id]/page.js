"use client";

import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import { useParams } from "next/navigation";
import { generateFollowup, generateMeetingNotes, getDealRisk, getHealthScore, getLeadActivities, getLeadInsights, getLeadResearch, getLeads, updateLead } from "@/lib/leads";

export default function LeadDetailPage() {
  const { id } = useParams();
  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    if (!amount) return "-";
    return `Rs ${amount.toLocaleString("en-IN")}`;
  };
  const getHealthMeta = (score) => {
    if (score >= 80) return { label: "Healthy", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" };
    if (score >= 50) return { label: "Watch", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
    return { label: "At Risk", badge: "bg-rose-100 text-rose-700", dot: "bg-rose-500" };
  };
  const formatActivityLabel = (type) => {
    const labels = {
      meeting_notes: "AI Meeting Notes",
      lead_created: "Lead Created",
      ai_scored: "AI Scored",
      lead_assigned: "Lead Assigned",
    };
    return labels[type] || String(type || "").replace(/_/g, " ");
  };

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [followup, setFollowup] = useState("");
  const [insights, setInsights] = useState(null);
  const [research, setResearch] = useState(null);
  const [risk, setRisk] = useState(null);
  const [health, setHealth] = useState(null);
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [insightsError, setInsightsError] = useState("");
  const [researchError, setResearchError] = useState("");
  const [riskError, setRiskError] = useState("");
  const [meetingNotesError, setMeetingNotesError] = useState("");
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

  const loadHealth = useCallback(async () => {
    try {
      const data = await getHealthScore(id);
      setHealth(data?.health_score ?? null);
    } catch {
      setHealth(null);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchLead();
      await fetchActivities();
      await loadHealth();
    };

    load();
  }, [fetchActivities, fetchLead, loadHealth]);

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
      const result = await updateLead(id, lead);
      if (result?.lead) {
        setLead(result.lead);
      } else {
        await fetchLead();
      }
      await loadHealth();
      setEditing(false);
      setSaveError("");
    } catch (err) {
      setSaveError(err?.message || "Unable to save lead details.");
    }
  };

  const loadResearch = async () => {
    try {
      const data = await getLeadResearch(id);
      setResearch(data);
      setResearchError("");
    } catch (err) {
      setResearch(null);
      setResearchError(err?.message || "Unable to generate AI lead research right now.");
    }
  };

  const generateMeetingSummary = async () => {
    if (!notes.trim()) {
      setMeetingNotesError("Enter meeting notes or a call transcript.");
      return;
    }

    try {
      const res = await generateMeetingNotes(id, notes);
      setSummary(res?.summary || "");
      setMeetingNotesError("");
      await fetchActivities();
    } catch (err) {
      setSummary("");
      setMeetingNotesError(err?.message || "Unable to generate meeting summary right now.");
    }
  };

  const loadRisk = async () => {
    try {
      const data = await getDealRisk(id);
      setRisk(data);
      setRiskError("");
    } catch (err) {
      setRisk(null);
      setRiskError(err?.message || "Unable to analyze deal risk right now.");
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
  const healthMeta = getHealthMeta(Number(health || 0));

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

            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-6">
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
                <p className="text-slate-500">Deal Value</p>
                <p className="mt-1 font-medium text-slate-900">{formatCurrency(lead.deal_value)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">Conversion Probability</p>
                <p className="mt-1 font-medium text-slate-900">
                  {lead.conversion_probability != null ? `${lead.conversion_probability}%` : "-"}
                </p>
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

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min="0"
                  className="rounded-lg border border-slate-200 p-2.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Deal Value"
                  value={lead.deal_value ?? ""}
                  onChange={(e) => setLead({ ...lead, deal_value: e.target.value ? Number(e.target.value) : null })}
                />

                <input
                  type="number"
                  min="0"
                  max="100"
                  className="rounded-lg border border-slate-200 p-2.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Conversion Probability"
                  value={lead.conversion_probability ?? ""}
                  onChange={(e) => setLead({ ...lead, conversion_probability: e.target.value ? Number(e.target.value) : null })}
                />
              </div>

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

          <section className="app-card rounded-2xl p-6">
            <h2 className="panel-title mb-3">Lead Health Score</h2>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold text-slate-900">
                {health != null ? `${health} / 100` : "-"}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${healthMeta.dot}`} />
                <span className={`rounded-full px-2.5 py-1 text-sm font-medium ${healthMeta.badge}`}>
                  {healthMeta.label}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Status: {healthMeta.label}
              </p>
            </div>
          </section>

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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="panel-title">AI Lead Research</h2>
                <p className="muted-copy mt-1">Generate a structured sales brief before the next interaction.</p>
              </div>

              <button
                onClick={loadResearch}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Generate Lead Research
              </button>
            </div>

            {researchError ? <p className="mt-3 text-sm text-rose-600">{researchError}</p> : null}

            {research ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Lead Summary</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{research.lead_summary || "-"}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Customer Profile</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{research.customer_profile || "-"}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Sales Strategy</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{research.sales_strategy || "-"}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Questions to Ask</h3>
                  <ul className="mt-2 space-y-2 text-sm text-slate-700">
                    {(Array.isArray(research.questions_to_ask) ? research.questions_to_ask : []).map((question) => (
                      <li key={question} className="rounded-lg bg-white px-3 py-2">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </section>

          <section className="app-card rounded-2xl p-6">
            <h2 className="panel-title mb-3">AI Meeting Notes</h2>

            <textarea
              className="min-h-36 w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              placeholder="Paste meeting notes or call transcript"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button
              onClick={generateMeetingSummary}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500"
            >
              Generate Summary
            </button>

            {meetingNotesError ? <p className="mt-3 text-sm text-rose-600">{meetingNotesError}</p> : null}

            {summary ? (
              <div className="mt-4 rounded-xl bg-gray-100 p-4 text-sm leading-6 text-slate-700">
                {summary}
              </div>
            ) : null}
          </section>

          <section className="app-card rounded-2xl p-6">
            <h2 className="panel-title mb-3">Deal Risk Detection</h2>

            <button
              onClick={loadRisk}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-500"
            >
              Analyze Deal Risk
            </button>

            {riskError ? <p className="mt-3 text-sm text-rose-600">{riskError}</p> : null}

            {risk ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-900">
                  Risk Level: {risk.risk_level}
                </h3>

                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {(Array.isArray(risk.reasons) ? risk.reasons : []).map((reason, index) => (
                    <li key={`${reason}-${index}`}>• {reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="app-card rounded-2xl p-6">
            <h2 className="panel-title mb-3">Activity Timeline</h2>

            {!activities.length ? (
              <p className="text-sm text-slate-500">No activities yet.</p>
            ) : (
              <div className="space-y-2">
                {activities.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {formatActivityLabel(a.activity_type)}
                    </p>
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

