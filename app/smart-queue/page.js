"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Layout from "@/components/Layout";
import { getCurrentUser } from "@/lib/auth";
import { getSmartQueue } from "@/lib/leads";

export default function SmartQueuePage() {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [scopeLabel, setScopeLabel] = useState("All company leads");

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const [queueData, user] = await Promise.all([getSmartQueue(), getCurrentUser()]);
        const role = String(user?.role || "").toLowerCase();
        setLeads(Array.isArray(queueData) ? queueData : []);
        setScopeLabel(
          ["admin", "superadmin", "super_admin", "manager"].includes(role)
            ? "All company leads"
            : "Your assigned leads",
        );
        setError("");
      } catch (err) {
        setLeads([]);
        setError(err?.message || "Unable to load smart queue.");
      }
    };

    loadQueue();
  }, []);

  return (
    <AuthGuard>
      <Layout>
        <div className="mx-auto max-w-7xl space-y-5">
          <header className="app-card rounded-2xl p-6">
            <p className="section-kicker">Sales Prioritization</p>
            <h1 className="section-title mt-2">AI Smart Lead Queue</h1>
            <p className="muted-copy mt-2">Prioritized leads ranked by AI score and urgency.</p>
            <p className="mt-3 inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
              Scope: {scopeLabel}
            </p>
          </header>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="app-card overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="panel-title">Queue</h2>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {leads.length} leads
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100/90 text-sm text-slate-600">
                  <tr>
                    <th className="p-3 text-left font-semibold">Lead</th>
                    <th className="p-3 text-left font-semibold">Score</th>
                    <th className="p-3 text-left font-semibold">Priority</th>
                    <th className="p-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((item, index) => {
                    const lead = item?.lead || {};
                    const fullName =
                      [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim() ||
                      lead.name ||
                      "Unnamed Lead";

                    return (
                      <tr key={lead.id || index} className="border-t border-slate-100 text-sm text-slate-700">
                        <td className="p-3 font-medium text-slate-900">
                          {index + 1}. {fullName}
                        </td>
                        <td className="p-3">{lead.ai_score ?? "-"}</td>
                        <td className="p-3">{Math.round(Number(item?.priority_score || 0))}</td>
                        <td className="p-3">
                          <a
                            href={`tel:${lead.phone || ""}`}
                            className="inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-white transition hover:bg-emerald-500"
                          >
                            Call
                          </a>
                        </td>
                      </tr>
                    );
                  })}

                  {!leads.length ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-sm text-slate-500">
                        No leads available in the smart queue.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </Layout>
    </AuthGuard>
  );
}
