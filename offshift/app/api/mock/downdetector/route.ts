import { NextResponse } from "next/server";

import { getMockDowndetector } from "@/lib/mock-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const p = (searchParams.get("platform") ?? "zomato").toLowerCase();
  if (p !== "zomato" && p !== "swiggy") {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }
  return NextResponse.json({
    source: "mock_downdetector",
    ...getMockDowndetector(p),
    checked_at: new Date().toISOString(),
  });
}
