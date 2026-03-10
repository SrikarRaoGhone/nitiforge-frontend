"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboardSummary, getPipelineData } from "@/lib/dashboard";
import Layout from "@/components/Layout";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardSummary();
        const pipelineData = await getPipelineData();

        setStats(data);
        setPipeline(pipelineData);
      } catch (err) {
        setError("Unable to load dashboard right now.");
        console.error("Dashboard error", err);
      }
    };

    fetchDashboard();
  }, []);

  if (!stats) {
    return null;
  }

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold mb-8">NitiForge Dashboard</h1>

        {error ? (
          <div className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">Total Leads</p>
            <p className="text-3xl font-bold">{stats.total_leads}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">Today&apos;s Leads</p>
            <p className="text-3xl font-bold">{stats.today_leads}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">Hot Leads</p>
            <p className="text-3xl font-bold text-red-500">
              {stats.hot_leads}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">Pending Followups</p>
            <p className="text-3xl font-bold text-orange-500">
              {stats.pending_followups}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border mt-8">
          <h2 className="text-lg font-semibold mb-4">Sales Pipeline</h2>

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
  );
}
