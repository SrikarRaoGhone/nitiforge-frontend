"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary } from "@/lib/dashboard";
import Layout from "@/components/Layout";

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

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-gray-500">Total Leads</h2>
            <p className="text-3xl font-bold">{stats.total_leads}</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-gray-500">Today&apos;s Leads</h2>
            <p className="text-3xl font-bold">{stats.today_leads}</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-gray-500">Hot Leads</h2>
            <p className="text-3xl font-bold text-red-500">
              {stats.hot_leads}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-gray-500">Pending Followups</h2>
            <p className="text-3xl font-bold text-orange-500">
              {stats.pending_followups}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
