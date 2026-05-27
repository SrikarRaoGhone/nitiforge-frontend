import Link from "next/link";
import WebsiteNavbar from "@/components/WebsiteNavbar";
import WebsiteFooter from "@/components/WebsiteFooter";

const featureGroups = [
  {
    title: "AI Lead Scoring",
    copy: "Identify high-value leads instantly with intent scoring based on profile completeness, budget, and engagement.",
    tone: "Prioritize the right buyer first, every time.",
  },
  {
    title: "Smart Queue",
    copy: "Focus only on leads that matter with ranked follow-ups, action lists, and urgency-based prioritization.",
    tone: "Keep teams moving on the next best action.",
  },
  {
    title: "AI Copilot",
    copy: "Generate follow-up messages, meeting summaries, and lead research without leaving the CRM.",
    tone: "Reduce manual effort without losing context.",
  },
  {
    title: "Deal Risk Detection",
    copy: "Flag stale opportunities and risky deals before they slip out of your pipeline.",
    tone: "Catch pipeline leaks before revenue slips away.",
  },
  {
    title: "Revenue Forecast",
    copy: "Estimate expected revenue by stage so managers and founders can plan with confidence.",
    tone: "Turn activity into forecast visibility.",
  },
  {
    title: "Role-Based Visibility",
    copy: "Ensure admins see everything, managers see their team, and sales reps see only their own leads.",
    tone: "Stay secure while scaling teams and leadership layers.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#effcf8_42%,#ffffff_100%)] text-slate-900">
      <WebsiteNavbar />

      <main className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Features</p>
              <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.04em]">
                A sharper CRM workflow for high-volume real estate sales.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                NitiForge combines pipeline management, AI insights, smart prioritization, and manager controls in one premium workspace.
              </p>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Built for execution</p>
              <p className="mt-4 text-2xl font-semibold">
                Every feature is designed to reduce response time, improve team clarity, and increase conversion quality.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureGroups.map((feature, index) => (
              <section
                key={feature.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#cffafe,#fde68a)] text-sm font-semibold text-slate-800">
                  0{index + 1}
                </div>
                <h2 className="mt-5 text-2xl font-semibold">{feature.title}</h2>
                <p className="mt-3 text-sm font-medium uppercase tracking-[0.14em] text-cyan-700">{feature.tone}</p>
                <p className="mt-3 text-base leading-7 text-slate-600">{feature.copy}</p>
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-[2.2rem] bg-slate-950 p-8 text-white shadow-xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold">Want to see the workflow live?</h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Book a walkthrough of lead intake, smart queue, AI follow-ups, team dashboards, and enterprise hierarchy controls.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/demo" className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110">
                  Book Demo
                </Link>
                <Link href="/signup" className="rounded-2xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.14em] text-slate-400">For Sales</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">Work only the leads that deserve attention.</p>
            </div>
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.14em] text-slate-400">For Managers</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">Coach performance with team-only analytics and assignment clarity.</p>
            </div>
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.14em] text-slate-400">For Admins</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">Scale hierarchy, reporting, and access control without extra tools.</p>
            </div>
          </div>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
}
