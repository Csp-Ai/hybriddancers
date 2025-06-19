const assert = require('assert');
const { forecastBookings } = require('../agents/forecast-agent');

// Build mock bookings for two classes
const bookings = [];
const today = new Date();
today.setHours(0,0,0,0);
for (let i = 0; i < 7; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() - (6 - i));
  const date = d.toISOString().slice(0,10);
  // Ballet has two bookings every day
  bookings.push({ date, classType: 'Ballet' });
  bookings.push({ date, classType: 'Ballet' });
  // Hip Hop only on first three days
  if (i < 3) {
    bookings.push({ date, classType: 'Hip Hop' });
  }
}

const results = forecastBookings(bookings, 7, 30);

const ballet = results.find(r => r.classType === 'Ballet');
assert.ok(ballet, 'Ballet forecast missing');
assert.strictEqual(Math.round(ballet.forecast[0]), 2, 'Ballet forecast should be ~2');

const hiphop = results.find(r => r.classType === 'Hip Hop');
assert.ok(hiphop, 'Hip Hop forecast missing');
assert.strictEqual(hiphop.confidence, 'low', 'Hip Hop confidence should be low due to limited data');

console.log('forecast-agent tests passed');
