"use client";

import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams } from "next/navigation";
import { getLeads, generateFollowup, getLeadActivities } from "@/lib/leads";

export default function LeadDetailPage() {
  const { id } = useParams();

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [followup, setFollowup] = useState("");

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

  if (!lead) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Lead Info */}
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">{lead.name}</h1>

          <p>Phone: {lead.phone}</p>
          <p>Location: {lead.location}</p>
          <p>Budget: {lead.budget}</p>
        </div>

        {/* AI Insights */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-3">AI Insights</h2>

          <p><b>Score:</b> {lead.ai_score}</p>
          <p><b>Priority:</b> {lead.ai_priority}</p>
          <p><b>Reason:</b> {lead.ai_reason}</p>
        </div>

        {/* Follow-Up Generator */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-3">AI Follow-Up</h2>

          <button
            onClick={handleFollowup}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Generate Follow-Up
          </button>

          {followup && <p className="mt-4 text-gray-700">{followup}</p>}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-3">Activity Timeline</h2>

          {activities.map((a) => (
            <div key={a.id} className="border-b py-2">
              <p className="text-sm text-gray-600">{a.activity_type}</p>

              <p>{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
