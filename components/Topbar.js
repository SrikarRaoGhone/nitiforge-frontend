"use client";

export default function Topbar() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <input
        placeholder="Search leads..."
        className="border px-4 py-2 rounded-lg"
      />
    </div>
  );
}
