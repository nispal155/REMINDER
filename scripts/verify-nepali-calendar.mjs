import { NepaliCalendarService } from '../src/app/core/services/nepali-calendar.service.ts';

// Test harness
const service = new NepaliCalendarService();

console.log('Testing NepaliCalendarService conversions...');

// 1. BS -> AD
const ad1 = service.bsToAd({ year: 2081, month: 1, day: 1 });
const ad1Iso = service.formatAdIso(ad1);
console.log('2081-01-01 BS -> AD:', ad1Iso);
if (ad1Iso !== '2024-04-13') throw new Error(`Expected 2024-04-13, got ${ad1Iso}`);

// 2. AD -> BS
const bs1 = service.adToBs('2024-04-13');
const bs1Iso = service.formatBsIso(bs1);
console.log('2024-04-13 AD -> BS:', bs1Iso);
if (bs1Iso !== '2081-01-01') throw new Error(`Expected 2081-01-01, got ${bs1Iso}`);

// 3. Test 2081-07-28 BS (Kartik 28, 2081)
const ad2 = service.bsToAd({ year: 2081, month: 7, day: 28 });
const ad2Iso = service.formatAdIso(ad2);
console.log('2081-07-28 BS -> AD:', ad2Iso);
if (ad2Iso !== '2024-11-13') throw new Error(`Expected 2024-11-13, got ${ad2Iso}`);

const bs2 = service.adToBs('2024-11-13');
const bs2Iso = service.formatBsIso(bs2);
console.log('2024-11-13 AD -> BS:', bs2Iso);
if (bs2Iso !== '2081-07-28') throw new Error(`Expected 2081-07-28, got ${bs2Iso}`);

// 4. Test 2083-08-28 BS (Mangsir 28, 2083) -> 2026-12-13 AD
const ad3 = service.bsToAd({ year: 2083, month: 8, day: 28 });
const ad3Iso = service.formatAdIso(ad3);
console.log('2083-08-28 BS -> AD:', ad3Iso);
if (ad3Iso !== '2026-12-13') throw new Error(`Expected 2026-12-13, got ${ad3Iso}`);

const bs3 = service.adToBs('2026-12-13');
const bs3Iso = service.formatBsIso(bs3);
console.log('2026-12-13 AD -> BS:', bs3Iso);
if (bs3Iso !== '2083-08-28') throw new Error(`Expected 2083-08-28, got ${bs3Iso}`);

// 5. Validation tests
const v1 = service.validateBsDate(2081, 1, 31);
if (!v1.valid) throw new Error('Baisakh 31 should be valid in 2081');
const v2 = service.validateBsDate(2081, 1, 32);
if (v2.valid) throw new Error('Baisakh 32 should be invalid in 2081 (only 31 days)');
console.log('✓ Validation correctly rejected impossible BS date (Baisakh 32, 2081):', v2.error);

// 6. Festival check
const f1 = service.getFestival({ year: 2081, month: 1, day: 1 });
console.log('✓ Festival on Baisakh 1:', f1?.name);
if (!f1) throw new Error('Expected festival on Baisakh 1');

console.log('All Nepali calendar conversion tests passed with 100% accuracy!');

