import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase-service";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("offshift_admin")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const now = new Date();
  const startWeek = new Date(now);
  startWeek.setDate(now.getDate() - now.getDay());
  startWeek.setHours(0, 0, 0, 0);
  const endWeek = new Date(startWeek);
  endWeek.setDate(endWeek.getDate() + 7);

  const prevWeekStart = new Date(startWeek);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const { count: activePolicies } = await supabase
    .from("policies")
    .select("id", { count: "exact", head: true })
    .eq("status", "ACTIVE");

  const { data: policiesZone } = await supabase
    .from("policies")
    .select("worker_id, workers!inner(zone)")
    .eq("status", "ACTIVE");

  const zoneMap: Record<string, number> = {};
  for (const row of policiesZone ?? []) {
    const w = row.workers as { zone: string } | { zone: string }[] | null;
    const z = !w
      ? "unknown"
      : Array.isArray(w)
        ? (w[0]?.zone ?? "unknown")
        : w.zone;
    zoneMap[z] = (zoneMap[z] ?? 0) + 1;
  }

  const { data: premThis } = await supabase
    .from("policies")
    .select("premium_amount")
    .gte("created_at", startWeek.toISOString())
    .lt("created_at", endWeek.toISOString());

  const { data: premLast } = await supabase
    .from("policies")
    .select("premium_amount")
    .gte("created_at", prevWeekStart.toISOString())
    .lt("created_at", startWeek.toISOString());

  const revenueThis = (premThis ?? []).reduce(
    (a, p) => a + Number(p.premium_amount),
    0
  );
  const revenueLast = (premLast ?? []).reduce(
    (a, p) => a + Number(p.premium_amount),
    0
  );

  const { data: allPrem } = await supabase.from("policies").select("premium_amount");
  const { data: allPayout } = await supabase.from("claims").select("payout_amount").in("status", ["SETTLED"]);
  
  // Phase D: Fetch recent claims to demonstrate Fraud AI
  const { data: recentClaims } = await supabase
    .from("claims")
    .select("id, status, payout_amount, disruption_type, created_at, policy_id, policies(worker_id, workers(name, zone))")
    .order("created_at", { ascending: false })
    .limit(6);

  const totalPremiums = (allPrem ?? []).reduce(
    (a, p) => a + Number(p.premium_amount),
    0
  );
  const totalPayouts = (allPayout ?? []).reduce(
    (a, p) => a + Number(p.payout_amount),
    0
  );

  const lossRatio = totalPremiums > 0 ? totalPayouts / totalPremiums : 0;
  const enrollmentsSuspended = lossRatio > 0.85 && totalPremiums > 1000;

  return NextResponse.json({
    active_policies: activePolicies ?? 0,
    policies_by_zone: Object.entries(zoneMap).map(([name, value]) => ({
      zone: name,
      count: value,
    })),
    revenue_this_week: revenueThis,
    revenue_last_week: revenueLast,
    loss_ratio: lossRatio,
    total_premiums: totalPremiums,
    total_payouts: totalPayouts,
    recent_claims: recentClaims ?? [],
    enrollments_suspended: enrollmentsSuspended,
    bcr_target_min: 0.55,
    bcr_target_max: 0.7,
  });
}
