const fs = require('fs');
const files = [
  'app/admin/actuarial/page.tsx',
  'app/api/earnings-intelligence/route.ts',
  'app/api/voice-assistant/route.ts',
  'lib/fraud-engine.ts',
  'lib/pricing-engine.ts',
  'lib/ring-detector.ts',
  'lib/trigger-oracle.ts',
  'lib/wellness-score.ts',
  'lib/payout-calculator.ts',
  'lib/advisory-engine.ts'
];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\\`/g, '`');
    content = content.replace(/\\\${/g, '${');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  } catch (err) {
    console.error(`Error: ${file}`);
  }
}
