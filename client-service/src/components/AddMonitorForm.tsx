"use client";

import { useState } from "react";
import { Plus, Globe, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface AddMonitorFormProps {
  onAdded: () => void;
}

export function AddMonitorForm({ onAdded }: AddMonitorFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmed = url.trim();
    if (!trimmed) return;

    // auto-prepend https if missing
    const normalized =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    setLoading(true);
    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to add monitor");

      setUrl("");
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
      className="glass rounded-2xl p-6 glow-accent mb-8"
    >
      <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-400" />
        Add URL to Monitor
      </h2>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
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
              "w-full pl-20 pr-4 py-3 rounded-xl bg-white/5 border text-slate-100",
              "placeholder:text-slate-600 text-sm outline-none transition-all duration-200",
              "focus:border-blue-500 focus:bg-white/8 focus:ring-2 focus:ring-blue-500/20",
              error ? "border-red-500/60" : "border-slate-700"
            )}
          />
        </div>

        <button
          id="add-monitor-btn"
          type="submit"
          disabled={loading || !url.trim()}
          className={clsx(
            "flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200",
            "bg-blue-600 hover:bg-blue-500 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "active:scale-95 shadow-lg shadow-blue-600/20"
          )}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {loading ? "Adding…" : "Add Monitor"}
        </button>
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
