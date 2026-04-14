import { kavachPricing, KavachInput } from '@/lib/kavach/pricing';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as KavachInput;
    const result = await kavachPricing(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Ensure we don't log null rider_id if not provided, just generate random uuid or skip rider_id insert constraint
    // The migration for kavach_quotes has rider_id as a UUID.
    
    await supabase.from('kavach_quotes').insert({
      rider_id: body.rider_id || process.env.DEMO_UUID || "00000000-0000-0000-0000-000000000000",
      pincode: body.pincode,
      season: result.season,
      days_to_event: body.daysUntilEvent,
      base_premium: result.basePremium,
      kavach_multiplier: result.multiplier,
      final_premium: result.finalPremium,
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
