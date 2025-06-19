const assert = require('assert');
const { detectTrends } = require('../agents/trends-agent');

// create mock bookings for 60 days
const bookings = [];
const today = new Date();
today.setHours(0,0,0,0);
for (let i = 0; i < 60; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() - (59 - i));
  const date = d.toISOString().slice(0,10);
  const jazzCount = i < 30 ? 2 : 4; // upward trend for Jazz Fusion
  for (let j = 0; j < jazzCount; j++) {
    bookings.push({ date, classType: 'Jazz Fusion', instructor: 'Alice' });
  }
  bookings.push({ date, classType: 'Hip Hop', instructor: 'Bob' }); // constant
}

const results = detectTrends(bookings, [60]);
assert.ok(results.some(r => r.includes('Jazz Fusion') && r.includes('increased')), 'should detect upward trend');
console.log('trends-agent tests passed');
