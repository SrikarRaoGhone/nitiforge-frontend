"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import { changePassword, getCurrentUser, getTokenProfile } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadProfile = useCallback(async () => {
    setError("");
    const tokenProfile = getTokenProfile();
    if (tokenProfile) setProfile(tokenProfile);

    try {
      const data = await getCurrentUser();
      const normalized = {
        name: data?.name || data?.full_name || data?.username || tokenProfile?.name || "",
        email: data?.email || tokenProfile?.email || "",
        company_name:
          data?.company_name ||
          data?.company?.name ||
          data?.organization?.name ||
          data?.tenant?.name ||
          tokenProfile?.company_name ||
          "CRM SUITE",
      };
      setProfile(normalized);
    } catch (err) {
      const message = err?.message || "Unable to load profile.";
      setError(message);
      if (message.toLowerCase().includes("session expired") || message.toLowerCase().includes("login")) {
        setTimeout(() => router.push("/login"), 600);
      }
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password should be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err?.message || "Unable to change password.";
      setError(message);
      if (message.toLowerCase().includes("session expired") || message.toLowerCase().includes("login")) {
        setTimeout(() => router.push("/login"), 600);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="mx-auto max-w-5xl space-y-5">
          <header className="app-card rounded-2xl p-6">
            <p className="section-kicker">Account</p>
            <h1 className="section-title mt-2">User Profile</h1>
            <p className="muted-copy mt-2">Manage account details and security settings.</p>
          </header>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
          ) : null}

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="app-card rounded-2xl p-6">
              <h2 className="panel-title mb-4">Profile Details</h2>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Name</p>
                  <p className="mt-1 font-medium text-slate-900">{profile?.name || "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Email</p>
                  <p className="mt-1 font-medium text-slate-900">{profile?.email || "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Company</p>
                  <p className="mt-1 font-medium text-slate-900">{profile?.company_name || "CRM SUITE"}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="app-card rounded-2xl p-6">
              <h2 className="panel-title mb-4">Change Password</h2>

              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  required
                />

                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  required
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>
        </div>
      </Layout>
    </AuthGuard>
  );
}
