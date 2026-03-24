"use client";

import { CheckCircle2, XCircle, HelpCircle, Globe } from "lucide-react";
import clsx from "clsx";
import type { Monitor } from "@/lib/types";

interface StatsBarProps {
  monitors: Monitor[];
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4">
      <div
        className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          accent
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100 tabular-nums leading-none">
          {value}
        </p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

export function StatsBar({ monitors }: StatsBarProps) {
  const total = monitors.length;
  const up = monitors.filter((m) => m.status === "UP").length;
  const down = monitors.filter((m) => m.status === "DOWN").length;
  const unknown = monitors.filter((m) => m.status === "UNKNOWN").length;

  const avgLatency =
    monitors.filter((m) => m.latency !== null).length > 0
      ? Math.round(
          monitors
            .filter((m) => m.latency !== null)
            .reduce((sum, m) => sum + (m.latency ?? 0), 0) /
            monitors.filter((m) => m.latency !== null).length
        )
      : null;

  const uptime =
    total > 0 ? Math.round((up / (total - unknown || 1)) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      <StatCard
        icon={<Globe className="w-5 h-5 text-blue-400" />}
        label="Total Monitors"
        value={total}
        accent="bg-blue-500/10"
      />
      <StatCard
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        label="Online"
        value={up}
        accent="bg-emerald-500/10"
      />
      <StatCard
        icon={<XCircle className="w-5 h-5 text-red-400" />}
        label="Down"
        value={down}
        accent="bg-red-500/10"
      />
      <StatCard
        icon={<HelpCircle className="w-5 h-5 text-slate-400" />}
        label="Avg Latency"
        value={avgLatency !== null ? `${avgLatency} ms` : "—"}
        accent="bg-slate-700/40"
      />
      <StatCard
        icon={
          <span className="text-lg font-bold text-amber-400">%</span>
        }
        label="Uptime Rate"
        value={total > 0 ? `${uptime}%` : "—"}
        accent="bg-amber-500/10"
      />
    </div>
  );
}
