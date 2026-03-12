"use client";

import { useEffect, useState } from "react";
import { loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await loginUser(identifier, password);

      localStorage.setItem("token", data.access_token);
      const companyName =
        data?.company_name ||
        data?.company?.name ||
        data?.user?.company_name ||
        data?.user?.company?.name;
      if (companyName) {
        localStorage.setItem("company_name", companyName);
      }

      router.push("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Login failed";
      setError(typeof message === "string" ? message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="aurora-bg min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/15 bg-[#081921]/70 shadow-2xl shadow-black/40 lg:grid-cols-2">
          <section className="relative hidden overflow-hidden p-10 lg:block">
            <div className="pointer-events-none absolute -top-14 -left-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl float-orb" />
            <div
              className="pointer-events-none absolute right-0 -bottom-10 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl float-orb"
              style={{ animationDelay: "900ms" }}
            />

            <div className="relative z-10 flex h-full flex-col justify-between fade-up">
              <div>
                <p className="mb-5 inline-flex rounded-full border border-emerald-300/40 bg-emerald-300/15 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-emerald-200">
                  CRM SUITE
                </p>
                <h1 className="max-w-md text-5xl font-semibold leading-[1.05] text-white">
                  Turn leads into real momentum.
                </h1>
                <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300">
                  Track pipeline health, spot high-intent accounts, and close faster
                  with a workflow designed for modern sales teams.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="glass-card lift-hover rounded-xl p-4">
                  <p className="text-slate-300">Pipeline Visibility</p>
                  <p className="mt-1 text-2xl font-semibold text-white">Live</p>
                </div>
                <div className="glass-card lift-hover rounded-xl p-4">
                  <p className="text-slate-300">Follow-up Rate</p>
                  <p className="mt-1 text-2xl font-semibold text-white">98%</p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative p-6 sm:p-10">
            <div className="zoom-in mx-auto w-full max-w-md">
              <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-emerald-200/90">
                SECURE SIGN IN
              </p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Login to continue managing your lead operations.
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">
                    Email or Username
                  </span>
                  <input
                    type="text"
                    placeholder="admin1@example.com"
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300/70 outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/30"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">
                    Password
                  </span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300/70 outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>

                {error ? (
                  <p className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in..." : "Login"}
                </button>

                <Link href="/signup">
                  Create a company account
                </Link>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
