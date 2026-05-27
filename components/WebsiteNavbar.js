"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/faq", label: "FAQ" },
  { href: "/demo", label: "Book Demo" },
];

export default function WebsiteNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#0f172a)] text-sm font-bold tracking-[0.2em] text-white">
            NF
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-950">NitiForge</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">AI CRM</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition ${
                pathname === item.href ? "text-cyan-700" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-[linear-gradient(135deg,#06b6d4,#2563eb)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
          >
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}
