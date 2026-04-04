import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-service";

export async function POST(req: Request) {
  let body: { phone?: string; rider_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Try lookup by rider_id first (more unique), then by phone
  if (body.rider_id) {
    const { data } = await supabase
      .from("workers")
      .select("id, name, phone, platform, rider_id, zone, shift_type, active_days_per_week, kavach_score")
      .eq("rider_id", body.rider_id.toUpperCase())
      .single();

    if (data) {
      return NextResponse.json({ found: true, worker: data });
    }
  }

  if (body.phone) {
    const normalized = `+91${body.phone.replace(/\D/g, "").slice(-10)}`;
    const { data } = await supabase
      .from("workers")
      .select("id, name, phone, platform, rider_id, zone, shift_type, active_days_per_week, kavach_score")
      .eq("phone", normalized)
      .single();

    if (data) {
      return NextResponse.json({ found: true, worker: data });
    }
  }

  return NextResponse.json({ found: false });
}
