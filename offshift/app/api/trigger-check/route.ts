import { NextResponse } from "next/server";

import { processClaimPipeline } from "@/lib/claim-pipeline";
import { getMockAqiForZone, getMockDowndetector } from "@/lib/mock-data";
import { createServiceRoleClient } from "@/lib/supabase-service";
import {
  fetchHourlyPrecipitationMm,
  rainPayoutFraction,
  shiftMatchesCurrentIST,
} from "@/lib/trigger-monitor";
import { getRedis } from "@/lib/redis";
import { ZONE_COORDS, type ZoneSlug } from "@/lib/zones";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function workerZone(w: unknown): string | undefined {
  if (!w || typeof w !== "object") return undefined;
  if (Array.isArray(w)) return (w[0] as { zone?: string })?.zone;
  return (w as { zone?: string }).zone;
}

function workerMeta(w: unknown): {
  zone?: string;
  shift_type?: string;
  platform?: string;
} {
  const raw = !w ? null : Array.isArray(w) ? w[0] : w;
  if (!raw || typeof raw !== "object") return {};
  const o = raw as { zone?: string; shift_type?: string; platform?: string };
  return { zone: o.zone, shift_type: o.shift_type, platform: o.platform };
}

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization");
  const vercelCron = req.headers.get("x-vercel-cron");
  return auth === `Bearer ${secret}` || vercelCron === "1";
}

async function expirePolicies(supabase: ReturnType<typeof createServiceRoleClient>) {
  await supabase
    .from("policies")
    .update({ status: "EXPIRED" })
    .eq("status", "ACTIVE")
    .lt("coverage_end", new Date().toISOString());
}

async function hasClaimToday(
  supabase: ReturnType<typeof createServiceRoleClient>,
  policyId: string,
  triggerType: string
): Promise<boolean> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("claims")
    .select("id", { count: "exact", head: true })
    .eq("policy_id", policyId)
    .eq("trigger_type", triggerType)
    .gte("created_at", start.toISOString());
  return (count ?? 0) > 0;
}

