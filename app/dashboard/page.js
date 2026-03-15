"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getDashboardSummary, getHighRiskDeals, getLeadSources, getPipelineData } from "@/lib/dashboard";
import { getRevenueForecast } from "@/lib/analytics";
import { getCurrentUser } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import Layout from "@/components/Layout";

const SOURCE_COLORS = ["#2563eb", "#0f766e", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [highRiskDeals, setHighRiskDeals] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const [summary, pipe, sources, me, forecastData] = await Promise.all([
      getDashboardSummary(),
      getPipelineData(),
      getLeadSources(),
      getCurrentUser(),
      getRevenueForecast(),
    ]);
    const resolvedRole = String(me?.role || "").toLowerCase();
    const riskDeals =
      ["admin", "manager", "superadmin", "super_admin"].includes(resolvedRole)
        ? await getHighRiskDeals()
        : [];

    setStats(summary);
    setPipeline(pipe);
    setLeadSources(Array.isArray(sources) ? sources : []);
    setHighRiskDeals(Array.isArray(riskDeals) ? riskDeals : []);
    setForecast(forecastData || null);
    setRole(resolvedRole);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        await loadData();
        setError("");
      } catch (err) {
        const message = err?.message || "Unable to load dashboard right now.";
        setError(message);

        if (message.toLowerCase().includes("login") || message.toLowerCase().includes("session expired")) {
          localStorage.removeItem("token");
          localStorage.removeItem("company_name");
          window.location.replace("/login");
        }
      }
    };

    fetchDashboard();
  }, []);

  if (!stats) {
    return (
      <AuthGuard>
        <Layout>
          <div>Loading...</div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div>
          <h1 className="section-title mb-8">
            <span className="brand-gradient-text">NitiForge Dashboard</span>
          </h1>

          {error ? (
            <div className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="app-card rounded-2xl p-5">
              <p className="muted-copy">Total Leads</p>
              <p className="metric-value mt-3">{stats.total_leads}</p>
            </div>

            <div className="app-card rounded-2xl p-5">
              <p className="muted-copy">Today&apos;s Leads</p>
              <p className="metric-value mt-3">{stats.today_leads}</p>
            </div>

            <div className="app-card rounded-2xl p-5">
              <p className="muted-copy">Hot Leads</p>
              <p className="metric-value mt-3 text-rose-600">
                {stats.hot_leads}
              </p>
            </div>

            <div className="app-card rounded-2xl p-5">
              <p className="muted-copy">Pending Followups</p>
              <p className="metric-value mt-3 text-amber-500">
                {stats.pending_followups}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl shadow border">
              <h2 className="font-semibold mb-4">Sales Pipeline</h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pipeline}>
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
              <h2 className="font-semibold mb-4">Lead Sources</h2>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadSources}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label
                  >
                    {leadSources.map((entry, index) => (
                      <Cell
                        key={`${entry.source || "source"}-${index}`}
                        fill={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 rounded-xl border bg-white p-6 shadow">
            <h2 className="mb-3 font-semibold">AI Revenue Forecast</h2>

            {forecast ? (
              <div className="space-y-5">
                <p>
                  Projected Revenue: ₹{forecast.projected_revenue}
                </p>

                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-600">Revenue Forecast by Stage</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={Array.isArray(forecast.stages) ? forecast.stages : []}>
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                      <Bar dataKey="amount" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Revenue forecast is not available right now.</p>
            )}
          </div>

          {["admin", "manager", "superadmin", "super_admin"].includes(role) ? (
            <div className="mt-8 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">High Risk Deals</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Deals that need manager intervention now.
                  </p>
                </div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                  {highRiskDeals.length} flagged
                </span>
              </div>

              {!highRiskDeals.length ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No high risk deals right now.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {highRiskDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white p-4"
                    >
                      <p className="font-semibold text-slate-900">
                        {deal.name} <span className="text-slate-400">-</span> <span className="text-rose-700">{deal.stage || "unknown"}</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {(Array.isArray(deal.reasons) ? deal.reasons : []).join(" - ") || "High deal risk detected"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Layout>
    </AuthGuard>
  );
}
