import Link from "next/link";
import WebsiteNavbar from "@/components/WebsiteNavbar";
import WebsiteFooter from "@/components/WebsiteFooter";

const agenda = [
  "Lead scoring and intake workflow",
  "Smart queue prioritization",
  "Manager dashboard and assignment controls",
  "Role-based hierarchy for enterprise teams",
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef7ff_44%,#fffdf9_100%)] text-slate-900">
      <WebsiteNavbar />

      <main className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2.2rem] bg-slate-950 p-8 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Book a Demo</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.04em]">See how NitiForge fits your sales process.</h1>
            <p className="mt-5 text-base leading-7 text-slate-300">
              We will walk through your lead flow, team hierarchy, manager reporting, and the fastest way to start using AI in day-to-day sales operations.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">What we cover</p>
              <div className="mt-5 space-y-3">
                {agenda.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
              <p className="text-sm text-cyan-100">Contact us directly</p>
              <p className="mt-2 text-2xl font-semibold text-white">sales@nitiforge.com</p>
              <p className="mt-2 text-lg font-semibold text-white">Contact: 99120 83337</p>
              <p className="mt-2 text-sm text-slate-300">Share your project count, team size, and current CRM setup to speed up the demo.</p>
            </div>
          </section>

          <section className="rounded-[2.2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">Request a walkthrough</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Add Calendly later if you want live scheduling. For now, this page is ready for inbound demo requests.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Typical demo duration</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">30 minutes</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Best for</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">Builders, brokers, channel teams</p>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] bg-slate-950 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.16em] text-cyan-300">Fastest next step</p>
              <p className="mt-3 text-xl font-semibold">Email your team size and current lead workflow to `sales@nitiforge.com` and we can tailor the walkthrough.</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Start Free Trial
              </Link>
            </div>
          </section>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
}