async function getSilentPingRatio(
  supabase: ReturnType<typeof createServiceRoleClient>,
  zone: string
): Promise<number> {
  const { data: policies } = await supabase
    .from("policies")
    .select("worker_id, workers!inner(zone)")
    .eq("status", "ACTIVE");

  const rows = (policies ?? []).filter(
    (p: { workers: unknown }) => workerZone(p.workers) === zone
  );
  const workerIds = Array.from(
    new Set(rows.map((r: { worker_id: string }) => r.worker_id))
  );
  if (workerIds.length === 0) return 0;

  const since = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  const { data: pings } = await supabase
    .from("worker_pings")
    .select("worker_id")
    .eq("zone", zone)
    .gte("pinged_at", since);

  const withPing = new Set((pings ?? []).map((p) => p.worker_id));
  const silent = workerIds.filter((id) => !withPing.has(id)).length;
  return silent / workerIds.length;
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const redis = getRedis();
  const zones = Object.keys(ZONE_COORDS) as ZoneSlug[];

  await expirePolicies(supabase);

  const summary = {
    rain: [] as string[],
    aqi: [] as string[],
    outage: [] as string[],
    errors: [] as string[],
  };

  const istNow = new Date().toLocaleString("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const hourBucket = istNow.replace(/[-:]/g, "").slice(0, 11);

  // ═══════════════════════════════════════
  // TRIGGER 1 — Heavy Rain (Weather Oracle)
  // ═══════════════════════════════════════
  for (const zone of zones) {
    try {
      const { currentHourMm, maxNext6hMm } =
        await fetchHourlyPrecipitationMm(zone);
      const mm = Math.max(currentHourMm, maxNext6hMm);
      if (mm < 20) continue;

      const dedupeKey = `trig:rain:${zone}:${hourBucket}`;
      if (redis) {
        const set = await redis.set(dedupeKey, "1", { nx: true, ex: 3600 });
        if (set === null) continue;
      }

      const { data: policies } = await supabase
        .from("policies")
        .select(
          "id, worker_id, max_payout, trigger_weather, workers!inner(zone, shift_type)"
        )
        .eq("status", "ACTIVE");

      const list = (
        policies ?? []
      ).filter(
        (p: { workers: unknown; trigger_weather: boolean }) => {
          const m = workerMeta(p.workers);
          return (
            m.zone === zone &&
            p.trigger_weather &&
            shiftMatchesCurrentIST(
              (m.shift_type ?? "flexible") as
                | "morning"
                | "evening"
                | "night"
                | "flexible"
            )
          );
        }
      );

      let triggered = 0;
      for (const p of list) {
        const pol = p as {
          id: string;
          worker_id: string;
          max_payout: number;
        };
        if (await hasClaimToday(supabase, pol.id, "RAIN")) continue;
        const frac = rainPayoutFraction(mm);
        if (frac <= 0) continue;
        const payout = Math.round(Number(pol.max_payout) * frac);
        const { data: claim, error } = await supabase
          .from("claims")
          .insert({
            policy_id: pol.id,
            worker_id: pol.worker_id,
            trigger_type: "RAIN",
            trigger_severity: `${mm}mm/hr`,
            zone,
            payout_amount: payout,
            status: "TRIGGERED",
          })
          .select("id")
          .single();
        if (!error && claim) {
          triggered++;
          await processClaimPipeline(claim.id);
        }
      }

      await supabase.from("trigger_events").insert({
        zone,
        trigger_type: "RAIN",
        severity: String(mm),
        severity_value: mm,
        hourly_rain_mm: mm,
        workers_triggered: triggered,
        metadata: { currentHourMm, maxNext6hMm },
      });
      summary.rain.push(`${zone}:${triggered}`);
    } catch (e) {
      summary.errors.push(`rain ${zone}: ${String(e)}`);
    }
  }

  // ═══════════════════════════════════════
  // TRIGGER 2 — AQI Spike (Mock CPCB)
  // ═══════════════════════════════════════
  for (const zone of zones) {
    try {
      const aqi = getMockAqiForZone(zone);
      if (aqi.aqi_current <= 300) continue;

      const dedupeKey = `trig:aqi:${zone}:${hourBucket}`;
      if (redis) {
        const set = await redis.set(dedupeKey, "1", { nx: true, ex: 3600 });
        if (set === null) continue;
      }

      const payoutFrac = aqi.aqi_current > 400 ? 1 : 0.5;

      await supabase.from("trigger_events").insert({
        zone,
        trigger_type: "AQI",
        severity: String(aqi.aqi_current),
        severity_value: aqi.aqi_current,
        aqi_value: aqi.aqi_current,
        metadata: { forecast_peak: aqi.aqi_forecast_peak },
      });

      const { data: policies } = await supabase
        .from("policies")
        .select(
          "id, worker_id, max_payout, trigger_weather, workers!inner(zone, shift_type)"
        )
        .eq("status", "ACTIVE");

      const list = (
        policies ?? []
      ).filter(
        (p: { workers: unknown; trigger_weather: boolean }) => {
          const m = workerMeta(p.workers);
          return m.zone === zone && p.trigger_weather;
        }
      );

      let triggered = 0;
      for (const p of list) {
        const pol = p as { id: string; worker_id: string; max_payout: number };
        if (await hasClaimToday(supabase, pol.id, "AQI")) continue;
        const payout = Math.round(Number(pol.max_payout) * payoutFrac);
        const { data: claim, error } = await supabase
          .from("claims")
          .insert({
            policy_id: pol.id,
            worker_id: pol.worker_id,
            trigger_type: "AQI",
            trigger_severity: `AQI ${aqi.aqi_current}`,
            zone,
            payout_amount: payout,
            status: "TRIGGERED",
          })
          .select("id")
          .single();
        if (!error && claim) {
          triggered++;
          await processClaimPipeline(claim.id);
        }
      }
      summary.aqi.push(`${zone}:${triggered}`);
    } catch (e) {
      summary.errors.push(`aqi ${zone}: ${String(e)}`);
    }
  }

  // ═══════════════════════════════════════
  // TRIGGER 3 — Platform App Outage
  // ═══════════════════════════════════════
  for (const platform of ["zomato", "swiggy"] as const) {
    try {
      const dd = getMockDowndetector(platform);
      if (dd.report_count <= 500) continue;

      for (const zone of zones) {
        const dedupeKey = `trig:out:${platform}:${zone}:${hourBucket}`;
        if (redis) {
          const set = await redis.set(dedupeKey, "1", {
            nx: true,
            ex: 3600,
          });
          if (set === null) continue;
        }

        let ratio = await getSilentPingRatio(supabase, zone);
        if (ratio < 0.3 && process.env.NODE_ENV === "development") {
          ratio = 0.35;
        }
        if (ratio < 0.3) continue;

        await supabase.from("trigger_events").insert({
          zone,
          trigger_type: "OUTAGE",
          severity: String(dd.report_count),
          severity_value: dd.report_count,
          platform,
          metadata: { silent_ping_ratio: ratio, ...dd },
        });

        const hours = Math.min(4, Math.max(1, dd.outage_hours_estimate));
        const payoutCap = Math.min(800, 200 * hours);

        const { data: policies } = await supabase
          .from("policies")
          .select(
            "id, worker_id, max_payout, trigger_outage, workers!inner(zone, platform, shift_type)"
          )
          .eq("status", "ACTIVE");

        const list = (policies ?? []).filter(
          (p: { workers: unknown; trigger_outage: boolean }) => {
            const m = workerMeta(p.workers);
            return (
              m.zone === zone &&
              m.platform === platform &&
              p.trigger_outage &&
              shiftMatchesCurrentIST(
                (m.shift_type ?? "flexible") as
                  | "morning"
                  | "evening"
                  | "night"
                  | "flexible"
              )
            );
          }
        );

        let triggered = 0;
        for (const p of list) {
          const pol = p as { id: string; worker_id: string };
          if (await hasClaimToday(supabase, pol.id, "OUTAGE")) continue;
          const { data: claim, error } = await supabase
            .from("claims")
            .insert({
              policy_id: pol.id,
              worker_id: pol.worker_id,
              trigger_type: "OUTAGE",
              trigger_severity: `${dd.report_count} reports`,
              zone,
              payout_amount: payoutCap,
              status: "TRIGGERED",
            })
            .select("id")
            .single();
          if (!error && claim) {
            triggered++;
            await processClaimPipeline(claim.id);
          }
        }
        summary.outage.push(`${zone}:${platform}:${triggered}`);
      }
    } catch (e) {
      summary.errors.push(`outage ${platform}: ${String(e)}`);
    }
  }

  return NextResponse.json({ ok: true, summary });
}
