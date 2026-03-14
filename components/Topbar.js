"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getCompany } from "@/lib/company";
import { getCurrentUser, getTokenProfile } from "@/lib/auth";
import { getFollowupReminders } from "@/lib/leads";
import { Bell, ChevronDown, LogOut, Moon, Search, Settings, Sun, UserCircle } from "lucide-react";

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [company, setCompany] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("company_name") || getTokenProfile()?.company_name || "";
  });
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [accountName, setAccountName] = useState(() => getTokenProfile()?.name || "My Account");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const { theme, setTheme } = useTheme();
  const urlSearch = searchParams.get("q") || "";

  const loadCompany = async () => {
    try {
      const data = await getCompany();
      const resolvedName =
        data?.company_name ||
        data?.company?.name ||
        data?.name ||
        localStorage.getItem("company_name") ||
        "Company";
      setCompany(resolvedName);
      if (resolvedName && resolvedName !== "Company") {
        localStorage.setItem("company_name", resolvedName);
      }
    } catch {
      const cached = localStorage.getItem("company_name");
      setCompany(cached || "Company");
    }
  };

  const loadAccount = async () => {
    try {
      const data = await getCurrentUser();
      setAccountName(data?.name || data?.email || getTokenProfile()?.name || "My Account");
      if (data?.role) {
        localStorage.setItem("role", data.role);
      }
    } catch {
      setAccountName(getTokenProfile()?.name || "My Account");
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getFollowupReminders();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.reminders)
          ? data.reminders
          : Array.isArray(data?.items)
            ? data.items
            : [];
      setNotifications(items.slice(0, 5));
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCompany();
    loadNotifications();
    loadAccount();
    setMounted(true);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = search.trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const target = params.toString() ? `/leads?${params.toString()}` : "/leads";
    router.push(target);
  };

  const handleNotificationToggle = () => {
    setOpen((value) => !value);
    setAccountOpen(false);
  };

  const handleAccountToggle = () => {
    setAccountOpen((value) => !value);
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("company_name");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-950">
      {/* Left Section */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
          {company}
        </h1>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="hidden w-full max-w-md items-center rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-900 md:flex"
      >
        <Search size={16} className="mr-2 text-gray-400 dark:text-slate-500" />

        <input
          placeholder="Search leads..."
          value={pathname === "/leads" && search !== urlSearch ? search : (pathname === "/leads" ? urlSearch : search)}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="ml-2 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-500"
        >
          Search
        </button>
      </form>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-1.5 text-gray-600 transition hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900"
          type="button"
        >
          {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={handleNotificationToggle}
            className="relative rounded-lg p-1.5 text-gray-600 transition hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <Bell size={20} className="cursor-pointer" />
          </button>

          {notifications.length ? (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
              {notifications.length}
            </span>
          ) : null}

          {open && (
            <div className="absolute right-0 z-20 mt-3 w-72 rounded-lg border bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950">
              <p className="mb-2 font-semibold dark:text-slate-100">Notifications</p>

              {notifications.length ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="border-b py-2 text-sm text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"
                  >
                    Follow up: {n.name}
                  </div>
                ))
              ) : (
                <div className="py-2 text-sm text-gray-500 dark:text-slate-400">
                  No reminders right now.
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={handleAccountToggle}
            className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition hover:bg-gray-100 dark:hover:bg-slate-900"
          >
            <UserCircle size={24} className="text-gray-600 dark:text-slate-300" />

            <span className="hidden max-w-36 truncate text-sm text-gray-700 dark:text-slate-300 md:block">
              {accountName}
            </span>
            <ChevronDown size={16} className="hidden text-gray-500 dark:text-slate-400 md:block" />
          </button>

          {accountOpen && (
            <div className="absolute right-0 z-20 mt-3 w-56 rounded-lg border bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950">
              <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{accountName}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{pathname === "/profile" ? "Account settings" : "Signed in"}</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <Settings size={16} />
                My Account
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
