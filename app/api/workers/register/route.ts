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
    settlement_channel?: "UPI" | "IMPS" | "RAZORPAY";
    upi_vpa?: string;
    bank_account_number?: string;
    bank_ifsc?: string;
    bank_account_name?: string;
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

  // Relaxed regex to support all gig types (Construction, Uber, Ola, etc.)
  const riderOk = /^[A-Z0-9-_]{3,}$/i.test(body.rider_id);
  if (!riderOk) {
    return NextResponse.json(
      { error: "Invalid Worker ID format (minimum 3 alphanumeric characters)" },
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
  const { data: existingByRider } = await supabase
    .from("workers")
    .select("id, phone, name")
    .eq("rider_id", body.rider_id.toUpperCase())
    .maybeSingle();

  const { data: existingByPhone } = await supabase
    .from("workers")
    .select("id, rider_id, name")
    .eq("phone", body.phone)
    .maybeSingle();

  if (existingByRider) {
    if (existingByRider.phone !== body.phone) {
       return NextResponse.json({ error: `Rider ID ${body.rider_id} is already registered to another number.` }, { status: 400 });
    }
    return NextResponse.json({ ok: true, worker_id: existingByRider.id });
  }

  if (existingByPhone) {
    return NextResponse.json({ ok: true, worker_id: existingByPhone.id });
  }

  // Hash password if provided
  const pw_hash = body.password ? hashPassword(body.password) : null;

  // Create new worker — try with settlement fields, fallback to core fields
  const coreFields = {
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
  };

  const settlementFields = {
    settlement_channel: body.settlement_channel ?? "UPI",
    upi_vpa: body.upi_vpa ?? null,
    bank_account_number: body.bank_account_number ?? null,
    bank_ifsc: body.bank_ifsc ?? null,
    bank_account_name: body.bank_account_name ?? null,
  };

  try {
    // First try with settlement fields
    let result = await supabase
      .from("workers")
      .insert({ ...coreFields, ...settlementFields })
      .select("id")
      .single();

    // If settlement columns don't exist, retry without them
    if (result.error && result.error.message.includes("column")) {
      result = await supabase
        .from("workers")
        .insert(coreFields)
        .select("id")
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, worker_id: result.data.id });
  } catch (err) {
    console.error("[register] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
