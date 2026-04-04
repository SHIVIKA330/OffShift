import { NextResponse } from "next/server";

import { getMockAqiForZone } from "@/lib/mock-data";
import { ZONE_OPTIONS, type ZoneSlug } from "@/lib/zones";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zone = (searchParams.get("zone") ?? "okhla").toLowerCase() as ZoneSlug;
  const valid = ZONE_OPTIONS.some((z) => z.value === zone);
  if (!valid) {
    return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
  }
  return NextResponse.json({
    source: "mock_cpcb_delhi_ncr",
    updated_at: new Date().toISOString(),
    ...getMockAqiForZone(zone),
  });
}
