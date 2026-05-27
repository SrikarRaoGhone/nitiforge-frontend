import Link from "next/link";
import WebsiteNavbar from "@/components/WebsiteNavbar";
import WebsiteFooter from "@/components/WebsiteFooter";

const faqSections = [
  {
    title: "General",
    description: "What NitiForge is and who it is built for.",
    items: [
      {
        question: "What is NitiForge?",
        answer:
          "NitiForge is an AI-powered CRM for real estate sales teams—builders, brokers, and channel partners. It combines lead capture, pipeline tracking, AI prioritization, manager dashboards, and role-based access in one workspace.",
      },
      {
        question: "Who is it best suited for?",
        answer:
          "Teams that handle high lead volume from portals, walk-ins, ads, channel partners, and site visits—and need faster follow-ups, clearer ownership, and manager visibility without spreadsheets and scattered WhatsApp threads.",
      },
      {
        question: "How is it different from a generic CRM?",
        answer:
          "It is tuned for real estate: project-wise leads, Indian lead sources, pipeline stages like site visit and negotiation, AI scoring by budget and profile, and manager-to-sales hierarchy so reps only see their own pipeline.",
      },
      {
        question: "Can we manage multiple projects at once?",
        answer:
          "Yes. You can set up Projects (name, location, price) and attach leads to a project when creating or filtering them—ideal when you sell several towers or locations under one company.",
      },
    ],
  },
  {
    title: "For sales teams",
    description: "Day-to-day execution for executives and on-ground reps.",
    items: [
      {
        question: "I get dozens of leads a day—which one should I call first?",
        answer:
          "Use the Smart Queue. Leads are ranked by AI score and priority score so you focus on high-intent buyers—strong budget, complete profile, and engagement signals—instead of calling in random order.",
      },
      {
        question: "What does AI lead scoring mean for my buyer?",
        answer:
          "Scores reflect signals like budget, profile completeness, and engagement. Higher scores usually indicate hotter intent; leads can also be labeled High, Medium, or Low priority when created.",
      },
      {
        question: "Can I move a lead from new to site visit or negotiation?",
        answer:
          "Yes. The Pipeline is a drag-and-drop board with stages: new, contacted, site visit, negotiation, and closed. Each card shows AI score and deal health (Healthy, Watch, or At Risk).",
      },
      {
        question: "Where do I see leads I must follow up today?",
        answer:
          "Check Reminders and the Smart Queue. Reminders list follow-ups with lead details and AI score, plus a quick Call action from the app.",
      },
      {
        question: "Will I see other agents' leads?",
        answer:
          "No—sales users only see leads assigned to them. That reduces confusion and ownership disputes on the sales floor.",
      },
      {
        question: "Can I add a walk-in or portal lead on the spot?",
        answer:
          "Yes. On Leads you can capture name, phone, source, location, budget, and project. Sources include Website, Walk-in, Google and social ads, Channel Partner, Broker, Referral, Site Visit, and more.",
      },
    ],
  },
  {
    title: "For managers",
    description: "Visibility, coaching, and team control.",
    items: [
      {
        question: "How do I know which deals are going cold?",
        answer:
          "The Dashboard flags high-risk deals—stale or risky opportunities. Managers see risks across their team; admins see company-wide.",
      },
      {
        question: "Can I track team performance, not just lead count?",
        answer:
          "Yes. Manager views include team revenue, active leads, high-risk deal count, top performer, and a sales performance leaderboard with closed deals and pipeline value.",
      },
      {
        question: "How do I assign leads fairly across the team?",
        answer:
          "Admins and managers can assign leads to team members from the leads workflow. Managers assign only within their visible team, per hierarchy rules.",
      },
      {
        question: "Do managers see every lead in the company?",
        answer:
          "Managers see their team's leads (direct reports), not the full company unless they are an admin. Scope is shown on the dashboard and smart queue.",
      },
    ],
  },
  {
    title: "For builders & leadership",
    description: "Multi-project sales, forecasting, and scale.",
    items: [
      {
        question: "Can one system handle channel partners and internal sales?",
        answer:
          "Yes. Lead source tracking (Channel Partner, Broker, Referral, and more) plus project tagging helps you compare which channels and projects convert best.",
      },
      {
        question: "Can leadership see revenue forecast, not just lead count?",
        answer:
          "Admins get AI revenue forecast and revenue by pipeline stage on the dashboard. Managers get a scoped revenue snapshot for their team.",
      },
      {
        question: "How do we reduce leads leaking between projects or teams?",
        answer:
          "Role-based visibility: admins see all; managers see their team; sales see only their pipeline. Combined with assignment and project filters, this mirrors how real estate orgs are structured.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef7ff_44%,#fffdf9_100%)] text-slate-900">
      <WebsiteNavbar />

      <main className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">FAQ</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.04em]">
              Answers for real estate sales teams
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Practical questions from builders, brokers, and channel sales teams using NitiForge every day.
            </p>
          </div>

          <div className="mt-14 space-y-12">
            {faqSections.map((section) => (
              <section key={section.title}>
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">{section.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] open:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                    >
                      <summary className="cursor-pointer list-none px-6 py-5 text-lg font-semibold text-slate-950 marker:content-none [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center justify-between gap-4">
                          {item.question}
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition group-open:rotate-45 group-open:border-cyan-200 group-open:bg-cyan-50 group-open:text-cyan-700">
                            +
                          </span>
                        </span>
                      </summary>
                      <div className="border-t border-slate-100 px-6 pb-5 pt-1">
                        <p className="text-base leading-7 text-slate-600">{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-[2.2rem] bg-slate-950 p-8 text-white shadow-xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-semibold">Still have questions?</h2>
                <p className="mt-3 max-w-xl text-slate-300">
                  Book a walkthrough or reach out at sales@nitiforge.com · 99120 83337
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/demo"
                  className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                >
                  Book Demo
                </Link>
                <Link
                  href="/signup"
                  className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
}
