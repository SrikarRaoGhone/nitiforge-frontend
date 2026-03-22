import Link from "next/link";

export default function WebsiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-6 py-10 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">NitiForge</p>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            AI-powered CRM for real estate teams that need faster follow-ups, better visibility, and higher conversion.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/features" className="hover:text-white">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="/demo" className="hover:text-white">
            Book Demo
          </Link>
          <Link href="/login" className="hover:text-white">
            Login
          </Link>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-7xl text-center text-sm text-slate-500">
        &copy; NitiForge 2026
      </p>
    </footer>
  );
}
