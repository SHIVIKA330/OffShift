import { NextResponse } from "next/server";

import { computeKavachScore, type ShiftType } from "@/lib/kavach-engine";
import { getMockAqiForZone } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { normalizeZone, type ZoneSlug } from "@/lib/zones";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name: string;
    platform: "zomato" | "swiggy";
    rider_id: string;
    zone: string;
    shift_type: ShiftType;
    active_days_per_week: number;
    kavach_score?: number | null;
    phone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const zone = normalizeZone(body.zone);
  if (!zone) {
    return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
  }

  const riderOk = /^(ZO|SG)-[A-Z0-9]{4,}$/i.test(body.rider_id);
  if (!riderOk) {
    return NextResponse.json({ error: "Invalid rider ID format" }, { status: 400 });
  }

  const ks =
    body.kavach_score ??
    computeKavachScore({
      zone,
      shift_type: body.shift_type,
      active_days: body.active_days_per_week,
      aqi_forecast_peak: getMockAqiForZone(zone as ZoneSlug).aqi_forecast_peak,
    });

  const { error } = await supabase.from("workers").upsert(
    {
      id: user.id,
      phone: body.phone ?? user.phone ?? user.user_metadata?.phone ?? null,
      name: body.name,
      platform: body.platform,
      rider_id: body.rider_id.toUpperCase(),
      city: "Delhi NCR",
      zone,
      shift_type: body.shift_type,
      active_days_per_week: body.active_days_per_week,
      kavach_score: ks,
      is_verified: true,
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
