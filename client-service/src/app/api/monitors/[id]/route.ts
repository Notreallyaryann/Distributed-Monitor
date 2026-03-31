import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const MONITOR_SERVICE = process.env.MONITOR_SERVICE_URL ?? "http://localhost:4000";

// DELETE /api/monitors/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const res = await fetch(`${MONITOR_SERVICE}/monitors/${id}`, {
      method: "DELETE",
      headers: { "x-user-email": session.user.email },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Monitor service unreachable" }, { status: 502 });
  }
}

// GET /api/monitors/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const res = await fetch(`${MONITOR_SERVICE}/monitors/${id}`, {
      cache: "no-store",
      headers: { "x-user-email": session.user.email },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Monitor service unreachable" }, { status: 502 });
  }
}
