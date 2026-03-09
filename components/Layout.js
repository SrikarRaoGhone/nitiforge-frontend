"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Layout({ children }) {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-60 bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">NitiForge</h2>

        <nav className="flex flex-col gap-4">
          <Link href="/dashboard">Dashboard</Link>

          <Link href="/leads">Leads</Link>
        </nav>

        <button onClick={logout} className="mt-10 bg-red-500 px-3 py-2 rounded">
          Logout
        </button>
      </div>

      {/* Page Content */}
      <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">{children}</div>
    </div>
  );
}
