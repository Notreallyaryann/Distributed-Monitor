"use client";

import { useState } from "react";
import {
  Trash2,
  ExternalLink,
  Clock,
  Zap,
  Shield,
  Mail,
  Activity,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import clsx from "clsx";
import type { Monitor, MonitorStatus } from "@/lib/types";

// helpers 

function statusBadge(status: MonitorStatus) {
  if (status === "UP")
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
  if (status === "DOWN")
    return "bg-red-500/10 text-red-400 border border-red-500/30";
  return "bg-slate-700/40 text-slate-400 border border-slate-600/30";
}

function StatusIcon({ status }: { status: MonitorStatus }) {
  if (status === "UP")
    return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === "DOWN") return <XCircle className="w-4 h-4 text-red-400" />;
  return <HelpCircle className="w-4 h-4 text-slate-500" />;
}

function pulseCls(status: MonitorStatus) {
  if (status === "UP") return "pulse-up";
  if (status === "DOWN") return "pulse-down";
  return "";
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sslBadge(ssl: string) {
  if (ssl === "VALID")
    return (
      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full">
        SSL Valid
      </span>
    );
  if (ssl === "EXPIRED" || ssl === "INVALID")
    return (
      <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2 py-0.5 rounded-full">
        SSL {ssl}
      </span>
    );
  return (
    <span className="bg-slate-700/40 text-slate-500 border border-slate-600/20 text-xs px-2 py-0.5 rounded-full">
      SSL —
    </span>
  );
}

function latencyColor(ms: number | null) {
  if (ms === null) return "text-slate-500";
  if (ms < 300) return "text-emerald-400";
  if (ms < 800) return "text-amber-400";
  return "text-red-400";
}

// component 

interface MonitorCardProps {
  monitor: Monitor;
  onDeleted: (id: number) => void;
}

export function MonitorCard({ monitor, onDeleted }: MonitorCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/monitors/${monitor.id}`, {
        method: "DELETE",
      });
      if (res.ok) onDeleted(monitor.id);
    } catch {

    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const hostname = (() => {
    try {
      return new URL(monitor.url).hostname;
    } catch {
      return monitor.url;
    }
  })();

  return (
    <article
      className={clsx(
        "glass rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300",
        "hover:border-blue-500/30 hover:bg-white/[0.03] group fade-slide-in",
        monitor.status === "UP" && "hover:glow-up",
        monitor.status === "DOWN" && "hover:glow-down"
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Pulse dot */}
          <span
            className={clsx(
              "shrink-0 w-2.5 h-2.5 rounded-full",
              monitor.status === "UP" && "bg-emerald-400 pulse-up",
              monitor.status === "DOWN" && "bg-red-400 pulse-down",
              monitor.status === "UNKNOWN" && "bg-slate-500",
              pulseCls(monitor.status)
            )}
          />
          <div className="min-w-0">
            <p
              className="text-sm font-semibold text-slate-100 truncate"
              title={monitor.url}
            >
              {hostname}
            </p>
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1 mt-0.5"
            >
              {monitor.url.length > 40
                ? monitor.url.slice(0, 40) + "…"
                : monitor.url}
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </a>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={clsx(
            "shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
            statusBadge(monitor.status)
          )}
        >
          <StatusIcon status={monitor.status} />
          {monitor.status}
        </span>
      </div>

      {/* ── Metrics grid ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Latency */}
        <div className="bg-white/[0.03] rounded-xl p-3 flex flex-col gap-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Latency
          </span>
          <span
            className={clsx(
              "text-base font-bold tabular-nums",
              latencyColor(monitor.latency)
            )}
          >
            {monitor.latency !== null ? `${monitor.latency} ms` : "—"}
          </span>
        </div>

        {/* HTTP Status */}
        <div className="bg-white/[0.03] rounded-xl p-3 flex flex-col gap-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Activity className="w-3 h-3" /> HTTP Status
          </span>
          <span
            className={clsx(
              "text-base font-bold tabular-nums",
              monitor.httpStatus
                ? monitor.httpStatus < 400
                  ? "text-emerald-400"
                  : "text-red-400"
                : "text-slate-500"
            )}
          >
            {monitor.httpStatus ?? "—"}
          </span>
        </div>

        {/* Last Checked */}
        <div className="bg-white/[0.03] rounded-xl p-3 flex flex-col gap-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Last Checked
          </span>
          <span className="text-xs font-medium text-slate-300">
            {formatDate(monitor.lastCheckedAt)}
          </span>
        </div>

        {/* Email Alert */}
        <div className="bg-white/[0.03] rounded-xl p-3 flex flex-col gap-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Mail className="w-3 h-3" /> Email Alert
          </span>
          <span
            className={clsx(
              "text-xs font-semibold",
              monitor.emailSent ? "text-blue-400" : "text-slate-500"
            )}
          >
            {monitor.emailSent ? "✓ Sent" : "Not triggered"}
          </span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          {sslBadge(monitor.sslStatus)}
          {monitor.sslExpiresAt && (
            <span className="text-xs text-slate-600">
              expires {formatDate(monitor.sslExpiresAt)}
            </span>
          )}
        </div>

        <button
          id={`delete-monitor-${monitor.id}`}
          onClick={handleDelete}
          disabled={deleting}
          className={clsx(
            "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200",
            "border font-medium",
            confirmDelete
              ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
              : "bg-white/[0.03] border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/40",
            "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          {confirmDelete ? "Confirm?" : "Delete"}
        </button>
      </div>
    </article>
  );
}
