/**
 * Master Verification Suite Runner
 * Runs Phase 2, Phase 3, Phase 4, and Phase 5 verification suites.
 */

import { execSync } from 'child_process';

console.log('====================================================');
console.log('🚀 REMINDER PWA — COMPLETE REGRESSION TEST SUITE');
console.log('====================================================\n');

const suites = [
  { name: 'Phase 2: Calendar & Reminders', script: 'node scripts/verify-phase2.mjs' },
  { name: 'Phase 3: Notifications & Scheduler', script: 'node scripts/verify-phase3.mjs' },
  { name: 'Phase 4: Google Drive Sync & Backups', script: 'node scripts/verify-phase4.mjs' },
  { name: 'Phase 5: Advanced Features & Production', script: 'node scripts/verify-phase5.mjs' },
  { name: 'Extensions: NLP, Tithi, Subtasks & Expense Forecast', script: 'node scripts/verify-extensions.mjs' }
];

let allPassed = true;

for (const suite of suites) {
  console.log(`\n▶ Running ${suite.name}...`);
  try {
    const output = execSync(suite.script, { stdio: 'inherit' });
    console.log(`✔ ${suite.name} completed successfully.`);
  } catch (err) {
    console.error(`✖ ${suite.name} FAILED!`);
    allPassed = false;
    process.exit(1);
  }
}

if (allPassed) {
  console.log('\n====================================================');
  console.log('🎉 ALL 4 PHASES VERIFIED AND PASSED WITH 100% SUCCESS');
  console.log('====================================================\n');
}

