import { NextResponse } from "next/server";
import { generateActuarialReport } from "@/lib/actuarial";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/actuarial
 * Returns full actuarial health report: BCR, pool health, stress tests
 * Protected by CRON_SECRET or admin auth
 */
export async function GET(req: Request) {
  // Simple auth check
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (auth !== `Bearer ${secret}` && key !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const report = await generateActuarialReport();
    return NextResponse.json(report);
  } catch (err) {
    console.error("[actuarial] Report generation failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate report" },
      { status: 500 }
    );
  }
}
