"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary } from "@/lib/dashboard";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardSummary();

        setStats(data);
      } catch (err) {
        setError("Unable to load dashboard right now.");
        console.error("Dashboard error", err);
      }
    };

    fetchDashboard();
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Leads",
          value: stats.total_leads ?? 0,
          tone: "text-emerald-200",
          chip: "All pipeline",
        },
        {
          label: "Today's Leads",
          value: stats.today_leads ?? 0,
          tone: "text-cyan-200",
          chip: "Fresh inbound",
        },
        {
          label: "Hot Leads",
          value: stats.hot_leads ?? 0,
          tone: "text-rose-200",
          chip: "High intent",
        },
        {
          label: "Pending Followups",
          value: stats.pending_followups ?? 0,
          tone: "text-amber-200",
          chip: "Needs action",
        },
      ]
    : [];

  return (
    <div className="aurora-bg min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="fade-up glass-card mb-7 rounded-2xl p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-emerald-200/90">
            NITIFORGE OVERVIEW
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            NitiForge Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            Your daily command center for lead flow, urgency signals, and
            follow-up execution.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {!stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card loading-shimmer h-36 rounded-2xl border border-white/15"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, i) => (
              <article
                key={card.label}
                className="glass-card lift-hover fade-up rounded-2xl p-5"
                style={{ animationDelay: `${120 * i}ms` }}
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-sm font-medium text-slate-300">
                    {card.label}
                  </h2>
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-slate-200">
                    {card.chip}
                  </span>
                </div>
                <p className={`mt-6 text-4xl font-semibold ${card.tone}`}>
                  {card.value}
                </p>
              </article>
            ))}
          </div>
        )}

        <section className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="glass-card fade-up rounded-2xl p-5 lg:col-span-2">
            <p className="text-sm font-medium text-slate-300">
              Team Pulse
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Conversion rhythm is stable
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              High-intent opportunities are concentrated in active follow-ups.
              Keep response times tight for the next 24 hours.
            </p>
          </div>
          <div
            className="glass-card fade-up rounded-2xl p-5"
            style={{ animationDelay: "150ms" }}
          >
            <p className="text-sm font-medium text-slate-300">Focus Area</p>
            <p className="mt-3 text-3xl font-semibold text-amber-200">
              Follow-ups
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Prioritize pending leads first to protect deal velocity.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
