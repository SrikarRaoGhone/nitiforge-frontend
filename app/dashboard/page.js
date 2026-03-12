"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboardSummary, getPipelineData } from "@/lib/dashboard";
import AuthGuard from "@/components/AuthGuard";
import Layout from "@/components/Layout";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const data = await getDashboardSummary();
        const pipelineData = await getPipelineData();

        setStats(data);
        setPipeline(pipelineData);
      } catch (err) {
        const message = err?.message || "Unable to load dashboard right now.";
        setError(message);

        if (message.toLowerCase().includes("login") || message.toLowerCase().includes("session expired")) {
          setTimeout(() => router.push("/login"), 600);
        }
      }
    };

    fetchDashboard();
  }, [router]);

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

          <div className="app-card mt-7 rounded-2xl p-6">
            <h2 className="panel-title mb-4">Sales Pipeline</h2>

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline}>
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
