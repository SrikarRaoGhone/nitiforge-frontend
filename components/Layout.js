"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Users, LogOut, Workflow, Search, Bell, UserCircle, Building2 } from "lucide-react";
import { getCurrentCompany, getCurrentUser, getTokenProfile } from "@/lib/auth";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState("User");

  const resolveCompanyName = (source) => {
    if (!source) return "";
    return (
      source.company_name ||
      source.companyName ||
      source.company?.name ||
      source.organization?.name ||
      source.tenant?.name ||
      source.name ||
      ""
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("company_name");
    router.push("/login");
  };

  useEffect(() => {
    const loadIdentity = async () => {
      const cachedCompany = localStorage.getItem("company_name");
      if (cachedCompany) {
        setCompanyName(cachedCompany);
      }

      const tokenProfile = getTokenProfile();
      if (tokenProfile?.company_name) {
        setCompanyName(tokenProfile.company_name);
        localStorage.setItem("company_name", tokenProfile.company_name);
      }
      if (tokenProfile?.name || tokenProfile?.email) {
        setDisplayName(tokenProfile.name || tokenProfile.email);
      }

      try {
        const profile = await getCurrentUser();
        let company = resolveCompanyName(profile);
        const name = profile?.name || profile?.full_name || profile?.email || profile?.username;

        if (!company) {
          const companyRef =
            profile?.company_id ||
            profile?.company?.id ||
            tokenProfile?.company_id ||
            tokenProfile?.company?.id;
          const companyData = await getCurrentCompany(companyRef);
          company = resolveCompanyName(companyData);
        }

        if (company) setCompanyName(company);
        if (company) localStorage.setItem("company_name", company);
        if (name) setDisplayName(name);
      } catch {
        // Keep token-derived fallback identity.
      }
    };

    loadIdentity();
  }, []);

  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      name: "Pipeline",
      icon: Workflow,
      href: "/pipeline",
    },
    {
      name: "Leads",
      icon: Users,
      href: "/leads",
    },
    {
      name: "Team",
      icon: Users,
      href: "/team",
    },
    {
      name: "Reminders",
      icon: Bell,
      href: "/reminders",
    },
    {
      name: "Profile",
      icon: UserCircle,
      href: "/profile",
    },
  ];

  return (
    <div className="app-shell-bg flex h-screen">
      {/* Sidebar */}
      <aside className="relative w-72 border-r border-white/30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-5 text-slate-100">
        <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 -right-10 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative mb-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-200/90">
            CRM SUITE
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            <span className="brand-gradient-text">NitiForge</span>
          </h1>
          <p className="mt-1 text-xs text-slate-300">Lead intelligence workspace</p>
        </div>

        <nav className="relative space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition
                ${
                  pathname === item.href
                    ? "border-cyan-300/60 bg-cyan-400/20 text-cyan-100 shadow-lg shadow-cyan-500/20"
                    : "border-transparent bg-white/5 text-slate-200 hover:border-white/15 hover:bg-white/10"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute right-4 bottom-5 left-4">
          <button
            onClick={logout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300/40 bg-rose-500/80 py-2.5 font-medium text-white transition hover:bg-rose-500"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute top-0 right-0 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 left-8 h-44 w-44 rounded-full bg-indigo-300/20 blur-3xl" />

        <header className="relative mb-6 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-cyan-200/70 bg-gradient-to-r from-slate-50/95 via-cyan-50 to-indigo-50 px-4 py-3 shadow-[0_16px_45px_rgba(14,116,144,0.14)] backdrop-blur">
          <div className="pointer-events-none absolute -top-8 -left-8 h-28 w-28 rounded-full bg-cyan-300/35 blur-2xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-indigo-300/30 blur-3xl" />

          <div className="relative">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-white/70 px-2.5 py-1 text-[11px] font-bold tracking-[0.18em] text-cyan-700">
              <Building2 size={11} />
              {companyName || "Company"}
            </p>
            <p className="mt-2 text-base font-medium text-slate-700">
              Command center for <span className="font-semibold text-cyan-700">leads</span> and{" "}
              <span className="font-semibold text-indigo-700">deal flow</span>
            </p>
          </div>

          <div className="relative flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-cyan-200 bg-white/90 px-3 py-2 text-slate-500 shadow-sm md:flex">
              <Search size={14} />
              <span className="text-sm">Search...</span>
            </div>
            <button
              type="button"
              className="rounded-xl border border-indigo-200 bg-white/90 p-2 text-slate-600 shadow-sm transition hover:bg-indigo-50"
            >
              <Bell size={16} />
            </button>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-indigo-50"
            >
              <UserCircle size={16} />
              <span className="max-w-[150px] truncate">{displayName}</span>
            </Link>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <footer className="mt-4 shrink-0 border-t border-slate-200/80 pt-3 text-center text-sm text-slate-500">
          nitiforge.com
        </footer>
      </main>
    </div>
  );
}
