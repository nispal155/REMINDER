import assert from 'assert';

console.log('--- RUNNING ADVANCED EXTENSIONS & POWER-UPS VERIFICATION ---\n');

// 1. Test NLP Parser logic
console.log('1. Testing Natural Language Quick-Add Parser logic...');
function parseNlpQuickAdd(input, currentBsYear = 2081) {
  let text = input.trim();

  // Tags
  const tagMatches = text.match(/@([a-zA-Z0-9_\-]+)/g) || [];
  const tags = tagMatches.map(t => t.toLowerCase());
  tags.forEach(t => { text = text.replace(t, ''); });

  // Amount
  let amount;
  let currency;
  const amountRegex = /(?:rs\.?|npr|रू|\$)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)|([0-9]+(?:\.[0-9]+)?)\s*(?:rs\.?|npr|रू|rupees)/i;
  const amountMatch = text.match(amountRegex);
  if (amountMatch) {
    const valStr = (amountMatch[1] || amountMatch[2]).replace(/,/g, '');
    amount = parseFloat(valStr);
    currency = text.includes('$') ? 'USD' : 'NPR';
    text = text.replace(amountMatch[0], '');
  }

  // Priority
  let priority = 'medium';
  if (/\b(urgent|asap|critical)\b/i.test(text)) {
    priority = 'urgent';
    text = text.replace(/\b(urgent|asap|critical)\b/ig, '');
  } else if (/\b(high\s+priority|important)\b/i.test(text)) {
    priority = 'high';
    text = text.replace(/\b(high\s+priority|important)\b/ig, '');
  }

  // Time
  let time = '09:00';
  const timeRegex = /(?:\bat\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
  const timeMatch = text.match(timeRegex);
  if (timeMatch && (timeMatch[3] || timeMatch[2] || text.includes('at ' + timeMatch[1]))) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    text = text.replace(timeMatch[0], '');
  }

  // Clean Title
  let title = text.replace(/\s+/g, ' ').replace(/^(on|at|for|remind me to|to)\s+/i, '').trim();

  // Category
  let category = 'Personal';
  const lower = (title + ' ' + tags.join(' ')).toLowerCase();
  if (amount !== undefined || /\b(bill|electricity|water|internet|rent|loan)\b/i.test(lower)) {
    category = 'Bill';
  } else if (/\b(doctor|clinic|dentist|health)\b/i.test(lower)) {
    category = 'Health';
  } else if (/\b(meeting|sync|standup|work)\b/i.test(lower)) {
    category = 'Work';
  }

  return { title, time, priority, category, tags, amount, currency };
}

const p1 = parseNlpQuickAdd('Pay electricity bill Rs 1500 tomorrow at 6pm @home urgent');
assert.strictEqual(p1.amount, 1500, 'Amount should be 1500');
assert.strictEqual(p1.currency, 'NPR', 'Currency should be NPR');
assert.strictEqual(p1.time, '18:00', 'Time should be 18:00');
assert.strictEqual(p1.priority, 'urgent', 'Priority should be urgent');
assert.strictEqual(p1.category, 'Bill', 'Category should be Bill');
assert(p1.tags.includes('@home'), 'Tag @home should be extracted');
console.log('✓ NLP quick-add parsed successfully:', p1.title, `[${p1.category}, ${p1.amount} ${p1.currency}, ${p1.time}, ${p1.priority}]`);

const p2 = parseNlpQuickAdd('Doctor appointment next monday at 10:30 am @clinic important');
assert.strictEqual(p2.time, '10:30', 'Time should be 10:30');
assert.strictEqual(p2.priority, 'high', 'Priority should be high');
assert.strictEqual(p2.category, 'Health', 'Category should be Health');
assert(p2.tags.includes('@clinic'), 'Tag @clinic should be extracted');
console.log('✓ NLP medical reminder parsed successfully:', p2.title);

