import type { Monitor } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_MONITOR_API ?? "http://localhost:4000";

export async function fetchMonitors(): Promise<Monitor[]> {
  const res = await fetch(`${BASE_URL}/monitors`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch monitors");
  return res.json();
}

export async function createMonitor(url: string): Promise<Monitor> {
  const res = await fetch(`${BASE_URL}/monitors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Failed to create monitor");
  }
  return res.json();
}

export async function deleteMonitor(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/monitors/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete monitor");
}
