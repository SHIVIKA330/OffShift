import { NextResponse } from "next/server";

import { runFraudDetection } from "@/lib/claude";

export async function POST(req: Request) {
  const key = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (key && auth !== `Bearer ${key}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await runFraudDetection(body);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