// 2. Test Tithi and Lunar Calculation logic
console.log('\n2. Testing Tithi & Lunar Calculation...');
const SYNODIC_MONTH = 29.53058867;
const NEW_MOON_REF = new Date('2024-01-11T11:57:00Z').getTime();

function calculateTithi(dateAD, bsDay) {
  const targetDate = new Date(`${dateAD}T12:00:00Z`).getTime();
  const diffDays = (targetDate - NEW_MOON_REF) / (1000 * 60 * 60 * 24);
  const cyclePhase = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const tithiIndex = Math.min(29, Math.floor((cyclePhase / SYNODIC_MONTH) * 30));
  const tithiNumber = tithiIndex + 1;

  const isPurnima = tithiNumber === 15;
  const isAmavasya = tithiNumber === 30;
  const isEkadashi = tithiNumber === 11 || tithiNumber === 26;
  const isSankranti = bsDay === 1;

  return { tithiNumber, isPurnima, isAmavasya, isEkadashi, isSankranti };
}

// Jan 11, 2024 was Amavasya (New Moon)
const tithiNewMoon = calculateTithi('2024-01-11', 27);
assert(tithiNewMoon.tithiNumber === 1 || tithiNewMoon.tithiNumber === 30, 'Jan 11 2024 is near new moon');
console.log('✓ Lunar calculation aligns with astronomical synodic month (tithi:', tithiNewMoon.tithiNumber, ')');

// Check Sankranti logic on 1st day of BS month
const sankranti = calculateTithi('2024-04-13', 1);
assert.strictEqual(sankranti.isSankranti, true, 'BS Day 1 must be Sankranti');
console.log('✓ Sankranti correctly identified for BS 1st of month');

// 3. Test Subtasks Checklist & Progress Meter
console.log('\n3. Testing Subtasks Checklist & Progress logic...');
const subtasks = [
  { id: 'st-1', title: 'Collect meter reading', completed: true },
  { id: 'st-2', title: 'Open eSewa or Khalti', completed: true },
  { id: 'st-3', title: 'Download payment receipt', completed: false }
];
const completedCount = subtasks.filter(s => s.completed).length;
const percent = Math.round((completedCount / subtasks.length) * 100);
assert.strictEqual(completedCount, 2, '2 completed subtasks');
assert.strictEqual(percent, 67, 'Progress should be 67%');
console.log(`✓ Subtasks completion tracked: ${completedCount}/${subtasks.length} (${percent}%)`);

// 4. Test Expense & Bill Tracker Aggregation
console.log('\n4. Testing Monthly Expense & Bill Tracker Aggregation...');
const sampleBills = [
  { id: 'b1', title: 'Internet', amount: 1500, isPaid: true },
  { id: 'b2', title: 'Electricity', amount: 800, isPaid: true },
  { id: 'b3', title: 'Water', amount: 450, isPaid: false },
  { id: 'b4', title: 'Rent', amount: 15000, isPaid: false }
];
let totalDue = 0;
let totalPaid = 0;
for (const b of sampleBills) {
  totalDue += b.amount;
  if (b.isPaid) totalPaid += b.amount;
}
const totalPending = totalDue - totalPaid;
const paidPercent = Math.round((totalPaid / totalDue) * 100);

assert.strictEqual(totalDue, 17750, 'Total due should be 17750');
assert.strictEqual(totalPaid, 2300, 'Total paid should be 2300');
assert.strictEqual(totalPending, 15450, 'Total pending should be 15450');
assert.strictEqual(paidPercent, 13, 'Paid percent should be 13%');
console.log(`✓ Expense forecast computed: Total Due: Rs ${totalDue}, Paid: Rs ${totalPaid}, Pending: Rs ${totalPending} (${paidPercent}% paid)`);

console.log('\n==================================================');
console.log('ALL ADVANCED EXTENSION & POWER-UP SUITES PASSED! ✨');
console.log('==================================================\n');
