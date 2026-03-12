"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { getFollowupReminders } from "@/lib/leads";

export default function RemindersPage() {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");

  const loadReminders = async () => {
    try {
      const data = await getFollowupReminders();
      setLeads(Array.isArray(data) ? data : data?.leads || data?.items || []);
      setError("");
    } catch (err) {
      setLeads([]);
      setError(err?.message || "Unable to load follow-up reminders.");
    }
  };

  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReminders();
  },[]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Follow-Up Reminders
      </h1>

      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow border">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Lead</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">AI Score</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {leads.map(lead => (
              <tr key={lead.id} className="border-t">
                <td className="p-3">{lead.name}</td>
                <td className="p-3">{lead.phone}</td>
                <td className="p-3">{lead.location}</td>
                <td className="p-3">{lead.ai_score}</td>

                <td className="p-3">
                  <a
                    href={`tel:${lead.phone}`}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Call
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
