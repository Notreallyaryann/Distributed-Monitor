"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Radio,
  RefreshCw,
  Wifi,
  WifiOff,
  Sparkles,
  ArrowRight,
  Server,
  Database,
  Cpu,
  Mail,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
import clsx from "clsx";
import type { Monitor } from "@/lib/types";
import { AddMonitorForm } from "@/components/AddMonitorForm";
import { MonitorCard } from "@/components/MonitorCard";
import { StatsBar } from "@/components/StatsBar";
import { SkeletonGrid, SkeletonStats } from "@/components/Skeletons";

// Auto-refresh interval
const POLL_INTERVAL = 30_000; // 30 seconds

export default function Home() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UP" | "DOWN" | "UNKNOWN">(
    "ALL"
  );

  const fetchMonitors = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/monitors", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load monitors");
      const data: Monitor[] = await res.json();
      setMonitors(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(() => fetchMonitors(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMonitors]);

  // Dismiss hero after monitors loaded or user scrolls
  useEffect(() => {
    if (monitors.length > 0) {
      const timer = setTimeout(() => setShowHero(false), 800);
      return () => clearTimeout(timer);
    }
  }, [monitors]);

  const handleDeleted = (id: number) => {
    setMonitors((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAdded = () => {
    fetchMonitors(true);
  };

  //  Filter 
  const filteredMonitors =
    filter === "ALL" ? monitors : monitors.filter((m) => m.status === filter);

  const upCount = monitors.filter((m) => m.status === "UP").length;
  const downCount = monitors.filter((m) => m.status === "DOWN").length;
  const allHealthy = monitors.length > 0 && downCount === 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] relative overflow-x-hidden">
      {/* ── Ambient background glow ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-purple-500/[0.03] blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/[0.02] blur-[80px]" />
      </div>

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 glass border-b border-[var(--color-border)] backdrop-blur-xl bg-[var(--color-bg-base)]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
                Distributed Monitor
              </h1>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase mt-0.5">
                Uptime Monitoring System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-white/[0.03] border border-[var(--color-border)] rounded-full px-3 py-1.5">
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  allHealthy
                    ? "bg-emerald-400 pulse-up"
                    : downCount > 0
                      ? "bg-red-400 pulse-down"
                      : "bg-slate-500"
                )}
              />
              {allHealthy ? "All Systems Operational" : downCount > 0 ? `${downCount} Issue${downCount > 1 ? "s" : ""} Detected` : "Monitoring"}
            </div>

            {/* Refresh button */}
            <button
              id="refresh-monitors-btn"
              onClick={() => fetchMonitors(true)}
              disabled={isRefreshing}
              className={clsx(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200",
                "bg-white/[0.05] border border-[var(--color-border)] text-slate-400 hover:text-slate-200 hover:border-blue-500/40",
                "active:scale-95 disabled:opacity-50"
              )}
            >
              <RefreshCw
                className={clsx(
                  "w-3.5 h-3.5",
                  isRefreshing && "animate-spin"
                )}
              />
              Refresh
            </button>

            {/* GitHub */}
            <a
              href="https://github.com/Notreallyaryann/Distributed-Monitor"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/[0.05] border border-[var(--color-border)] flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-20">
        {/* ── Hero Section (shows when no monitors) ── */}
        {(showHero && monitors.length === 0 && !loading) && (
          <section className="mb-12 fade-slide-in">
            <div className="glass rounded-3xl p-8 sm:p-12 glow-accent relative overflow-hidden">
              {/* Decorative grid */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">
                    Distributed Architecture
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3 leading-tight">
                  Monitor your services
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                    with confidence
                  </span>
                </h2>

                <p className="text-slate-400 text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
                  A production-grade uptime monitoring system built with microservices.
                  Add URLs below and get real-time status updates, latency tracking,
                  SSL validation, and email alerts — every 60 seconds.
                </p>

                {/* Architecture cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Server, label: "Scheduler", desc: "Cron + BullMQ" },
                    { icon: Cpu, label: "Workers", desc: "Concurrent checks" },
                    { icon: Database, label: "Monitor API", desc: "Prisma + PostgreSQL" },
                    { icon: Mail, label: "Alerts", desc: "Email on change" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div
                      key={label}
                      className="bg-white/[0.03] border border-[var(--color-border)] rounded-xl p-4 hover:border-blue-500/30 transition-colors group"
                    >
                      <Icon className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-semibold text-slate-200">{label}</p>
                      <p className="text-[11px] text-slate-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Add Monitor Form ── */}
        <AddMonitorForm onAdded={handleAdded} />

        {/* ── Stats Bar ── */}
        {loading ? (
          <SkeletonStats />
        ) : monitors.length > 0 ? (
          <div className="fade-slide-in">
            <StatsBar monitors={monitors} />
          </div>
        ) : null}

        {/* ── Filter Tabs + Last Updated ── */}
        {monitors.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 fade-slide-in">
            <div className="flex items-center gap-1 bg-white/[0.03] border border-[var(--color-border)] rounded-xl p-1">
              {(
                [
                  { key: "ALL", label: "All", count: monitors.length },
                  { key: "UP", label: "Up", count: upCount },
                  { key: "DOWN", label: "Down", count: downCount },
                  {
                    key: "UNKNOWN",
                    label: "Unknown",
                    count: monitors.filter((m) => m.status === "UNKNOWN").length,
                  },
                ] as const
              ).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={clsx(
                    "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200",
                    filter === key
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {label}
                  <span
                    className={clsx(
                      "text-[10px] tabular-nums px-1.5 py-0.5 rounded-full",
                      filter === key
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-white/[0.05] text-slate-600"
                    )}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {lastRefresh && (
              <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <Radio className="w-3 h-3" />
                Updated {lastRefresh.toLocaleTimeString()} · auto-refreshes
                every 30s
              </p>
            )}
          </div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <div className="glass rounded-2xl p-8 text-center fade-slide-in mb-6">
            <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-medium mb-1">
              Connection Error
            </p>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button
              onClick={() => fetchMonitors(true)}
              className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Loading state ── */}
        {loading && <SkeletonGrid />}

        {/* ── Empty state ── */}
        {!loading && monitors.length === 0 && !error && (
          <div className="glass rounded-2xl p-12 text-center fade-slide-in">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              No monitors yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
              Add your first URL above to start monitoring. You&apos;ll see status,
              latency, and alert data appear here within 60 seconds.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-blue-400">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Enter a URL above to get started</span>
            </div>
          </div>
        )}

        {/* ── Monitor cards grid ── */}
        {!loading && filteredMonitors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMonitors.map((monitor) => (
              <MonitorCard
                key={monitor.id}
                monitor={monitor}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

        {/* ── No results for filter ── */}
        {!loading &&
          monitors.length > 0 &&
          filteredMonitors.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center fade-slide-in">
              <p className="text-slate-400 text-sm">
                No monitors with status &quot;{filter}&quot;
              </p>
            </div>
          )}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[var(--color-border)] bg-[var(--color-bg-base)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Activity className="w-3.5 h-3.5" />
            <span>Distributed Monitor</span>
            <span className="text-slate-700">·</span>
            <span>Built with Next.js, Express, BullMQ, Prisma</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-up" />
              System Status
            </span>
            <a
              href="https://github.com/Notreallyaryann/Distributed-Monitor"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
