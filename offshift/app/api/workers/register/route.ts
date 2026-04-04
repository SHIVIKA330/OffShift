import { NextResponse } from "next/server";

import { computeKavachScore, type ShiftType } from "@/lib/kavach-engine";
import { getMockAqiForZone } from "@/lib/mock-data";
import { hashPassword } from "@/lib/password";
import { createServiceRoleClient } from "@/lib/supabase-service";
import { normalizeZone, type ZoneSlug } from "@/lib/zones";

export async function POST(req: Request) {
  let body: {
    name: string;
    platform: string;
    rider_id: string;
    zone: string;
    shift_type: ShiftType;
    active_days_per_week: number;
    kavach_score?: number | null;
    phone: string;
    password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!body.phone) {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }

  const zone = normalizeZone(body.zone);
  if (!zone) {
    return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
  }

  const riderOk = /^(ZO|SG|ZP)-[A-Z0-9]{4,}$/i.test(body.rider_id);
  if (!riderOk) {
    return NextResponse.json(
      { error: "Invalid rider ID format (ZO-XXXXX, SG-XXXXX, or ZP-XXXXX)" },
      { status: 400 }
    );
  }

  const ks =
    body.kavach_score ??
    computeKavachScore({
      zone,
      shift_type: body.shift_type,
      active_days: body.active_days_per_week,
      aqi_forecast_peak: getMockAqiForZone(zone as ZoneSlug).aqi_forecast_peak,
    });

  const supabase = createServiceRoleClient();

  // Check if rider_id or phone already exists
  const { data: existing } = await supabase
    .from("workers")
    .select("id")
    .eq("rider_id", body.rider_id.toUpperCase())
    .single();

  if (existing) {
    return NextResponse.json({ ok: true, worker_id: existing.id });
  }

  // Hash password if provided
  const pw_hash = body.password ? hashPassword(body.password) : null;

  // Create new worker
  const { data: worker, error } = await supabase
    .from("workers")
    .insert({
      phone: body.phone,
      name: body.name,
      platform: body.platform.charAt(0).toUpperCase() + body.platform.slice(1),
      rider_id: body.rider_id.toUpperCase(),
      zone,
      shift_type: body.shift_type,
      active_days_per_week: body.active_days_per_week,
      kavach_score: ks,
      password_hash: pw_hash,
      is_verified: true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, worker_id: worker.id });
}
