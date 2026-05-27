import Image from "next/image";
import Link from "next/link";
import WebsiteNavbar from "@/components/WebsiteNavbar";
import WebsiteFooter from "@/components/WebsiteFooter";

const highlights = [
  {
    title: "AI Lead Intelligence",
    copy: "Instantly identify the buyers most likely to convert using intent, budget, and engagement signals.",
  },
  {
    title: "Role-Based Visibility",
    copy: "Admins see everything, managers see only their teams, and sales reps work only their own pipeline.",
  },
  {
    title: "Smart Execution",
    copy: "Push the next best action with smart queue ranking, follow-up support, and risk alerts.",
  },
];

const valuePoints = [
  "Replace scattered spreadsheets, calls, and reminders with one structured sales workflow.",
  "Give managers a real control layer for assignments, analytics, and coaching.",
  "Run lead distribution, follow-up velocity, and revenue forecasting from one system.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5fffd_0%,#edf6ff_36%,#fffdfa_100%)] text-slate-900">
      <WebsiteNavbar />

      <main>
        <section className="relative overflow-hidden px-6 pb-16 pt-10 sm:pb-24">
          <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_18%_12%,rgba(8,145,178,0.2),transparent_28%),radial-gradient(circle_at_84%_10%,rgba(245,158,11,0.14),transparent_24%),radial-gradient(circle_at_55%_70%,rgba(37,99,235,0.12),transparent_30%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-cyan-200 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700 shadow-sm">
                AI CRM for Real Estate
              </p>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl xl:text-7xl">
                A cleaner way to run real estate sales at scale.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                NitiForge helps developers, brokers, and enterprise sales teams score leads, prioritize outreach, protect team visibility, and move revenue faster with AI.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/demo"
                  className="rounded-2xl bg-[linear-gradient(135deg,#0f766e,#0284c7)] px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_42px_rgba(8,145,178,0.28)] transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  Book Demo
                </Link>
                <Link
                  href="/signup"
                  className="rounded-2xl border border-slate-300 bg-white/90 px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white"
                >
                  Start Free Trial
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">3x</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">faster lead prioritization for busy sales teams</p>
                </div>
                <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">100%</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">hierarchy-aware visibility across roles</p>
                </div>
                <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">1</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">workspace for pipeline, AI, team control, and forecasting</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-20 h-40 w-40 rounded-full bg-cyan-300/35 blur-3xl" />
              <div className="absolute -right-6 bottom-16 h-48 w-48 rounded-full bg-amber-300/25 blur-3xl" />
              <div className="relative rounded-[2rem] border border-slate-200/80 bg-white/80 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur">
                <div className="rounded-[1.7rem] bg-slate-950 p-6 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Manager View</p>
                    <h2 className="mt-2 text-2xl font-semibold">A CRM control room your team will actually use</h2>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
                    28 active leads
                  </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {highlights.map((item) => (
                      <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.copy}</p>
                      </article>
                    ))}
                    <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Top Performer</p>
                      <p className="mt-3 text-2xl font-semibold text-white">Priya</p>
                      <p className="mt-2 text-sm text-emerald-100">
                        Highest closed-deal count this week with the strongest active pipeline.
                      </p>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Why Teams Switch</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight">
                Your sales system should feel premium, structured, and fast.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {valuePoints.map((item) => (
                <article key={item} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,#cffafe,#fde68a)]" />
                  <p className="mt-5 text-base leading-7 text-slate-700">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 text-center">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Product Preview</p>
            <h2 className="mb-4 mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
              See NitiForge in Action
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
              From smart queue to manager dashboards, the product is built to feel clear, structured, and fast.
            </p>

            <div className="flex justify-center">
              <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
                <Image
                  src="/dashboard.png"
                  alt="NitiForge dashboard preview"
                  width={1600}
                  height={900}
                  className="h-auto w-full max-w-5xl rounded-[1.4rem]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.4rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc)] p-8 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Ready to Upgrade?</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                Bring AI, team visibility, and execution into one real estate CRM.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Start with a guided walkthrough or explore a plan built for your current team size.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/demo"
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Book Demo
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}
