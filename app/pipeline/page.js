"use client";

import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import { useCallback, useEffect, useState } from "react";
import { getLeads, updateLead } from "@/lib/leads";
import API from "@/lib/api";

import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

const stages = [
  "new",
  "contacted",
  "site_visit",
  "negotiation",
  "closed"
];
const PIPELINE_STAGE_OVERRIDES_KEY = "pipeline_stage_overrides";

const normalizeStage = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const resolveStage = (lead) => {
  const raw =
    lead?.stage ??
    lead?.status ??
    lead?.lead_stage ??
    lead?.pipeline_stage ??
    "new";
  const normalized = normalizeStage(raw);

  if (normalized === "sitevisit") return "site_visit";
  if (normalized === "site-visit") return "site_visit";
  if (normalized === "new_lead") return "new";
  return normalized || "new";
};

const readStageOverrides = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PIPELINE_STAGE_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeStageOverride = (leadId, stage) => {
  if (typeof window === "undefined") return;
  const current = readStageOverrides();
  current[String(leadId)] = stage;
  localStorage.setItem(PIPELINE_STAGE_OVERRIDES_KEY, JSON.stringify(current));
};

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");

  const loadLeads = useCallback(async () => {
    try {
      const data = await getLeads();
      const normalizedLeads = Array.isArray(data)
        ? data
        : Array.isArray(data?.leads)
          ? data.leads
          : Array.isArray(data?.items)
            ? data.items
            : [];
      const overrides = readStageOverrides();
      setLeads(
        normalizedLeads.map((lead) => ({
          ...lead,
          _pipelineStage: overrides[String(lead.id)] || resolveStage(lead),
        })),
      );
      setError("");
    } catch (err) {
      setLeads([]);
      setError(err?.message || "Unable to load pipeline leads.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLeads();
  }, [loadLeads]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    if (result.destination.droppableId === result.source.droppableId) return;

    const leadId = result.draggableId;
    const newStage = result.destination.droppableId;
    const draggedLead = leads.find((lead) => lead.id.toString() === leadId);
    const baseLeadPayload = draggedLead
      ? {
          ...draggedLead,
          stage: undefined,
          status: undefined,
          _pipelineStage: undefined,
        }
      : {};
    const stageFormats = newStage.includes("_")
      ? [newStage, newStage.replace("_", " ")]
      : [newStage];

    // Optimistic UI update so drag feels instant even before network completes.
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id.toString() === leadId
          ? { ...lead, stage: newStage, _pipelineStage: newStage }
          : lead,
      ),
    );
    writeStageOverride(leadId, newStage);

    const persistAttempts = [];
    for (const stageValue of stageFormats) {
      persistAttempts.push(
        () => updateLead(leadId, { ...baseLeadPayload, stage: stageValue }),
        () => updateLead(leadId, { ...baseLeadPayload, status: stageValue }),
        () => API.put(`/leads/${leadId}`, { ...baseLeadPayload, stage: stageValue }),
        () => API.put(`/leads/${leadId}`, { ...baseLeadPayload, status: stageValue }),
        () => API.patch(`/leads/${leadId}`, { stage: stageValue }),
        () => API.patch(`/leads/${leadId}`, { status: stageValue }),
        () => API.put(`/leads/stage/${leadId}?stage=${encodeURIComponent(stageValue)}`),
        () => API.put(`/leads/stage/${leadId}/?stage=${encodeURIComponent(stageValue)}`),
        () => API.put(`/leads/stage/${leadId}`, { stage: stageValue }),
        () => API.put(`/leads/stage/${leadId}/`, { stage: stageValue }),
      );
    }

    let saved = false;
    let lastError;
    for (const attempt of persistAttempts) {
      try {
        await attempt();
        saved = true;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!saved) {
      setError(lastError?.message || "Unable to update lead stage.");
    } else {
      setError("");
    }

    // Always re-sync from server so UI reflects persisted backend state.
    await loadLeads();
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="flex h-[calc(100vh-11.5rem)] flex-col overflow-hidden">
          {error ? (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <h1 className="section-title mb-4 shrink-0">
            <span className="brand-gradient-text">Sales Pipeline</span>
          </h1>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="grid h-full grid-cols-5 gap-3">
                {stages.map((stage) => (
                  <Droppable key={stage} droppableId={stage}>
                    {(provided) => (
                      <div className="flex h-[68vh] min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <h2 className="mb-4 shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">
                          {stage.replace("_", " ")}
                        </h2>

                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="min-h-0 flex-1 overflow-y-auto pr-1"
                        >
                          {leads
                            .filter((l) => l._pipelineStage === stage)
                            .map((lead, index) => (
                              <Draggable
                                key={lead.id}
                                draggableId={lead.id.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={provided.draggableProps.style}
                                    className={`mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition ${
                                      snapshot.isDragging ? "ring-2 ring-cyan-200 shadow-xl" : ""
                                    }`}
                                  >
                                    <p className="font-semibold text-slate-900">{lead.name}</p>
                                    <p className="mt-1 text-sm text-slate-500">{lead.location}</p>
                                    <p className="mt-2 text-xs font-medium text-cyan-700">
                                      Score: {lead.ai_score ?? "-"}
                                    </p>
                                  </div>
                                )}
                              </Draggable>
                            ))}

                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>

          </DragDropContext>
        </div>

      </Layout>
    </AuthGuard>

  );

}
