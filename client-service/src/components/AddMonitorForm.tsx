"use client";

import { useState } from "react";
import { Plus, Globe, Loader2, AlertCircle, Send, Hash, BellRing, Link } from "lucide-react";
import clsx from "clsx";

interface AddMonitorFormProps {
  onAdded: () => void;
}

export function AddMonitorForm({ onAdded }: AddMonitorFormProps) {
  const [url, setUrl] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmed = url.trim();
    if (!trimmed) return;

    const normalized =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    setLoading(true);
    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: normalized,
          telegramToken: telegramToken.trim() || null,
          telegramChatId: telegramChatId.trim() || null,
          webhookUrl: webhookUrl.trim() || null
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to add monitor");

      setUrl("");
      setTelegramToken("");
      setTelegramChatId("");
      setWebhookUrl("");
      setShowNotifications(false);
      setSuccess(true);
      onAdded();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 glow-accent mb-8 border border-white/[0.05]"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400 font-bold" />
          Add URL to Monitor
        </h2>
        <button
          type="button"
          onClick={() => setShowNotifications(!showNotifications)}
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            showNotifications 
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
              : "bg-white/[0.03] text-slate-500 border border-white/[0.05] hover:text-slate-300"
          )}
        >
          <BellRing className="w-3.5 h-3.5" />
          {showNotifications ? "Hide Alerts" : "Add Notifications"}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium select-none">
              https://
            </span>
            <input
              id="monitor-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              disabled={loading}
              className={clsx(
                "w-full pl-20 pr-4 py-3.5 rounded-xl bg-white/[0.03] border text-slate-100",
                "placeholder:text-slate-600 text-sm outline-none transition-all duration-200",
                "focus:border-blue-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-blue-500/10",
                error ? "border-red-500/60" : "border-white/[0.05]"
              )}
            />
          </div>

          <button
            id="add-monitor-btn"
            type="submit"
            disabled={loading || !url.trim()}
            className={clsx(
              "flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300",
              "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white",
              "disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed",
              "active:scale-[0.98] shadow-xl shadow-blue-900/40"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {loading ? "Creating…" : "Add Monitor"}
          </button>
        </div>

        {/* Telegram & Webhook Config */}
        {showNotifications && (
          <div className="flex flex-col gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] fade-slide-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3 h-3 text-blue-400" />
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="123456789:ABCDEF..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-200 text-xs outline-none focus:border-blue-500/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-3 h-3 text-blue-400" />
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="-100123456789"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-200 text-xs outline-none focus:border-blue-500/40"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-white/[0.03]">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Link className="w-3 h-3 text-blue-400" />
                Generic Webhook (Optional)
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://webhook.site/..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-200 text-xs outline-none focus:border-blue-500/40"
              />
            </div>

            <p className="text-[10px] text-slate-600 italic">
              Tip: Supports Discord, Slack, or any custom API that accepts JSON POST.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5 fade-slide-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 text-sm text-emerald-400 fade-slide-in">
          ✓ Monitor added — first check will run within 1 minute.
        </p>
      )}
    </form>
  );
}
