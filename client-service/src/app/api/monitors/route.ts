import { NextRequest, NextResponse } from "next/server";

const MONITOR_SERVICE = process.env.MONITOR_SERVICE_URL ?? "http://localhost:4000";

// GET /api/monitors
export async function GET() {
  try {
    const res = await fetch(`${MONITOR_SERVICE}/monitors`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Monitor service unreachable" }, { status: 502 });
  }
}

// POST /api/monitors
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${MONITOR_SERVICE}/monitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Monitor service unreachable" }, { status: 502 });
  }
}
