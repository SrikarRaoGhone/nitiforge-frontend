"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { getCompanySettings, updateCompanySettings } from "@/lib/settings";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  sms_api_key: "",
  whatsapp_api_key: "",
  email_api_key: "",
  openai_api_key: "",
  use_own_openai: false,
  ai_usage: 0,
};

export default function SettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCompanySettings();
        setForm({ ...emptyForm, ...data });
        setError("");
      } catch (err) {
        setError(err?.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setSuccess("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateCompanySettings({
        ...form,
        openai_api_key: form.openai_api_key?.trim() || null,
      });
      if (response?.company) {
        setForm((current) => ({ ...current, ...response.company }));
      }
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err?.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const noKeysConfigured =
    !form.sms_api_key && !form.whatsapp_api_key && !form.email_api_key;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="app-card rounded-2xl p-6">
          <p className="section-kicker">Workspace Setup</p>
          <h1 className="section-title mt-2">Settings</h1>
          <p className="muted-copy mt-2">
            Manage your company profile and configure communication API keys for SMS, WhatsApp, and email workflows.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        {noKeysConfigured && !loading ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Configure API keys in Settings to enable messaging.
          </div>
        ) : null}

        <form onSubmit={handleSave} className="space-y-5">
          <section className="app-card rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="panel-title">Company Info</h2>
                <p className="muted-copy mt-1">
                  Basic company details used across communication and account setup.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-2 block font-medium text-slate-600">Company Name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="NitiForge"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <label className="text-sm">
                <span className="mb-2 block font-medium text-slate-600">Email</span>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ops@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <label className="text-sm md:col-span-2">
                <span className="mb-2 block font-medium text-slate-600">Phone</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
            </div>
          </section>

          <section className="app-card rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="panel-title">Communication API Keys</h2>
                <p className="muted-copy mt-1">
                  Store provider credentials here so messaging services can use company-specific API keys.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Required for messaging
              </span>
            </div>

            <div className="grid gap-4">
              <label className="text-sm">
                <span className="mb-2 block font-medium text-slate-600">SMS API Key</span>
                <input
                  name="sms_api_key"
                  value={form.sms_api_key}
                  onChange={handleChange}
                  placeholder="MSG91 auth key"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <label className="text-sm">
                <span className="mb-2 block font-medium text-slate-600">WhatsApp API Key</span>
                <input
                  name="whatsapp_api_key"
                  value={form.whatsapp_api_key}
                  onChange={handleChange}
                  placeholder="WhatsApp provider API key"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <label className="text-sm">
                <span className="mb-2 block font-medium text-slate-600">Email API Key</span>
                <input
                  name="email_api_key"
                  value={form.email_api_key}
                  onChange={handleChange}
                  placeholder="SendGrid or email provider API key"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
            </div>
          </section>

          <section className="app-card rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="panel-title">AI Settings</h2>
                <p className="muted-copy mt-1">
                  Use the system-managed AI quota by default, or switch to your own OpenAI key for advanced usage.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Usage: {form.ai_usage || 0}
              </span>
            </div>

            <div className="grid gap-4">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="pr-4">
                  <span className="block text-sm font-medium text-slate-700">Use own OpenAI key</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Enable BYOK for AI features. System AI remains available with a controlled company quota.
                  </span>
                </div>
                <input
                  type="checkbox"
                  name="use_own_openai"
                  checked={Boolean(form.use_own_openai)}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
              </label>

              <label className="text-sm">
                <span className="mb-2 block font-medium text-slate-600">OpenAI API Key</span>
                <input
                  name="openai_api_key"
                  type="password"
                  value={form.openai_api_key || ""}
                  onChange={handleChange}
                  placeholder="sk-..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
            </div>
          </section>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
