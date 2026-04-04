import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase-service";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  let body: { phone: string; password: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.phone || !body.password) {
    return NextResponse.json(
      { error: "Phone and password required" },
      { status: 400 }
    );
  }

  const normalized = `+91${body.phone.replace(/\D/g, "").slice(-10)}`;
  const supabase = createServiceRoleClient();

  const { data: worker } = await supabase
    .from("workers")
    .select(
      "id, name, phone, platform, rider_id, zone, shift_type, kavach_score, password_hash"
    )
    .eq("phone", normalized)
    .single();

  if (!worker) {
    return NextResponse.json(
      { error: "Account not found / खाता नहीं मिला" },
      { status: 404 }
    );
  }

  if (!worker.password_hash) {
    return NextResponse.json(
      { error: "No password set — please sign up again / कृपया दोबारा साइन अप करें" },
      { status: 400 }
    );
  }

  const valid = verifyPassword(body.password, worker.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Wrong password / गलत पासवर्ड" },
      { status: 401 }
    );
  }

  // Don't send password_hash to client
  const { password_hash: _, ...safeWorker } = worker;

  return NextResponse.json({ ok: true, worker: safeWorker });
}
