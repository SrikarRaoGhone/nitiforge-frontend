"use client";

import Layout from "@/components/Layout";
import { useCallback, useEffect, useState } from "react";
import { getLeads } from "@/lib/leads";
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
      setLeads(
        normalizedLeads.map((lead) => ({
          ...lead,
          _pipelineStage: resolveStage(lead),
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

    const leadId = result.draggableId;
    const newStage = result.destination.droppableId;

    await API.put(`/leads/stage/${leadId}?stage=${newStage}`);

    loadLeads();
  };

  return (
    <Layout>
      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <h1 className="text-2xl font-bold mb-6">
        Sales Pipeline
      </h1>

      <DragDropContext onDragEnd={onDragEnd}>

        <div className="grid grid-cols-5 gap-4">

          {stages.map(stage => (

            <Droppable key={stage} droppableId={stage}>

              {(provided) => (

                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-3 rounded-lg min-h-[400px]"
                >

                  <h2 className="font-semibold mb-4 capitalize">
                    {stage.replace("_", " ")}
                  </h2>

                  {leads
                    .filter((l) => l._pipelineStage === stage)
                    .map((lead, index) => (

                      <Draggable
                        key={lead.id}
                        draggableId={lead.id.toString()}
                        index={index}
                      >

                        {(provided) => (

                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 rounded shadow mb-3"
                          >

                            <p className="font-semibold">
                              {lead.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {lead.location}
                            </p>

                            <p className="text-sm">
                              Score: {lead.ai_score}
                            </p>

                          </div>

                        )}

                      </Draggable>

                  ))}

                  {provided.placeholder}

                </div>

              )}

            </Droppable>

          ))}

        </div>

      </DragDropContext>

    </Layout>

  );

}
