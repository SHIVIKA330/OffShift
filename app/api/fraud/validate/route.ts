import { runFraudValidation } from '@/lib/fraud/validator';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { rider_id, claim_zone, recent_pings, claim_history } = await req.json();
    const result = await runFraudValidation(rider_id, claim_zone, recent_pings || [], claim_history || []);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
