"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Layout from "@/components/Layout";
import API from "@/lib/api";
import { getLeads, getSmartQueue } from "@/lib/leads";

function isTotalLeadsQuestion(question) {
  const normalized = question.trim().toLowerCase();
  return normalized.includes("lead") && (
    normalized.includes("total") ||
    normalized.includes("count") ||
    normalized.includes("how many")
  );
}

function formatLeadName(entry) {
  return entry?.lead?.name || "Unnamed lead";
}

function formatLeadStage(entry) {
  return entry?.lead?.stage || entry?.lead?.status || "new";
}

function formatLeadReason(entry) {
  const score = Number(entry?.lead?.ai_score || 0);
  const priority = Number(entry?.priority_score || 0).toFixed(1);
  const stage = formatLeadStage(entry);

  return `AI score ${score}, stage ${stage}, priority ${priority}`;
}

function buildFallbackAnswer(question, queue) {
  const topLeads = Array.isArray(queue) ? queue.slice(0, 5) : [];
  const actionLeads = topLeads.slice(0, 3);
  const normalizedQuestion = question.trim().toLowerCase();
  const intro = normalizedQuestion.includes("call today")
    ? "These are the strongest leads to call today based on the smart queue."
    : "The copilot endpoint is unavailable, so this answer uses the current smart queue.";

  if (!topLeads.length) {
    return [
      intro,
      "",
      "No prioritized leads are available right now.",
    ].join("\n");
  }

  return [
    intro,
    "",
    "Priority leads:",
    ...topLeads.map((entry, index) => `${index + 1}. ${formatLeadName(entry)}: ${formatLeadReason(entry)}`),
    "",
    "Recommended actions:",
    ...actionLeads.map((entry) => `- Call ${formatLeadName(entry)} and move the lead forward from ${formatLeadStage(entry)}.`),
    "",
    "Important leads to focus on:",
    ...actionLeads.map((entry) => `- ${formatLeadName(entry)}`),
  ].join("\n");
}

function buildLeadCountAnswer(leads) {
  const total = Array.isArray(leads)
    ? leads.length
    : Array.isArray(leads?.leads)
      ? leads.leads.length
      : Array.isArray(leads?.items)
        ? leads.items.length
        : 0;

  return `Total leads: ${total}`;
}

export default function CopilotPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const ask = async () => {
    const trimmed = question.trim();
    if (!trimmed) {
      setError("Enter a question for the copilot.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let res;

      try {
        res = await API.post("/copilot/ask", { question: trimmed });
      } catch (err) {
        if (err?.response?.status === 404) {
          res = await API.post("/copilot/ask/", { question: trimmed });
        } else {
          throw err;
        }
      }

      setResponse(res?.data?.answer || "No answer returned.");
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          if (isTotalLeadsQuestion(trimmed)) {
            const leads = await getLeads();
            setResponse(buildLeadCountAnswer(leads));
            setError("");
            return;
          }

          const queue = await getSmartQueue();
          setResponse(buildFallbackAnswer(trimmed, queue));
          setError("");
          return;
        } catch (fallbackError) {
          err = fallbackError;
        }
      }

      setResponse("");
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to get a copilot answer right now.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="mx-auto max-w-5xl space-y-5">
          <header className="app-card rounded-2xl p-6">
            <p className="section-kicker">AI Assistant</p>
            <h1 className="section-title mt-2">AI Sales Copilot</h1>
            <p className="muted-copy mt-2">
              Ask for prioritization, next actions, or follow-up guidance across your lead pipeline.
            </p>
          </header>

          <section className="app-card rounded-2xl p-6">
            <textarea
              placeholder="Ask something like: Which leads should I call today?"
              className="min-h-40 w-full rounded-xl border border-slate-200 bg-white p-4 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={ask}
                disabled={isLoading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Asking..." : "Ask AI"}
              </button>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            </div>
          </section>

          {response ? (
            <section className="app-card rounded-2xl p-6">
              <h2 className="panel-title mb-3">Copilot Answer</h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{response}</p>
            </section>
          ) : null}
        </div>
      </Layout>
    </AuthGuard>
  );
}
