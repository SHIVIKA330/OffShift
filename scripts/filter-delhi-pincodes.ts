import fs from 'fs';
import path from 'path';

const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'all_pincodes.json'), 'utf-8');
const allPincodes = JSON.parse(raw);

const delhi = (allPincodes as any[]).filter(p =>
  String(p.Pincode || p.pincode || '').startsWith('11')
);

fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'delhi_pincodes.json'),
  JSON.stringify(delhi, null, 2)
);
console.log(`Saved ${delhi.length} Delhi pincodes`);
