import Link from "next/link";

export default function Home() {
  return (
    <div className="aurora-bg min-h-screen px-6 py-10">
      <main className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <section className="app-card rounded-3xl p-8">
          <p className="section-kicker">CRM Suite</p>
          <h1 className="section-title mt-4 max-w-2xl">
            Advanced lead intelligence for high-velocity teams
          </h1>
          <p className="muted-copy mt-4 max-w-xl text-base">
            Run pipeline operations, prioritize opportunities with AI, and keep your team focused on revenue actions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-medium text-white transition hover:brightness-110"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Open Dashboard
            </Link>
          </div>
        </section>

        <section className="grid gap-4">
          <article className="app-card rounded-2xl p-6">
            <p className="muted-copy">Smart Prioritization</p>
            <h2 className="panel-title mt-2 text-2xl">AI scores every lead</h2>
            <p className="muted-copy mt-2">Identify high-intent prospects and reduce response latency.</p>
          </article>
          <article className="app-card rounded-2xl p-6">
            <p className="muted-copy">Pipeline Control</p>
            <h2 className="panel-title mt-2 text-2xl">Drag-and-drop deal flow</h2>
            <p className="muted-copy mt-2">Move leads across stages and keep ownership clear across the team.</p>
          </article>
          <article className="app-card rounded-2xl p-6">
            <p className="muted-copy">Guided Follow-ups</p>
            <h2 className="panel-title mt-2 text-2xl">AI messaging + insights</h2>
            <p className="muted-copy mt-2">Generate persuasive follow-ups and track conversion signals in one place.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
