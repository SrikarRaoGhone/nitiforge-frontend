"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Users, LogOut, Workflow, Bell, UserCircle, Shield, BrainCircuit, Bot } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("role") || "";
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("company_name");
    localStorage.removeItem("role");
    router.push("/login");
  };

  useEffect(() => {
    const hydrateRole = async () => {
      try {
        const me = await getCurrentUser();
        const resolvedRole = me?.role || "";
        if (resolvedRole) {
          localStorage.setItem("role", resolvedRole);
          setRole(resolvedRole);
        }
      } catch {
        // Keep existing local value if profile lookup fails.
      }
    };

    hydrateRole();
  }, []);

  const canAccessAdmin =
    role === "admin" || role === "superadmin" || role === "super_admin";
  const canAccessTeam =
    role === "admin" || role === "superadmin" || role === "super_admin";

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
      name: "Smart Queue",
      icon: BrainCircuit,
      href: "/smart-queue",
    },
    {
      name: "Copilot",
      icon: Bot,
      href: "/copilot",
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
    {
      name: "Admin",
      icon: Shield,
      href: "/admin",
    },
  ].filter((item) => {
    if (item.href === "/admin") return canAccessAdmin;
    if (item.href === "/team") return canAccessTeam;
    return true;
  });

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
      <main className="flex-1 flex flex-col min-h-0">
        <Topbar />
        <div className="p-8 overflow-y-auto min-h-0 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
        <footer className="shrink-0 border-t border-slate-200/80 py-3 text-center text-sm text-slate-500">
          nitiforge.com
        </footer>
      </main>
    </div>
  );
}
