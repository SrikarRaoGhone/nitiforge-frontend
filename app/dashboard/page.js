"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getDashboardSummary, getLeadSources, getPipelineData } from "@/lib/dashboard";
import AuthGuard from "@/components/AuthGuard";
import Layout from "@/components/Layout";

const SOURCE_COLORS = ["#2563eb", "#0f766e", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [error, setError] = useState("");

  const loadData = async () => {
    const summary = await getDashboardSummary();
    const pipe = await getPipelineData();
    const sources = await getLeadSources();

    setStats(summary);
    setPipeline(pipe);
    setLeadSources(Array.isArray(sources) ? sources : []);
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
        </div>
      </Layout>
    </AuthGuard>
  );
}
