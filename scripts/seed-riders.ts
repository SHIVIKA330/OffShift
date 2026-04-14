import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure .env.local is loaded. Run with:');
  console.error('  npx dotenv -e .env.local -- npx ts-node scripts/seed-riders.ts');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ZONES = ['Okhla', 'Gurgaon', 'Noida', 'Dwarka', 'Rohini', 'Lajpat Nagar'];
const PINCODES: Record<string, string> = {
  Okhla: '110020', Gurgaon: '122001', Noida: '201301',
  Dwarka: '110075', Rohini: '110085', 'Lajpat Nagar': '110024'
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  console.log('🚀 Seeding 500 riders...');

  const riders = Array.from({ length: 500 }, (_, i) => {
    const type = i < 300 ? 'full_time' : i < 425 ? 'part_time' : 'casual';
    const isMultiApping = Math.random() < 0.3;
    const activeDays = type === 'full_time' ? randomInt(200, 280)
      : type === 'part_time' ? randomInt(80, 150)
      : randomInt(20, 60);
    const zone = ZONES[i % ZONES.length];

    return {
      name: `Rider ${i + 1}`,
      phone: `+9198${String(i).padStart(8, '0')}`,
      zone,
      pincode: PINCODES[zone],
      platform: isMultiApping ? 'both' : Math.random() > 0.5 ? 'zomato' : 'swiggy',
      active_days: activeDays,
      is_multi_apping: isMultiApping,
    };
  });

  // Insert riders in batches of 100 to avoid payload limits
  const BATCH = 100;
  const allInserted: { id: string }[] = [];

  for (let b = 0; b < riders.length; b += BATCH) {
    const batch = riders.slice(b, b + BATCH);
    const { data, error } = await supabase
      .from('riders')
      .insert(batch.map(r => ({ name: r.name, phone: r.phone, zone: r.zone, pincode: r.pincode })))
      .select('id');

    if (error) {
      console.error(`Rider insert batch ${b / BATCH + 1} failed:`, error);
      return;
    }
    allInserted.push(...(data || []));
    console.log(`  ✓ Inserted rider batch ${b / BATCH + 1}/${Math.ceil(riders.length / BATCH)}`);
  }

  console.log(`📊 Total riders inserted: ${allInserted.length}`);

  // Insert engagement records in batches
  for (let b = 0; b < allInserted.length; b += BATCH) {
    const engBatch = allInserted.slice(b, b + BATCH).map((r, idx) => {
      const riderIdx = b + idx;
      return {
        rider_id: r.id,
        platform: riders[riderIdx].platform,
        active_days_current_fy: riders[riderIdx].active_days,
        is_multi_apping: riders[riderIdx].is_multi_apping,
      };
    });

    const { error } = await supabase.from('rider_engagement').insert(engBatch);
    if (error) {
      console.error(`Engagement insert batch ${b / BATCH + 1} failed:`, error);
      return;
    }
    console.log(`  ✓ Inserted engagement batch ${b / BATCH + 1}/${Math.ceil(allInserted.length / BATCH)}`);
  }

  console.log('✅ Seeded 500 riders + engagement records');
}

seed().catch(console.error);
