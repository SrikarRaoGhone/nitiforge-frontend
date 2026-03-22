import Link from "next/link";
import WebsiteNavbar from "@/components/WebsiteNavbar";
import WebsiteFooter from "@/components/WebsiteFooter";

const plans = [
  {
    name: "Starter",
    price: "Rs 1,999 / month",
    description: "For small broker teams getting started with structured lead management.",
    features: ["Lead capture and pipeline", "AI lead scoring", "Basic smart queue", "Email support"],
  },
  {
    name: "Growth",
    price: "Rs 4,999 / month",
    description: "For scaling teams that need manager visibility and stronger automation.",
    features: ["Everything in Starter", "Manager dashboard", "Role-based hierarchy", "Deal risk insights"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For multi-project organizations with advanced hierarchy, controls, and onboarding needs.",
    features: ["Custom setup", "Team structures", "Priority support", "Implementation assistance"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffefc_0%,#eef8ff_42%,#f8fafc_100%)] text-slate-900">
      <WebsiteNavbar />

      <main className="px-6 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Pricing</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em]">Simple pricing for modern sales teams</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Start with a focused team plan today and upgrade when you need manager analytics, enterprise hierarchy, and implementation support.
          </p>

          <div className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-slate-200 bg-white/90 p-6 text-left shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Best for</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">Builders, brokers, and channel sales teams</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Starts from</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">Rs 1,999 monthly</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Upgrade path</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">Manager control to enterprise hierarchy</p>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <section
                key={plan.name}
                className={`rounded-[2.1rem] border p-8 text-left shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 ${
                  plan.featured
                    ? "border-cyan-300 bg-slate-950 text-white shadow-xl"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{plan.name}</h2>
                    <p className={`mt-3 text-3xl font-semibold ${plan.featured ? "text-cyan-300" : "text-slate-950"}`}>
                      {plan.price}
                    </p>
                  </div>
                  {plan.featured ? (
                    <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                      Popular
                    </span>
                  ) : null}
                </div>

                <p className={`mt-5 text-sm leading-6 ${plan.featured ? "text-slate-300" : "text-slate-600"}`}>
                  {plan.description}
                </p>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${plan.featured ? "bg-cyan-300" : "bg-cyan-600"}`} />
                      <p className={`text-sm ${plan.featured ? "text-slate-200" : "text-slate-700"}`}>{feature}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.name === "Enterprise" ? "/demo" : "/signup"}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    plan.featured
                      ? "bg-cyan-400 text-slate-950 hover:brightness-110"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  {plan.name === "Enterprise" ? "Talk to Sales" : "Get Started"}
                </Link>
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-[2rem] bg-slate-950 p-8 text-left text-white shadow-xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold">Need a custom rollout?</h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Enterprise plans can include hierarchy design, onboarding, team setup, and custom implementation support.
                </p>
              </div>
              <Link
                href="/demo"
                className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
}
